const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Pantry',
    },
    requiredQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    requiredUnit: {
      type: String,
      trim: true,
      default: 'piece',
    },
    pantryQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    pantryUnit: {
      type: String,
      trim: true,
      default: '',
    },
    neededQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    neededUnit: {
      type: String,
      trim: true,
      default: 'piece',
    },
    unitMismatch: {
      type: Boolean,
      default: false,
    },
    unitMismatchMessage: {
      type: String,
      default: '',
    },
    isPurchased: {
      type: Boolean,
      default: false,
    },
    purchasedAt: {
      type: Date,
      default: null,
    },
    isTransferredToPantry: {
      type: Boolean,
      default: false,
    },
    transferredToPantryAt: {
      type: Date,
      default: null,
    },
    isUserAdded: {
      type: Boolean,
      default: false,
    },
    isUserEdited: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const recordedBillSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Bill amount in INR is required'],
      min: [0, 'Bill amount cannot be negative'],
    },
    store: {
      type: String,
      trim: true,
      default: 'Grocery Store',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const monthlyGroceryPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    month: {
      type: String,
      required: [true, 'Month format YYYY-MM is required'],
      trim: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format (e.g. 2026-10)'],
    },
    householdSize: {
      type: Number,
      default: 1,
      min: [1, 'Household size must be at least 1 person'],
      max: [12, 'Household size cannot exceed 12 people'],
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active',
    },
    sourceMealPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealPlan',
      default: null,
    },
    items: [groceryItemSchema],
    budget: {
      monthlyBudget: {
        type: Number,
        default: 10000,
        min: 0,
      },
      plannedSpending: {
        type: Number,
        default: 0,
        min: 0,
      },
      actualSpending: {
        type: Number,
        default: 0,
        min: 0,
      },
      recordedBills: [recordedBillSchema],
    },
    summary: {
      totalItems: { type: Number, default: 0 },
      neededItems: { type: Number, default: 0 },
      stockedItems: { type: Number, default: 0 },
      purchasedItems: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one monthly grocery plan per user per month
monthlyGroceryPlanSchema.index({ user: 1, month: 1 }, { unique: true });

// Pre-save hook to recompute summary counts and actual spending
monthlyGroceryPlanSchema.pre('save', function (next) {
  if (Array.isArray(this.items)) {
    this.summary.totalItems = this.items.length;
    this.summary.neededItems = this.items.filter((item) => item.neededQuantity > 0).length;
    this.summary.stockedItems = this.items.filter(
      (item) => item.neededQuantity === 0 && !item.unitMismatch
    ).length;
    this.summary.purchasedItems = this.items.filter((item) => item.isPurchased).length;
  }

  if (this.budget && Array.isArray(this.budget.recordedBills)) {
    this.budget.actualSpending = this.budget.recordedBills.reduce(
      (sum, bill) => sum + (Number(bill.amount) || 0),
      0
    );
  }

  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('MonthlyGroceryPlan', monthlyGroceryPlanSchema);
