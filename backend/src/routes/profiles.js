const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// All profile routes require authentication
router.use(authenticate);

/**
 * GET /profiles
 * Returns all profiles (main + dependents) for the authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const profiles = await prisma.profile.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });
    res.json(profiles);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /profiles/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /profiles
 * Body: { name, gender? }
 * Creates a dependent profile
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, gender } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const profile = await prisma.profile.create({
      data: {
        userId: req.user.id,
        name,
        gender: gender || null,
        isMain: false,
      },
    });
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /profiles/:id
 * Body: { name?, gender? }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { name, gender } = req.body;

    const profile = await prisma.profile.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const updated = await prisma.profile.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(gender !== undefined && { gender }),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /profiles/:id
 * Cannot delete main profile
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (profile.isMain) return res.status(400).json({ error: 'Cannot delete main profile' });

    await prisma.profile.delete({ where: { id: req.params.id } });
    res.json({ message: 'Dependent deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
