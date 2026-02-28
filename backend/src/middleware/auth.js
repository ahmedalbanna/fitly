const jwt = require('jsonwebtoken');

/**
 * Middleware: verifies JWT and attaches user to req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: checks subscription status (trial or active subscription required)
 * Attaches req.subscriptionStatus for downstream use.
 */
async function requireSubscription(req, res, next) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const userId = req.user.id;

    const [subscription, trialStatus] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId } }),
      prisma.trialStatus.findUnique({ where: { userId } }),
    ]);

    const now = new Date();

    // Check active subscription
    if (
      subscription &&
      subscription.status === 'ACTIVE' &&
      subscription.endDate > now
    ) {
      req.subscriptionStatus = 'SUBSCRIBER';
      return next();
    }

    // Check active trial
    if (
      trialStatus &&
      trialStatus.used &&
      trialStatus.activatedAt &&
      trialStatus.expiresAt &&
      trialStatus.expiresAt > now
    ) {
      req.subscriptionStatus = 'TRIAL_ACTIVE';
      return next();
    }

    return res.status(403).json({
      error: 'Subscription required',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { authenticate, requireSubscription };
