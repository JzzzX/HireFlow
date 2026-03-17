import { NextResponse } from "next/server";

import { MAX_RESUME_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } from "@/lib/hireflow/config";
import type { UploadKind } from "@/lib/hireflow/types";
import { getPresignedUploadUrl, hasR2Config } from "@/lib/server/r2";
import { issueUploadToken } from "@/lib/server/runtime-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        kind?: UploadKind;
        filename?: string;
        contentType?: string;
        size?: number;
      }
    | null;

  const kind = body?.kind;
  const filename = body?.filename?.trim();
  const contentType = body?.contentType?.trim() || "application/octet-stream";
  const size = body?.size;

  if (!kind || !filename || typeof size !== "number") {
    return NextResponse.json({ message: "上传参数不完整。" }, { status: 400 });
  }

  if (kind === "resume") {
    if (contentType !== "application/pdf") {
      return NextResponse.json({ message: "简历必须为 PDF 文件。" }, { status: 400 });
    }
    if (size > MAX_RESUME_SIZE_BYTES) {
      return NextResponse.json({ message: "简历大小不能超过 10 MB。" }, { status: 400 });
    }
  }

  if (kind === "video") {
    if (!contentType.startsWith("video/")) {
      return NextResponse.json({ message: "视频格式不受支持。" }, { status: 400 });
    }
    if (size > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json({ message: "视频文件过大，超出当前原型限制。" }, { status: 400 });
    }
  }

  const tokenRecord = await issueUploadToken({
    kind,
    filename,
    contentType,
    size,
  });

  return NextResponse.json({
    token: tokenRecord.token,
    assetKey: tokenRecord.assetKey,
    uploadUrl: hasR2Config()
      ? await getPresignedUploadUrl(tokenRecord.storageKey, contentType)
      : `/api/uploads/ingest?token=${encodeURIComponent(tokenRecord.token)}`,
  });
}
