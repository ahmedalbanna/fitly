const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

/**
 * GET /banners
 * Returns all active banners (public endpoint for the home screen slider)
 */
router.get('/', async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(banners);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
