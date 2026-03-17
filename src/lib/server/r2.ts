import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PRESIGNED_UPLOAD_EXPIRES = 60 * 15;
const PRESIGNED_DOWNLOAD_EXPIRES = 60 * 60 * 24 * 7;

type StorageProviderConfig =
  | {
      provider: "cos";
      bucketName: string;
      region: string;
      endpoint: string;
      accessKeyId: string;
      secretAccessKey: string;
    }
  | {
      provider: "r2";
      bucketName: string;
      region: string;
      endpoint: string;
      accessKeyId: string;
      secretAccessKey: string;
    };

function readStorageConfig(): StorageProviderConfig | null {
  const cosBucketName = process.env.COS_BUCKET_NAME;
  const cosRegion = process.env.COS_REGION;
  const cosSecretId = process.env.COS_SECRET_ID;
  const cosSecretKey = process.env.COS_SECRET_KEY;

  if (cosBucketName && cosRegion && cosSecretId && cosSecretKey) {
    return {
      provider: "cos",
      bucketName: cosBucketName,
      region: cosRegion,
      endpoint: process.env.COS_ENDPOINT ?? `https://cos.${cosRegion}.myqcloud.com`,
      accessKeyId: cosSecretId,
      secretAccessKey: cosSecretKey,
    };
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  return {
    provider: "r2",
    bucketName,
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
  };
}

export function hasR2Config() {
  return Boolean(readStorageConfig());
}

function getR2Client() {
  const config = readStorageConfig();
  if (!config) {
    throw new Error("对象存储环境变量未配置完整。");
  }

  return {
    bucketName: config.bucketName,
    client: new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.provider === "cos" ? false : undefined,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  };
}

export async function getPresignedUploadUrl(storageKey: string, contentType: string) {
  const { client, bucketName } = getR2Client();
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
      ContentType: contentType,
    }),
    { expiresIn: PRESIGNED_UPLOAD_EXPIRES },
  );
}

export async function getPresignedDownloadUrl(storageKey: string, filename?: string) {
  const { client, bucketName } = getR2Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
      ResponseContentDisposition: filename ? `inline; filename="${filename}"` : undefined,
    }),
    { expiresIn: PRESIGNED_DOWNLOAD_EXPIRES },
  );
}

export async function assertR2ObjectExists(storageKey: string) {
  const { client, bucketName } = getR2Client();
  await client.send(
    new HeadObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
    }),
  );
}
