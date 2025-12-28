import Papa from 'papaparse';

export interface CSVParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

/**
 * Parse CSV file from a URL or local path
 */
export async function parseCSV<T>(filePath: string): Promise<CSVParseResult<T>> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(filePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Convert snake_case to camelCase
        return header.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      },
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors,
          meta: results.meta,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parse CSV string data
 */
export function parseCSVString<T>(csvString: string): CSVParseResult<T> {
  const results = Papa.parse<T>(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => {
      return header.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    },
  });

  return {
    data: results.data,
    errors: results.errors,
    meta: results.meta,
  };
}

/**
 * Parse config CSV and convert to key-value object
 */
export function parseConfigCSV(data: any[]): Record<string, any> {
  const config: Record<string, any> = {};
  
  data.forEach((row) => {
    const key = row.settingKey;
    const value = row.settingValue;
    const type = row.settingType;

    if (!key) return;

    // Convert snake_case key to camelCase for consistency
    const camelKey = key.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());

    // Convert value based on type
    switch (type) {
      case 'boolean':
        config[camelKey] = value === 'true' || value === true;
        break;
      case 'number':
        config[camelKey] = parseFloat(value);
        break;
      case 'color':
      case 'text':
      case 'longtext':
      case 'email':
      case 'phone':
      case 'url':
      case 'path':
      default:
        config[camelKey] = value;
        break;
    }
  });

  return config;
}

/**
 * Parse array fields separated by pipe (|)
 */
export function parseArrayField(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.toString().split('|').map(item => item.trim()).filter(Boolean);
}

/**
 * Transform raw product data from CSV
 */
export function transformProductData(rawProduct: any): any {
  // Handle both snake_case and camelCase field names
  const images = [
    rawProduct.image1 || rawProduct.image_1,
    rawProduct.image2 || rawProduct.image_2,
    rawProduct.image3 || rawProduct.image_3,
    rawProduct.image4 || rawProduct.image_4,
    rawProduct.image5 || rawProduct.image_5,
  ].filter(Boolean);

  return {
    ...rawProduct,
    colorVariants: parseArrayField(rawProduct.colorVariants || rawProduct.variant_colors),
    sizeVariants: parseArrayField(rawProduct.sizeVariants || rawProduct.variant_sizes),
    images,
    thumbnail: rawProduct.imageThumbnail || rawProduct.image_thumbnail || rawProduct.thumbnail || images[0],
    tags: parseArrayField(rawProduct.tags),
  };
}
