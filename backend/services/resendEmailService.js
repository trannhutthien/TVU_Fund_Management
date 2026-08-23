import { Resend } from 'resend';

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

export const isResendConfigured = () => {
  return !!process.env.RESEND_API_KEY?.trim();
};

export const sendViaResend = async ({ to, subject, html }) => {
  const client = getResendClient();
  const from = 'TVU Fund <onboarding@resend.dev>';

  await client.emails.send({
    from,
    to,
    subject,
    html,
  });
};
