import crypto from "node:crypto";

import { Redis } from "@upstash/redis";

import type { Job, SubmissionPayload, UploadKind } from "@/lib/hireflow/types";
import { hasR2Config } from "@/lib/server/r2";

type OtpRecord = {
  code: string;
  email: string;
  expiresAt: number;
  verified: boolean;
};

type UploadTokenRecord = {
  token: string;
  assetKey: string;
  storageKey: string;
  kind: UploadKind;
  filename: string;
  contentType: string;
  size: number;
};

type UploadedBodyRecord = {
  base64: string;
  contentType: string;
  size: number;
};

export type UploadRecord = {
  assetKey: string;
  storageKey: string;
  kind: UploadKind;
  filename: string;
  contentType: string;
  size: number;
  createdAt: number;
  devDataBase64?: string;
};

type PersistedSubmissionInput = Omit<SubmissionPayload, "turnstileToken"> & {
  jobTitle: Job["title"];
  department: Job["department"];
  team: Job["team"];
  category: Job["category"];
  locationLabel: Job["locationLabel"];
  level: Job["level"];
  applyEmail: Job["applyEmail"];
};

type SubmissionRecord = PersistedSubmissionInput & {
  submittedAt: string;
  referenceId: string;
};

type MemoryValue = {
  value: unknown;
  expiresAt: number | null;
};

type MemoryStore = Map<string, MemoryValue>;

declare global {
  var __hireflowMemoryStore: MemoryStore | undefined;
}

const OTP_TTL_SECONDS = 60 * 10;
const UPLOAD_TTL_SECONDS = 60 * 15;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

function getMemoryStore() {
  return (globalThis.__hireflowMemoryStore ??= new Map<string, MemoryValue>());
}

async function setRecord(key: string, value: unknown, ttlSeconds?: number) {
  const redis = getRedis();
  if (redis) {
    if (ttlSeconds) {
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    }

    await redis.set(key, value);
    return;
  }

  getMemoryStore().set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

async function getRecord<T>(key: string) {
  const redis = getRedis();
  if (redis) {
    return (await redis.get<T>(key)) ?? null;
  }

  const entry = getMemoryStore().get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    getMemoryStore().delete(key);
    return null;
  }

  return entry.value as T;
}

async function deleteRecord(key: string) {
  const redis = getRedis();
  if (redis) {
    await redis.del(key);
    return;
  }

  getMemoryStore().delete(key);
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function storageKeyFor(record: { assetKey: string; kind: UploadKind; filename: string }) {
  const datePrefix = new Date().toISOString().slice(0, 10);
  return `${record.kind}/${datePrefix}/${record.assetKey}-${sanitizeFilename(record.filename)}`;
}

export async function createOtp(email: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const normalizedEmail = email.toLowerCase();
  await setRecord(
    `otp:${normalizedEmail}`,
    {
      code,
      email: normalizedEmail,
      expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
      verified: false,
    } satisfies OtpRecord,
    OTP_TTL_SECONDS,
  );
  return code;
}

export async function verifyOtp(email: string, code: string) {
  const normalizedEmail = email.toLowerCase();
  const record = await getRecord<OtpRecord>(`otp:${normalizedEmail}`);
  if (!record) {
    return { ok: false, message: "这个邮箱还没有发送过验证码。" };
  }
  if (record.expiresAt < Date.now()) {
    return { ok: false, message: "验证码已过期，请重新发送。" };
  }
  if (record.code !== code) {
    return { ok: false, message: "验证码不正确。" };
  }

  const updatedRecord: OtpRecord = {
    ...record,
    verified: true,
  };

  await setRecord(`otp:${normalizedEmail}`, updatedRecord, Math.max(1, Math.floor((record.expiresAt - Date.now()) / 1000)));

  return { ok: true, message: "邮箱验证成功。" };
}

export async function isOtpVerified(email: string) {
  const record = await getRecord<OtpRecord>(`otp:${email.toLowerCase()}`);
  return Boolean(record?.verified && record.expiresAt > Date.now());
}

export async function issueUploadToken(input: {
  kind: UploadKind;
  filename: string;
  contentType: string;
  size: number;
}) {
  const token = crypto.randomUUID();
  const assetKey = crypto.randomUUID();
  const record: UploadTokenRecord = {
    token,
    assetKey,
    storageKey: storageKeyFor({
      assetKey,
      kind: input.kind,
      filename: input.filename,
    }),
    kind: input.kind,
    filename: sanitizeFilename(input.filename),
    contentType: input.contentType,
    size: input.size,
  };

  await setRecord(`upload:token:${token}`, record, UPLOAD_TTL_SECONDS);

  return record;
}

export async function getUploadToken(token: string) {
  return getRecord<UploadTokenRecord>(`upload:token:${token}`);
}

export async function storeLocalUploadBody(token: string, bytes: ArrayBuffer, contentType: string) {
  await setRecord(
    `upload:body:${token}`,
    {
      base64: Buffer.from(bytes).toString("base64"),
      contentType,
      size: bytes.byteLength,
    } satisfies UploadedBodyRecord,
    UPLOAD_TTL_SECONDS,
  );
}

export async function confirmUploadToken(token: string) {
  const record = await getRecord<UploadTokenRecord>(`upload:token:${token}`);
  if (!record) {
    throw new Error("上传令牌无效或已过期。");
  }

  const localBody = await getRecord<UploadedBodyRecord>(`upload:body:${token}`);
  if (!hasR2Config() && !localBody) {
    throw new Error("文件上传内容缺失，请重新上传。");
  }

  const uploadRecord: UploadRecord = {
    assetKey: record.assetKey,
    storageKey: record.storageKey,
    kind: record.kind,
    filename: record.filename,
    contentType: record.contentType,
    size: record.size,
    createdAt: Date.now(),
    devDataBase64: localBody?.base64,
  };

  await setRecord(`upload:asset:${record.assetKey}`, uploadRecord);
  await deleteRecord(`upload:token:${token}`);
  await deleteRecord(`upload:body:${token}`);

  return uploadRecord;
}

export async function getUploadByKey(assetKey: string) {
  return getRecord<UploadRecord>(`upload:asset:${assetKey}`);
}

export async function persistSubmission(submission: PersistedSubmissionInput) {
  const referenceId = crypto.randomUUID();
  const record: SubmissionRecord = {
    ...submission,
    referenceId,
    submittedAt: new Date().toISOString(),
  };

  await setRecord(`submission:${referenceId}`, record);
  return record;
}
