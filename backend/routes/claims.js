const express = require('express');
const { body, validationResult } = require('express-validator');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/mine', async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate({ path: 'item', populate: { path: 'reportedBy', select: 'name email' } })
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch claims' });
  }
});

router.get('/item/:itemId', async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const filter = { item: item._id };
    if (!isOwner) filter.claimant = req.user._id;
    const claims = await Claim.find(filter)
      .populate('claimant', 'name email')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch claims' });
  }
});

router.post(
  '/',
  [body('itemId').notEmpty().withMessage('Item is required'), body('message').trim().notEmpty().withMessage('Message is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const item = await Item.findById(req.body.itemId);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      if (item.type !== 'Found') {
        return res.status(400).json({ message: 'You can only claim found items' });
      }
      if (item.status !== 'Active') {
        return res.status(400).json({ message: 'This item is not available to claim' });
      }
      if (item.reportedBy.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot claim your own item' });
      }
      const existing = await Claim.findOne({ item: item._id, claimant: req.user._id });
      if (existing) {
        return res.status(400).json({ message: 'You already submitted a claim for this item' });
      }
      const claim = await Claim.create({
        item: item._id,
        claimant: req.user._id,
        message: req.body.message
      });
      const populated = await claim.populate('claimant', 'name email');
      res.status(201).json(populated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to submit claim' });
    }
  }
);

router.patch(
  '/:id',
  [body('status').isIn(['Approved', 'Rejected']).withMessage('Status must be Approved or Rejected')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const claim = await Claim.findById(req.params.id).populate('item');
      if (!claim) return res.status(404).json({ message: 'Claim not found' });
      if (claim.item.reportedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the reporter can review this claim' });
      }
      if (claim.status !== 'Pending') {
        return res.status(400).json({ message: 'This claim was already reviewed' });
      }
      if (req.body.status === 'Approved') {
        claim.status = 'Approved';
        await claim.save();
        await Item.findByIdAndUpdate(claim.item._id, { status: 'Claimed' });
        await Claim.updateMany(
          { item: claim.item._id, _id: { $ne: claim._id }, status: 'Pending' },
          { status: 'Rejected' }
        );
      } else {
        claim.status = 'Rejected';
        await claim.save();
      }
      const populated = await Claim.findById(claim._id).populate('claimant', 'name email');
      res.json(populated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update claim' });
    }
  }
);

module.exports = router;
