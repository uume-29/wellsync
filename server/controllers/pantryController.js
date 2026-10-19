const PantryItem = require('../models/PantryItem');
const { canonicalizeUnit, categorizeIngredient } = require('../utils/unitConverter');

/**
 * @desc    Get all pantry items for authenticated user
 * @route   GET /api/pantry
 * @access  Private
 */
exports.getPantryItems = async (req, res) => {
  try {
    const items = await PantryItem.find({ user: req.user._id }).sort({
      category: 1,
      name: 1,
    });

    const summary = {
      total: items.length,
      available: items.filter((i) => i.status === 'available').length,
      lowStock: items.filter((i) => i.status === 'low_stock').length,
      usedUp: items.filter((i) => i.status === 'used_up').length,
    };

    res.status(200).json({
      success: true,
      data: items,
      summary,
    });
  } catch (error) {
    console.error(`[Pantry getPantryItems Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pantry inventory',
      error: error.message,
    });
  }
};

/**
 * @desc    Add new pantry item or increment existing item
 * @route   POST /api/pantry
 * @access  Private
 */
exports.addPantryItem = async (req, res) => {
  try {
    const { name, quantity, unit, category, status, notes } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient name is required',
      });
    }

    const trimmedName = name.trim();
    const parsedQty = Math.max(0, parseFloat(quantity) || 1);
    const resolvedUnit = canonicalizeUnit(unit || 'piece');
    const resolvedCategory = category || categorizeIngredient(trimmedName);
    const resolvedStatus = status || (parsedQty > 0 ? 'available' : 'used_up');

    // Check if an item with the same name already exists for this user (case-insensitive)
    const existing = await PantryItem.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      // If units are identical, increment quantity
      if (existing.unit.toLowerCase() === resolvedUnit.toLowerCase()) {
        existing.quantity += parsedQty;
        existing.status = existing.quantity > 0 ? 'available' : 'used_up';
        if (notes) existing.notes = notes;
        await existing.save();

        return res.status(200).json({
          success: true,
          message: `Updated existing ${existing.name} quantity to ${existing.quantity} ${existing.unit}`,
          data: existing,
        });
      }
    }

    const newItem = await PantryItem.create({
      user: req.user._id,
      name: trimmedName,
      quantity: parsedQty,
      unit: resolvedUnit,
      category: resolvedCategory,
      status: resolvedStatus,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Pantry item added successfully',
      data: newItem,
    });
  } catch (error) {
    console.error(`[Pantry addPantryItem Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add pantry item',
      error: error.message,
    });
  }
};

/**
 * @desc    Update pantry item details or quantity
 * @route   PUT /api/pantry/:id
 * @access  Private
 */
exports.updatePantryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, category, status, notes } = req.body;

    const item = await PantryItem.findOne({ _id: id, user: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pantry item not found',
      });
    }

    if (name !== undefined) item.name = name.trim();
    if (quantity !== undefined) {
      const q = Math.max(0, parseFloat(quantity) || 0);
      item.quantity = q;
      // Auto-update status if quantity hits 0
      if (q === 0 && !status) {
        item.status = 'used_up';
      } else if (q > 0 && item.status === 'used_up' && !status) {
        item.status = 'available';
      }
    }
    if (unit !== undefined) item.unit = canonicalizeUnit(unit);
    if (category !== undefined) item.category = category;
    if (status !== undefined) item.status = status;
    if (notes !== undefined) item.notes = notes.trim();

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Pantry item updated successfully',
      data: item,
    });
  } catch (error) {
    console.error(`[Pantry updatePantryItem Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update pantry item',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle pantry item status between available and used_up
 * @route   PATCH /api/pantry/:id/toggle
 * @access  Private
 */
exports.togglePantryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PantryItem.findOne({ _id: id, user: req.user._id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pantry item not found',
      });
    }

    if (item.status === 'used_up') {
      item.status = 'available';
      if (item.quantity === 0) item.quantity = 1;
    } else {
      item.status = 'used_up';
      item.quantity = 0;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: `Pantry item marked as ${item.status}`,
      data: item,
    });
  } catch (error) {
    console.error(`[Pantry togglePantryStatus Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pantry status',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a pantry item
 * @route   DELETE /api/pantry/:id
 * @access  Private
 */
exports.deletePantryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PantryItem.findOneAndDelete({ _id: id, user: req.user._id });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Pantry item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pantry item deleted successfully',
      id,
    });
  } catch (error) {
    console.error(`[Pantry deletePantryItem Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pantry item',
      error: error.message,
    });
  }
};
