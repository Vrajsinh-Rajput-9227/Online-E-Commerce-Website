/**
 * Price formatting utility to remove decimal points from prices
 */

/**
 * Formats price by removing decimal points and adding Indian Rupee symbol
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price without decimals
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '₹0';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '₹0';
  
  // Round to nearest integer and format with Indian locale
  const roundedPrice = Math.round(numPrice);
  return `₹${roundedPrice.toLocaleString('en-IN')}`;
};

/**
 * Formats price without Rupee symbol (for internal calculations)
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price without decimals and symbol
 */
export const formatPriceNumber = (price) => {
  if (!price && price !== 0) return '0';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '0';
  
  const roundedPrice = Math.round(numPrice);
  return roundedPrice.toLocaleString('en-IN');
};

export default formatPrice;
