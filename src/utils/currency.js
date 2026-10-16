/**
 * Indian Rupee (INR) Currency Formatting Utilities for WellSync
 * Uses standard ECMAScript Intl.NumberFormat with Indian English locale (en-IN)
 */

/**
 * Formats a monetary number into Indian Rupee (INR / ₹) representation.
 * Follows the Indian numbering system: lakhs and crores (e.g., ₹1,250, ₹12,500, ₹1,25,000).
 *
 * @param {number|string} amount - The numeric value to format
 * @param {object} [options={}] - Custom Intl.NumberFormat formatting options
 * @param {number} [options.maximumFractionDigits=2] - Maximum decimal places
 * @param {number} [options.minimumFractionDigits=0] - Minimum decimal places
 * @returns {string} Formatted INR currency string with ₹ symbol
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }

  const num = Number(amount);
  const maxFractionDigits = options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2;
  const minFractionDigits = options.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: minFractionDigits,
    ...options,
  }).format(num);
};

/**
 * Format currency without decimal points for whole budget numbers (e.g. ₹2,500)
 * @param {number|string} amount
 * @returns {string}
 */
export const formatWholeCurrency = (amount) => {
  return formatCurrency(amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
};

/**
 * Extracts a numeric value from a currency string (strips ₹, $, commas, etc.)
 * @param {string|number} value
 * @returns {number}
 */
export const parseCurrencyNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export default formatCurrency;
