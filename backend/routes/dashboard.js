const express = require('express');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/stats', async (_req, res) => {
  try {
    const [totalLost, totalFound, resolvedOrClaimed, active] = await Promise.all([
      Item.countDocuments({ type: 'Lost' }),
      Item.countDocuments({ type: 'Found' }),
      Item.countDocuments({ status: { $in: ['Claimed', 'Resolved'] } }),
      Item.countDocuments({ status: 'Active' })
    ]);
    res.json({
      totalLost,
      totalFound,
      resolvedOrClaimed,
      active
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

module.exports = router;
