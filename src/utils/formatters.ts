/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, currencySymbol = '$'): string {
  return `${currencySymbol}${price.toFixed(2)}`;
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  salePrice: number
): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Get stock status label
 */
export function getStockStatus(
  stockQuantity: number,
  lowStockThreshold: number
): {
  label: string;
  className: string;
} {
  if (stockQuantity === 0) {
    return { label: 'Out of Stock', className: 'text-red-600' };
  } else if (stockQuantity <= lowStockThreshold) {
    return {
      label: `Only ${stockQuantity} left!`,
      className: 'text-orange-600',
    };
  } else {
    return { label: 'In Stock', className: 'text-green-600' };
  }
}

/**
 * Calculate shipping estimate days text
 */
export function getShippingEstimate(minDays: number, maxDays: number): string {
  if (minDays === maxDays) {
    return `${minDays} ${minDays === 1 ? 'day' : 'days'}`;
  }
  return `${minDays}-${maxDays} days`;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
