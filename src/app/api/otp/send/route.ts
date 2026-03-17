import { NextResponse } from "next/server";

import { APP_BRAND } from "@/lib/hireflow/config";
import { sendEmail } from "@/lib/server/email";
import { createOtp } from "@/lib/server/runtime-store";
import { verifyTurnstile } from "@/lib/server/turnstile";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; turnstileToken?: string } | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json({ message: "请输入有效的邮箱地址。" }, { status: 400 });
  }

  const turnstile = await verifyTurnstile(body?.turnstileToken ?? "", request.headers.get("x-forwarded-for"));
  if (!turnstile.ok) {
    return NextResponse.json({ message: "请先完成人机验证后再发送验证码。" }, { status: 403 });
  }

  const code = await createOtp(email);

  try {
    const emailResult = await sendEmail({
      to: email,
      subject: `${APP_BRAND} 邮箱验证码`,
      text: `你的 ${APP_BRAND} 验证码是 ${code}，10 分钟内有效。`,
      html: `<div style="font-family:Arial,sans-serif"><p>你的 <strong>${APP_BRAND}</strong> 验证码是：</p><p style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</p><p>10 分钟内有效。</p></div>`,
    });

    return NextResponse.json({
      message: emailResult.preview ? "当前是预览模式，可直接使用下方验证码进行本地测试。" : "验证码已发送，请检查邮箱。",
      previewCode: emailResult.preview ? code : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "验证码发送失败。",
      },
      { status: 500 },
    );
  }
}
