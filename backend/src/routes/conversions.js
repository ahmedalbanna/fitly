const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

/**
 * GET /conversions
 * Query: ?type=Shirts&system=EU&value=90
 *
 * Returns the size label for the given measurement value.
 * - Shirts/Thobe: value = chest or height in cm
 * - Pants: value = waist in cm
 * - Shoes: value = foot length in cm
 */
router.get('/', async (req, res, next) => {
  try {
    const { type, system, value } = req.query;

    if (!type || !system || value === undefined) {
      return res.status(400).json({ error: 'Query params type, system, and value are required' });
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return res.status(400).json({ error: 'value must be a number' });
    }

    // Find the matching size
    const match = await prisma.conversionTable.findFirst({
      where: {
        productType: type,
        system,
        minValue: { lte: numValue },
        maxValue: { gte: numValue },
      },
    });

    if (!match) {
      // Try to find closest
      const allSizes = await prisma.conversionTable.findMany({
        where: { productType: type, system },
        orderBy: { minValue: 'asc' },
      });

      if (allSizes.length === 0) {
        return res.status(404).json({ error: 'No conversion data found for this product type and system' });
      }

      // Below smallest
      if (numValue < allSizes[0].minValue) {
        return res.json({
          result: allSizes[0].sizeLabel,
          note: 'Below minimum range — closest size returned',
          type,
          system,
          value: numValue,
        });
      }

      // Above largest
      const largest = allSizes[allSizes.length - 1];
      return res.json({
        result: largest.sizeLabel,
        note: 'Above maximum range — closest size returned',
        type,
        system,
        value: numValue,
      });
    }

    res.json({ result: match.sizeLabel, type, system, value: numValue });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /conversions/types
 * Returns available product types
 */
router.get('/types', async (req, res, next) => {
  try {
    const types = await prisma.conversionTable.findMany({
      distinct: ['productType'],
      select: { productType: true },
    });
    res.json(types.map((t) => t.productType));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /conversions/systems
 * Query: ?type=Shirts
 * Returns available systems for a product type
 */
router.get('/systems', async (req, res, next) => {
  try {
    const { type } = req.query;
    const where = type ? { productType: type } : {};
    const systems = await prisma.conversionTable.findMany({
      where,
      distinct: ['system'],
      select: { system: true },
    });
    res.json(systems.map((s) => s.system));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /conversions/sizes
 * Query: ?type=Shirts&system=EU
 * Returns all size entries for reference
 */
router.get('/sizes', async (req, res, next) => {
  try {
    const { type, system } = req.query;
    const where = {};
    if (type) where.productType = type;
    if (system) where.system = system;

    const sizes = await prisma.conversionTable.findMany({
      where,
      orderBy: { minValue: 'asc' },
    });
    res.json(sizes);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
