// ── emailService.js ───────────────────────────────────────────────────────────
// Gmail SMTP via nodemailer
// Setup: GMAIL_USER + GMAIL_PASS (App Password) in server/.env

const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
};

exports.sendPasswordResetEmail = async ({ toEmail, toName, resetLink }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`\n📧 [DEV MODE] Password reset for ${toEmail}:\n${resetLink}\n`);
    return { sent: false };
  }

  const year = new Date().getFullYear();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#2563EB,#10B981);padding:32px 40px;text-align:center;">
    <div style="background:rgba(255,255,255,0.2);width:52px;height:52px;border-radius:14px;margin:0 auto 10px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;">₹</div>
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Expensly</h1>
    <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Smart Money Management</p>
  </div>
  <div style="padding:36px 40px;">
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Reset your password 🔐</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
      Hi ${toName || 'there'},<br><br>
      We received a request to reset your Expensly password. Click below to set a new one.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#10B981);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;">
        Reset My Password →
      </a>
    </div>
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin:24px 0;">
      <p style="margin:0;color:#92400e;font-size:13px;">⏰ <strong>This link expires in 1 hour.</strong><br>If you didn't request this, ignore this email.</p>
    </div>
    <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;line-height:1.6;">
      If the button doesn't work, copy this link:<br>
      <a href="${resetLink}" style="color:#2563EB;word-break:break-all;">${resetLink}</a>
    </p>
  </div>
  <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;color:#94a3b8;font-size:12px;">© ${year} Expensly · Built for India 🇮🇳</p>
  </div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"Expensly" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Reset Your Expensly Password',
    html,
    text: `Hi ${toName || 'there'},\n\nReset your Expensly password:\n${resetLink}\n\nExpires in 1 hour.`,
  });

  return { sent: true };
};
