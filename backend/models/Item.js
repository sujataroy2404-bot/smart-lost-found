const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Clothing',
  'Accessories',
  'Bags',
  'Keys',
  'Pets',
  'Other'
];

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, required: true, enum: CATEGORIES },
    type: { type: String, required: true, enum: ['Lost', 'Found'] },
    location: { type: String, required: true, trim: true, maxlength: 160 },
    date: { type: Date, required: true },
    image: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Claimed', 'Resolved', 'Closed'],
      default: 'Active'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

itemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
