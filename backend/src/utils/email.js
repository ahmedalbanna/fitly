const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP verification email
 */
async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'FITLY <noreply@fitly.app>',
    to,
    subject: 'FITLY - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #6C63FF; text-align: center;">FITLY</h2>
        <h3 style="text-align: center;">Email Verification</h3>
        <p>Your verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center; color: #6C63FF; margin: 24px 0;">${otp}</div>
        <p style="color: #888;">This code expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(to, resetLink) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'FITLY <noreply@fitly.app>',
    to,
    subject: 'FITLY - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #6C63FF; text-align: center;">FITLY</h2>
        <h3 style="text-align: center;">Reset Your Password</h3>
        <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background: #6C63FF; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #888;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail, sendPasswordResetEmail };
