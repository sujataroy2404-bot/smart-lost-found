const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const CATEGORIES = require('../models/Item').CATEGORIES;

const itemValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(CATEGORIES).withMessage('Invalid category'),
  body('type').isIn(['Lost', 'Found']).withMessage('Type must be Lost or Found'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').notEmpty().withMessage('Date is required')
];

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { search, type, category, location, status, mine } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (mine === 'true') filter.reportedBy = req.user._id;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    const items = await Item.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Invalid item id' });
  }
});

router.post('/', upload.single('image'), itemValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  try {
    const item = await Item.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      type: req.body.type,
      location: req.body.location,
      date: req.body.date,
      status: req.body.status || 'Active',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      reportedBy: req.user._id
    });
    const populated = await item.populate('reportedBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create item' });
  }
});

router.put('/:id', upload.single('image'), itemValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reports' });
    }
    item.title = req.body.title;
    item.description = req.body.description;
    item.category = req.body.category;
    item.type = req.body.type;
    item.location = req.body.location;
    item.date = req.body.date;
    if (req.body.status) item.status = req.body.status;
    if (req.file) item.image = `/uploads/${req.file.filename}`;
    await item.save();
    const populated = await item.populate('reportedBy', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item' });
  }
});

router.patch(
  '/:id/status',
  [body('status').isIn(['Active', 'Claimed', 'Resolved', 'Closed']).withMessage('Invalid status')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const item = await Item.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      if (item.reportedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your own reports' });
      }
      item.status = req.body.status;
      await item.save();
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update status' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reports' });
    }
    await Claim.deleteMany({ item: item._id });
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

module.exports = router;
