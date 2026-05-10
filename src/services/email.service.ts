import { Resend } from "resend";

export async function sendVerificationEmail(toEmail: string, token: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: toEmail,
    subject: "Verify your email",
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. This link expires in 24 hours.</p>`,
  });
}
