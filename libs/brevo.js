function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

export async function sendTransactionalEmail({ to, name, subject, actionUrl, actionLabel, purpose }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey || !senderEmail || !senderName) {
    throw new Error('Transactional email service is not configured.');
  }

  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(actionUrl);
  const safeLabel = escapeHtml(actionLabel);
  const safePurpose = escapeHtml(purpose);
  const htmlContent = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;background:#080b16;color:#e5e7eb;font-family:Arial,sans-serif">
        <main style="max-width:560px;margin:32px auto;padding:32px;background:#111827;border:1px solid #293247;border-radius:20px">
          <p style="color:#67e8f9;font-weight:700;letter-spacing:.08em">ONEME</p>
          <h1 style="font-size:24px;color:#fff">Your identity. One link.</h1>
          <p>Hello ${safeName},</p>
          <p>Use the button below to ${safePurpose}. This link expires in one hour and can only be used once.</p>
          <p style="margin:28px 0">
            <a href="${safeUrl}" style="display:inline-block;padding:13px 20px;background:#06b6d4;color:#07111d;text-decoration:none;font-weight:700;border-radius:10px">${safeLabel}</a>
          </p>
          <p style="font-size:13px;color:#9ca3af">If you did not request this, you can ignore this message.</p>
        </main>
      </body>
    </html>
  `;

  let response;
  try {
    response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to, name }],
        subject,
        htmlContent,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new Error('Transactional email provider could not be reached.');
  }

  if (!response.ok) {
    throw new Error('Transactional email provider rejected the message.');
  }
}
