type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "即刻招聘 <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[hireflow-email-preview]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { ok: true as const, preview: true as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Email provider rejected the request: ${details}`);
  }

  return { ok: true as const, preview: false as const };
}
