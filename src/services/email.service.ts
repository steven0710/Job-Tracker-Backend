import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(toEmail: string, token: string) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "noreply@steven0710-job-tracker.com",
    to: toEmail,
    subject: "Verify your email",
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. This link expires in 24 hours.</p>`,
  });
}

export async function sendForgotPasswordEmail(toEmail: string, token: string) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "noreply@steven0710-job-tracker.com",
    to: toEmail,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 24 hours.</p>`,
  });
}
