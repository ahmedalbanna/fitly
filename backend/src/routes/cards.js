const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');

/**
 * Generate card data from the latest measurement of a profile
 */
function generateCardData(profile, measurement) {
  return {
    profileId: profile.id,
    profileName: profile.name,
    gender: profile.gender,
    generatedAt: new Date().toISOString(),
    measurements: {
      height: measurement?.height ?? null,
      weight: measurement?.weight ?? null,
      chest: measurement?.chest ?? null,
      waist: measurement?.waist ?? null,
      hip: measurement?.hip ?? null,
      armLength: measurement?.armLength ?? null,
      legLength: measurement?.legLength ?? null,
      shoeSize: measurement?.shoeSize ?? null,
    },
    summary: buildSummary(measurement),
  };
}

function buildSummary(m) {
  if (!m) return 'No measurements recorded yet.';
  const parts = [];
  if (m.height) parts.push(`Height: ${m.height} cm`);
  if (m.weight) parts.push(`Weight: ${m.weight} kg`);
  if (m.chest) parts.push(`Chest: ${m.chest} cm`);
  if (m.waist) parts.push(`Waist: ${m.waist} cm`);
  if (m.hip) parts.push(`Hip: ${m.hip} cm`);
  return parts.join(' | ') || 'Measurements incomplete.';
}

router.use('/share', (req, res, next) => next()); // public route below

// Authenticated routes
router.use(authenticate);

/**
 * GET /cards
 * Returns all cards for the authenticated user (all their profiles)
 */
router.get('/', async (req, res, next) => {
  try {
    const profiles = await prisma.profile.findMany({ where: { userId: req.user.id } });
    const profileIds = profiles.map((p) => p.id);

    const cards = await prisma.card.findMany({
      where: { profileId: { in: profileIds } },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /cards/:profileId
 * Generate (or regenerate) a card for a profile
 */
router.post('/:profileId', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({
      where: { id: req.params.profileId, userId: req.user.id },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Get latest measurement
    const measurement = await prisma.measurement.findFirst({
      where: { profileId: profile.id },
      orderBy: { recordedAt: 'desc' },
    });

    const cardData = generateCardData(profile, measurement);

    // Upsert: one card per profile
    const existingCard = await prisma.card.findFirst({ where: { profileId: profile.id } });

    let card;
    if (existingCard) {
      card = await prisma.card.update({
        where: { id: existingCard.id },
        data: { data: cardData },
      });
    } else {
      card = await prisma.card.create({
        data: { profileId: profile.id, data: cardData },
      });
    }

    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /cards/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const card = await prisma.card.findUnique({ where: { id: req.params.id } });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const profile = await prisma.profile.findFirst({
      where: { id: card.profileId, userId: req.user.id },
    });
    if (!profile) return res.status(403).json({ error: 'Forbidden' });

    await prisma.card.delete({ where: { id: req.params.id } });
    res.json({ message: 'Card deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

// ---- Public share route (separate export for mounting without auth) ----
const shareRouter = express.Router();

/**
 * GET /cards/share/:token
 * Public endpoint to view a shared card
 */
shareRouter.get('/:token', async (req, res, next) => {
  try {
    const card = await prisma.card.findUnique({
      where: { shareToken: req.params.token },
      include: { profile: { select: { name: true, gender: true } } },
    });
    if (!card) return res.status(404).json({ error: 'Card not found or link invalid' });
    res.json(card);
  } catch (err) {
    next(err);
  }
});

module.exports.shareRouter = shareRouter;
