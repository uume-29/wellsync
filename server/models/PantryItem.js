const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      default: 'g',
    },
    category: {
      type: String,
      trim: true,
      default: 'Pantry',
    },
    status: {
      type: String,
      enum: ['available', 'low_stock', 'used_up'],
      default: 'available',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-scoped queries and fast lookups
pantryItemSchema.index({ user: 1, name: 1 });
pantryItemSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('PantryItem', pantryItemSchema);
