import { NextResponse } from "next/server";

import { verifyOtp } from "@/lib/server/runtime-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; code?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const code = body?.code?.trim();

  if (!email || !code) {
    return NextResponse.json({ message: "邮箱和验证码不能为空。" }, { status: 400 });
  }

  const result = await verifyOtp(email, code);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ message: result.message });
}
