const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA";

function getTurnstileSecret() {
  return process.env.TURNSTILE_SECRET_KEY || (process.env.NODE_ENV === "production" ? null : TURNSTILE_TEST_SECRET);
}

export async function verifyTurnstile(token: string, remoteIp?: string | null) {
  const secret = getTurnstileSecret();

  if (!secret) {
    throw new Error("Turnstile 服务端密钥未配置。");
  }

  if (!token?.trim()) {
    return {
      ok: false,
      message: "请先完成人机验证。",
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Turnstile 校验服务暂时不可用。");
  }

  const data = (await response.json()) as {
    success?: boolean;
    "error-codes"?: string[];
  };

  return {
    ok: Boolean(data.success),
    message: data.success ? "验证通过。" : `人机验证失败：${(data["error-codes"] ?? []).join(", ") || "unknown_error"}`,
  };
}
