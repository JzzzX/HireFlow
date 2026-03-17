import { NextResponse } from "next/server";

import { getPresignedDownloadUrl, hasR2Config } from "@/lib/server/r2";
import { getUploadByKey } from "@/lib/server/runtime-store";

export async function GET(_: Request, context: { params: Promise<{ assetKey: string }> }) {
  const { assetKey } = await context.params;
  const upload = await getUploadByKey(assetKey);

  if (!upload) {
    return NextResponse.json({ message: "文件不存在。" }, { status: 404 });
  }

  if (hasR2Config()) {
    const downloadUrl = await getPresignedDownloadUrl(upload.storageKey, upload.filename);
    return NextResponse.redirect(downloadUrl, { status: 302 });
  }

  if (!upload.devDataBase64) {
    return NextResponse.json({ message: "文件内容不可用。" }, { status: 404 });
  }

  const file = Buffer.from(upload.devDataBase64, "base64");

  return new NextResponse(file, {
    headers: {
      "Content-Type": upload.contentType,
      "Content-Disposition": `inline; filename="${upload.filename}"`,
      "Content-Length": String(file.length),
    },
  });
}
