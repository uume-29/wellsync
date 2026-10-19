/**
 * WellSync Unit Conversion & Pantry Deduction Utility
 * Provides safe, clinical quantity normalization across mass, volume, and count units.
 */

// Mass conversion rates (base unit: gram 'g')
const MASS_UNITS = {
  kg: 1000,
  kgs: 1000,
  kilogram: 1000,
  kilograms: 1000,
  g: 1,
  gm: 1,
  gms: 1,
  gram: 1,
  grams: 1,
  mg: 0.001,
  milligram: 0.001,
  milligrams: 0.001,
};

// Volume conversion rates (base unit: millilitre 'ml')
const VOLUME_UNITS = {
  l: 1000,
  lt: 1000,
  ltr: 1000,
  litre: 1000,
  litres: 1000,
  liter: 1000,
  liters: 1000,
  ml: 1,
  millilitre: 1,
  millilitres: 1,
  milliliter: 1,
  milliliters: 1,
  cup: 240,
  cups: 240,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
};

// Count units (base unit: piece)
const COUNT_UNITS = [
  'piece',
  'pieces',
  'item',
  'items',
  'egg',
  'eggs',
  'clove',
  'cloves',
  'pack',
  'packs',
  'packet',
  'packets',
  'bag',
  'bags',
  'pouch',
  'pouches',
  'box',
  'boxes',
  'can',
  'cans',
  'jar',
  'jars',
  'tub',
  'tubs',
  'bunch',
  'bunches',
];

/**
 * Canonicalize raw unit string to standard abbreviation
 */
const canonicalizeUnit = (unitStr) => {
  if (!unitStr || typeof unitStr !== 'string') return 'piece';
  const u = unitStr.toLowerCase().trim();

  if (MASS_UNITS[u]) {
    if (['kg', 'kgs', 'kilogram', 'kilograms'].includes(u)) return 'kg';
    if (['g', 'gm', 'gms', 'gram', 'grams'].includes(u)) return 'g';
    if (['mg', 'milligram', 'milligrams'].includes(u)) return 'mg';
  }

  if (VOLUME_UNITS[u]) {
    if (['l', 'lt', 'ltr', 'litre', 'litres', 'liter', 'liters'].includes(u)) return 'litre';
    if (['ml', 'millilitre', 'millilitres', 'milliliter', 'milliliters'].includes(u)) return 'ml';
    if (['cup', 'cups'].includes(u)) return 'cup';
    if (['tbsp', 'tablespoon', 'tablespoons'].includes(u)) return 'tbsp';
    if (['tsp', 'teaspoon', 'teaspoons'].includes(u)) return 'tsp';
  }

  if (['egg', 'eggs', 'piece', 'pieces', 'item', 'items'].includes(u)) return 'pieces';
  if (['packet', 'packets', 'pack', 'packs'].includes(u)) return 'packets';
  if (['bunch', 'bunches'].includes(u)) return 'bunch';
  if (['box', 'boxes'].includes(u)) return 'boxes';

  return u;
};

/**
 * Parse an ingredient quantity string into a numeric value and canonical unit.
 * Handles strings like "50g", "1 tbsp (12g)", "1/2 tsp", "1.5 kg", "200ml", "2 cups"
 */
const parseQuantityString = (quantityStr) => {
  if (!quantityStr) return { quantity: 1, unit: 'piece' };
  if (typeof quantityStr === 'number') return { quantity: quantityStr, unit: 'piece' };

  const str = String(quantityStr).trim();

  // 1. Check parenthetical mass or volume first: e.g. "1 tbsp (12g)" or "1 cup (150g)"
  const parenMatch = str.match(/\(([\d\.]+)\s*([a-zA-Z]+)\)/);
  if (parenMatch) {
    const pQty = parseFloat(parenMatch[1]);
    const pUnit = canonicalizeUnit(parenMatch[2]);
    if (!isNaN(pQty) && pQty > 0) {
      return { quantity: pQty, unit: pUnit };
    }
  }

  // 2. Check simple fractions: e.g. "1/2 tsp"
  const fractionMatch = str.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    const fUnit = canonicalizeUnit(fractionMatch[3]);
    if (!isNaN(num) && !isNaN(den) && den > 0) {
      return { quantity: Number((num / den).toFixed(2)), unit: fUnit || 'piece' };
    }
  }

  // 3. Check number + unit: e.g. "150g", "2.5 kg", "200ml", "3 pieces", "1 serving"
  const standardMatch = str.match(/^([\d\.]+)\s*(.*)$/);
  if (standardMatch) {
    const qty = parseFloat(standardMatch[1]);
    const rawUnit = standardMatch[2].replace(/cooked|portions?|servings?/gi, '').trim();
    const unit = canonicalizeUnit(rawUnit);
    if (!isNaN(qty)) {
      return { quantity: qty, unit: unit || 'piece' };
    }
  }

  return { quantity: 1, unit: canonicalizeUnit(str) };
};

/**
 * Determine if two units are in the same measurement family and can be safely converted
 */
const getUnitFamily = (unit) => {
  const u = canonicalizeUnit(unit);
  if (MASS_UNITS[u]) return 'mass';
  if (VOLUME_UNITS[u]) return 'volume';
  return 'count';
};

/**
 * Check if two units can be converted
 */
const canConvert = (unitA, unitB) => {
  if (!unitA || !unitB) return false;
  return getUnitFamily(unitA) === getUnitFamily(unitB);
};

/**
 * Convert quantity to its base unit (g for mass, ml for volume, count for others)
 */
const toBaseQuantity = (qty, unit) => {
  const numericQty = parseFloat(qty) || 0;
  const u = (unit || '').toLowerCase().trim();
  const canonical = canonicalizeUnit(u);

  if (MASS_UNITS[canonical]) {
    const b = numericQty * MASS_UNITS[canonical];
    return { baseQty: b, baseQuantity: b, baseUnit: 'g', family: 'mass', unitType: 'mass' };
  }
  if (VOLUME_UNITS[canonical]) {
    const b = numericQty * VOLUME_UNITS[canonical];
    return { baseQty: b, baseQuantity: b, baseUnit: 'ml', family: 'volume', unitType: 'volume' };
  }

  return { baseQty: numericQty, baseQuantity: numericQty, baseUnit: canonical, family: 'count', unitType: 'count' };
};

/**
 * Format base quantity back into the most human-readable unit in its family
 */
const formatFromBase = (baseQty, family, originalPreferredUnit = '') => {
  const fam = family || 'count';
  const val = Math.max(0, parseFloat(baseQty) || 0);

  if (fam === 'mass') {
    if (val >= 1000) {
      const kgVal = Number((val / 1000).toFixed(2));
      return { quantity: kgVal, unit: 'kg' };
    }
    return { quantity: Math.round(val), unit: 'g' };
  }

  if (fam === 'volume') {
    if (val >= 1000) {
      const lVal = Number((val / 1000).toFixed(2));
      return { quantity: lVal, unit: 'litre' };
    }
    if (originalPreferredUnit === 'cup' && val >= 120) {
      return { quantity: Number((val / 240).toFixed(1)), unit: 'cup' };
    }
    return { quantity: Math.round(val), unit: 'ml' };
  }

  return { quantity: Math.round(val * 10) / 10, unit: originalPreferredUnit || 'pieces' };
};

/**
 * Safely deduct pantry stock from required meal plan amount
 * Returns needed quantity, units, and mismatch warnings
 */
const deductPantryStock = (requiredQty, requiredUnit, pantryQty, pantryUnit) => {
  const reqNorm = toBaseQuantity(requiredQty, requiredUnit);
  const panNorm = toBaseQuantity(pantryQty, pantryUnit);

  // If units belong to the same family, conversion is valid and safe
  if (reqNorm.family === panNorm.family) {
    const neededBase = Math.max(0, reqNorm.baseQty - panNorm.baseQty);
    const formatted = formatFromBase(neededBase, reqNorm.family, requiredUnit);

    return {
      neededQuantity: formatted.quantity,
      neededUnit: formatted.unit,
      pantryCovered: neededBase === 0,
      unitMismatch: false,
      unitMismatchMessage: '',
    };
  }

  // If units cannot be safely converted (e.g. "1 bunch" vs "200g", or "pieces" vs "kg"):
  // Flag for user review without silently corrupting data
  return {
    neededQuantity: requiredQty,
    neededUnit: requiredUnit,
    pantryCovered: false,
    unitMismatch: true,
    unitMismatchMessage: `Pantry has ${pantryQty} ${pantryUnit}. Units cannot be automatically converted to ${requiredUnit}. Please review.`,
  };
};

/**
 * Clean and simplify ingredient name for resilient matching
 */
const cleanIngredientName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // remove parenthetical specs
    .replace(/\b(organic|fresh|raw|cooked|steamed|roasted|fluffy|artisan|heritage|whole|powder|dust|pieces?)\b/gi, '')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Determine best category for a grocery or pantry ingredient
 */
const categorizeIngredient = (name) => {
  const n = (name || '').toLowerCase();

  if (/rice|oats|quinoa|flour|atta|wheat|maida|semolina|sooji|poha|pasta|noodle|bread|cereal|grain/i.test(n)) {
    return 'Grains & Cereals';
  }
  if (/dal|lentil|chana|chickpea|rajma|bean|moong|urad|toor|soya|edamame|pulse|legume/i.test(n)) {
    return 'Pulses & Legumes';
  }
  if (/tomato|onion|potato|garlic|ginger|spinach|cucumber|carrot|banana|apple|lemon|blueberry|vegetable|fruit|herb|coriander|mint|chilli/i.test(n)) {
    return 'Produce & Vegetables';
  }
  if (/turmeric|cumin|coriander powder|pepper|salt|cinnamon|cardamom|paprika|masala|mustard seed|clove|spice|seasoning/i.test(n)) {
    return 'Spices & Seasonings';
  }
  if (/oil|ghee|butter|olive oil|coconut oil|vinegar|sauce|paste|tahini|dressing|condiment/i.test(n)) {
    return 'Oils & Condiments';
  }
  if (/milk|yogurt|curd|paneer|cheese|cream|egg|almond milk|oat milk/i.test(n)) {
    return 'Dairy & Eggs';
  }
  if (/chicken|fish|mutton|prawn|salmon|meat|tofu|tempeh|protein/i.test(n)) {
    return 'Proteins';
  }
  if (/sugar|jaggery|baking|yeast|seed|nut|almond|walnut|cashew|flax|chia|sesame/i.test(n)) {
    return 'Baking & Pantry';
  }

  return 'Other';
};

module.exports = {
  MASS_UNITS,
  VOLUME_UNITS,
  COUNT_UNITS,
  canonicalizeUnit,
  parseQuantityString,
  getUnitFamily,
  canConvert,
  toBaseQuantity,
  formatFromBase,
  deductPantryStock,
  cleanIngredientName,
  categorizeIngredient,
};
