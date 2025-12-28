import { parseCSV, parseConfigCSV, transformProductData } from './csvParser';
import type { StoreConfig, Category, ShippingRule, Discount, Tax, SEO } from '@/types/config';
import type { Product } from '@/types/product';

const DATA_DIR = '/data';

// Cache for parsed data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load and cache CSV data
 */
async function loadCSV<T>(fileName: string, transform?: (data: any) => T): Promise<T[]> {
  const cacheKey = fileName;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const result = await parseCSV<any>(`${DATA_DIR}/${fileName}`);
    
    if (result.errors.length > 0) {
      console.error(`Errors parsing ${fileName}:`, result.errors);
    }

    let data = result.data;
    if (transform) {
      data = data.map(transform);
    }

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Failed to load ${fileName}:`, error);
    return [];
  }
}

/**
 * Load store configuration
 */
export async function loadStoreConfig(): Promise<Partial<StoreConfig>> {
  try {
    const result = await parseCSV<any>(`${DATA_DIR}/config.csv`);
    return parseConfigCSV(result.data) as Partial<StoreConfig>;
  } catch (error) {
    console.error('Failed to load store config:', error);
    return getDefaultConfig();
  }
}

/**
 * Get default configuration
 */
function getDefaultConfig(): Partial<StoreConfig> {
  return {
    storeName: 'Amazing Shop',
    storeTagline: 'Quality Products at Great Prices',
    currencyCode: 'USD',
    currencySymbol: '$',
    taxRate: 0,
    enableTax: false,
    shippingEnabled: true,
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    enableSearch: true,
    enableFilters: true,
    productsPerPage: 12,
    maintenanceMode: false,
  };
}

/**
 * Load all products
 */
export async function loadProducts(): Promise<Product[]> {
  return loadCSV<Product>('products.csv', transformProductData);
}

/**
 * Load categories
 */
export async function loadCategories(): Promise<Category[]> {
  return loadCSV<Category>('categories.csv');
}

/**
 * Load shipping rules
 */
export async function loadShippingRules(): Promise<ShippingRule[]> {
  return loadCSV<ShippingRule>('shipping.csv', (rule) => ({
    ...rule,
    regions: typeof rule.regions === 'string' ? rule.regions.split('|') : [],
  }));
}

/**
 * Load discounts
 */
export async function loadDiscounts(): Promise<Discount[]> {
  return loadCSV<Discount>('discounts.csv', (discount) => ({
    ...discount,
    applicableCategories: typeof discount.applicableCategories === 'string' 
      ? discount.applicableCategories.split('|') 
      : [],
    applicableProducts: typeof discount.applicableProducts === 'string' 
      ? discount.applicableProducts.split('|') 
      : [],
  }));
}

/**
 * Load tax rules
 */
export async function loadTaxes(): Promise<Tax[]> {
  return loadCSV<Tax>('taxes.csv');
}

/**
 * Load SEO data
 */
export async function loadSEO(): Promise<SEO[]> {
  return loadCSV<SEO>('seo.csv');
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Reload all data
 */
export async function reloadAllData() {
  clearCache();
  await Promise.all([
    loadStoreConfig(),
    loadProducts(),
    loadCategories(),
    loadShippingRules(),
    loadDiscounts(),
    loadTaxes(),
    loadSEO(),
  ]);
}
