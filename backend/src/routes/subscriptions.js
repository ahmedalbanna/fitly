const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');

router.use(authenticate);

/**
 * GET /subscriptions/status
 * Returns user's current subscription/trial state
 * States: GUEST, REGISTERED, TRIAL_ACTIVE, TRIAL_EXPIRED, SUBSCRIBER
 */
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [subscription, trialStatus] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId } }),
      prisma.trialStatus.findUnique({ where: { userId } }),
    ]);

    // Active subscription
    if (subscription && subscription.status === 'ACTIVE' && subscription.endDate > now) {
      return res.json({
        status: 'SUBSCRIBER',
        subscriptionType: subscription.type,
        endDate: subscription.endDate,
      });
    }

    // Trial active
    if (trialStatus?.used && trialStatus.expiresAt && trialStatus.expiresAt > now) {
      return res.json({
        status: 'TRIAL_ACTIVE',
        trialExpiresAt: trialStatus.expiresAt,
      });
    }

    // Trial expired
    if (trialStatus?.used && trialStatus.expiresAt && trialStatus.expiresAt <= now) {
      return res.json({ status: 'TRIAL_EXPIRED' });
    }

    // Registered but never activated trial
    return res.json({
      status: 'REGISTERED',
      trialAvailable: !trialStatus?.used,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /subscriptions/trial/activate
 * Activates the 24-hour free trial (once per user)
 */
router.post('/trial/activate', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const trialStatus = await prisma.trialStatus.findUnique({ where: { userId } });
    if (!trialStatus) {
      return res.status(404).json({ error: 'Trial record not found' });
    }
    if (trialStatus.used) {
      return res.status(400).json({ error: 'Free trial has already been used' });
    }

    const hours = parseInt(process.env.TRIAL_DURATION_HOURS || '24');
    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt.getTime() + hours * 60 * 60 * 1000);

    const updated = await prisma.trialStatus.update({
      where: { userId },
      data: { used: true, activatedAt, expiresAt },
    });

    res.json({
      message: 'Free trial activated!',
      activatedAt: updated.activatedAt,
      expiresAt: updated.expiresAt,
      status: 'TRIAL_ACTIVE',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /subscriptions/subscribe
 * Body: { type: "MONTHLY" | "ANNUAL" }
 * Mock subscription (real implementation would use RevenueCat/Stripe)
 */
router.post('/subscribe', async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!type || !['MONTHLY', 'ANNUAL'].includes(type)) {
      return res.status(400).json({ error: 'type must be MONTHLY or ANNUAL' });
    }

    const userId = req.user.id;
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (type === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: { type, status: 'ACTIVE', startDate, endDate },
      create: { userId, type, status: 'ACTIVE', startDate, endDate },
    });

    res.json({
      message: 'Subscription activated successfully',
      subscription: {
        type: subscription.type,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /subscriptions/restore
 * Mock restore purchase endpoint
 */
router.post('/restore', async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    if (!subscription || subscription.endDate < new Date()) {
      return res.json({ message: 'No active subscription found to restore', restored: false });
    }

    res.json({
      message: 'Subscription restored successfully',
      restored: true,
      subscription: {
        type: subscription.type,
        status: subscription.status,
        endDate: subscription.endDate,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
