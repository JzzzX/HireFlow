import { NextResponse } from "next/server";

import { assertR2ObjectExists, hasR2Config } from "@/lib/server/r2";
import { confirmUploadToken, getUploadToken, storeLocalUploadBody } from "@/lib/server/runtime-store";

export async function PUT(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ message: "缺少上传凭证。" }, { status: 400 });
  }

  try {
    if (hasR2Config()) {
      return NextResponse.json({ message: "当前环境不接受经由应用服务器上传文件。" }, { status: 405 });
    }

    const bytes = await request.arrayBuffer();
    await storeLocalUploadBody(token, bytes, request.headers.get("content-type") ?? "application/octet-stream");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "文件暂存失败。",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim();

  if (!token) {
    return NextResponse.json({ message: "缺少上传凭证。" }, { status: 400 });
  }

  try {
    if (hasR2Config()) {
      const tokenRecord = await getUploadToken(token);
      if (!tokenRecord) {
        return NextResponse.json({ message: "上传令牌无效或已过期。" }, { status: 400 });
      }

      await assertR2ObjectExists(tokenRecord.storageKey);
    }

    const upload = await confirmUploadToken(token);

    return NextResponse.json({
      assetKey: upload.assetKey,
      assetUrl: `/api/uploads/file/${upload.assetKey}`,
      contentType: upload.contentType,
      filename: upload.filename,
      size: upload.size,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "文件确认失败。",
      },
      { status: 400 },
    );
  }
}
