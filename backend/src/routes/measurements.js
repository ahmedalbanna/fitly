const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');

router.use(authenticate);

// Helper: verify profile belongs to user
async function verifyProfileOwnership(profileId, userId) {
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, userId },
  });
  return profile;
}

/**
 * GET /measurements/:profileId
 * Returns all measurements for a profile (latest first)
 */
router.get('/:profileId', async (req, res, next) => {
  try {
    const profile = await verifyProfileOwnership(req.params.profileId, req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const measurements = await prisma.measurement.findMany({
      where: { profileId: req.params.profileId },
      orderBy: { recordedAt: 'desc' },
    });
    res.json(measurements);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /measurements/:profileId/latest
 * Returns the most recent measurement for a profile
 */
router.get('/:profileId/latest', async (req, res, next) => {
  try {
    const profile = await verifyProfileOwnership(req.params.profileId, req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const measurement = await prisma.measurement.findFirst({
      where: { profileId: req.params.profileId },
      orderBy: { recordedAt: 'desc' },
    });
    res.json(measurement || null);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /measurements/:profileId
 * Body: { height?, weight?, chest?, waist?, hip?, armLength?, legLength?, shoeSize? }
 */
router.post('/:profileId', async (req, res, next) => {
  try {
    const profile = await verifyProfileOwnership(req.params.profileId, req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const { height, weight, chest, waist, hip, armLength, legLength, shoeSize } = req.body;

    const measurement = await prisma.measurement.create({
      data: {
        profileId: req.params.profileId,
        height: height != null ? parseFloat(height) : null,
        weight: weight != null ? parseFloat(weight) : null,
        chest: chest != null ? parseFloat(chest) : null,
        waist: waist != null ? parseFloat(waist) : null,
        hip: hip != null ? parseFloat(hip) : null,
        armLength: armLength != null ? parseFloat(armLength) : null,
        legLength: legLength != null ? parseFloat(legLength) : null,
        shoeSize: shoeSize != null ? parseFloat(shoeSize) : null,
      },
    });
    res.status(201).json(measurement);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /measurements/:id
 * Update a specific measurement record
 */
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.measurement.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Measurement not found' });

    // Verify ownership via profile
    const profile = await verifyProfileOwnership(existing.profileId, req.user.id);
    if (!profile) return res.status(403).json({ error: 'Forbidden' });

    const { height, weight, chest, waist, hip, armLength, legLength, shoeSize } = req.body;

    const updated = await prisma.measurement.update({
      where: { id: req.params.id },
      data: {
        ...(height != null && { height: parseFloat(height) }),
        ...(weight != null && { weight: parseFloat(weight) }),
        ...(chest != null && { chest: parseFloat(chest) }),
        ...(waist != null && { waist: parseFloat(waist) }),
        ...(hip != null && { hip: parseFloat(hip) }),
        ...(armLength != null && { armLength: parseFloat(armLength) }),
        ...(legLength != null && { legLength: parseFloat(legLength) }),
        ...(shoeSize != null && { shoeSize: parseFloat(shoeSize) }),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /measurements/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.measurement.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Measurement not found' });

    const profile = await verifyProfileOwnership(existing.profileId, req.user.id);
    if (!profile) return res.status(403).json({ error: 'Forbidden' });

    await prisma.measurement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Measurement deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
