const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/email');

// Generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /auth/signup
 * Body: { email, password, phone? }
 * Creates user, sends OTP
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, phone: phone || null },
    });

    // Create trial status record (not yet activated)
    await prisma.trialStatus.create({ data: { userId: user.id, used: false } });

    // Generate and store OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES || '15')) * 60 * 1000);
    await prisma.otpToken.create({ data: { userId: user.id, code: otp, expiresAt } });

    // Send OTP email (non-blocking on failure for dev)
    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.warn('Email sending failed (dev mode):', emailErr.message);
    }

    res.status(201).json({
      message: 'Account created. Please verify your email with the OTP sent.',
      userId: user.id,
      // In dev/test, return the OTP directly so it can be used without email
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/verify-otp
 * Body: { userId, otp }
 * Verifies OTP → activates account → returns JWT
 */
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ error: 'userId and otp are required' });
    }

    const token = await prisma.otpToken.findFirst({
      where: { userId, code: otp, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used & verify user email
    await prisma.$transaction([
      prisma.otpToken.update({ where: { id: token.id }, data: { used: true } }),
      prisma.user.update({ where: { id: userId }, data: { emailVerified: true } }),
    ]);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Create main profile if it doesn't exist yet
    const existingProfile = await prisma.profile.findFirst({ where: { userId, isMain: true } });
    if (!existingProfile) {
      await prisma.profile.create({
        data: { userId, name: user.email.split('@')[0], isMain: true },
      });
    }

    const jwt_token = generateToken(user);
    res.json({
      message: 'Email verified successfully',
      token: jwt_token,
      user: { id: user.id, email: user.email, emailVerified: true },
      showTrialPrompt: true, // Signal to frontend to show trial activation popup
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/resend-otp
 * Body: { userId }
 */
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES || '15')) * 60 * 1000);
    await prisma.otpToken.create({ data: { userId, code: otp, expiresAt } });

    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailErr) {
      console.warn('Email sending failed:', emailErr.message);
    }

    res.json({
      message: 'OTP resent',
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
        userId: user.id,
      });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, phone: user.phone },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/forgot-password
 * Body: { email }
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.resetToken.create({ data: { userId: user.id, token: resetToken, expiresAt } });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    try {
      await sendPasswordResetEmail(email, resetLink);
    } catch (emailErr) {
      console.warn('Email sending failed:', emailErr.message);
    }

    res.json({
      message: 'If that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' && { devResetLink: resetLink }),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/reset-password
 * Body: { token, newPassword }
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const resetToken = await prisma.resetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.resetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
    ]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /auth/account
 * Deletes the authenticated user's account (legal requirement)
 */
const { authenticate } = require('../middleware/auth');
router.delete('/account', authenticate, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
