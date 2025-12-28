/**
 * Scan for all images used in CSV data
 */
export interface ImageUsage {
  path: string;
  usedIn: Array<{
    file: string;
    field: string;
    record: string;
  }>;
}

export function scanImageUsage(allCSVData: any): ImageUsage[] {
  const imageMap = new Map<string, ImageUsage>();

  // Helper to add image usage
  const addImage = (imagePath: string, file: string, field: string, record: string) => {
    if (!imagePath || !imagePath.startsWith('http')) return;
    
    if (!imageMap.has(imagePath)) {
      imageMap.set(imagePath, {
        path: imagePath,
        usedIn: [],
      });
    }
    
    imageMap.get(imagePath)!.usedIn.push({ file, field, record });
  };

  // Scan config.csv
  if (allCSVData.config) {
    allCSVData.config.forEach((row: any) => {
      const key = row.setting_key || row.settingKey;
      const value = row.setting_value || row.settingValue;
      
      if (key && value && (
        key.includes('image') || 
        key.includes('logo') || 
        key.includes('banner') ||
        key.includes('favicon')
      )) {
        addImage(value, 'config.csv', key, key);
      }
    });
  }

  // Scan products.csv
  if (allCSVData.products) {
    allCSVData.products.forEach((row: any) => {
      const productName = row.product_name || row.productName || 'Unknown';
      
      // Check all image fields
      for (let i = 1; i <= 5; i++) {
        const imageField = `image_${i}` in row ? `image_${i}` : `image${i}`;
        if (row[imageField]) {
          addImage(row[imageField], 'products.csv', imageField, productName);
        }
      }
      
      // Thumbnail
      const thumbField = 'image_thumbnail' in row ? 'image_thumbnail' : 'imageThumbnail';
      if (row[thumbField]) {
        addImage(row[thumbField], 'products.csv', 'thumbnail', productName);
      }
    });
  }

  // Scan categories.csv
  if (allCSVData.categories) {
    allCSVData.categories.forEach((row: any) => {
      const catName = row.category_name || row.categoryName || 'Unknown';
      const imagePath = row.image_path || row.imagePath;
      
      if (imagePath) {
        addImage(imagePath, 'categories.csv', 'image_path', catName);
      }
    });
  }

  // Scan seo.csv
  if (allCSVData.seo) {
    allCSVData.seo.forEach((row: any) => {
      const pagePath = row.page_path || row.pagePath || 'Unknown';
      const ogImage = row.og_image || row.ogImage;
      
      if (ogImage) {
        addImage(ogImage, 'seo.csv', 'og_image', pagePath);
      }
    });
  }

  return Array.from(imageMap.values());
}

/**
 * Get unused images (for manual deletion)
 */
export function getUnusedImages(allImages: string[], usedImages: ImageUsage[]): string[] {
  const usedPaths = new Set(usedImages.map(img => img.path));
  return allImages.filter(img => !usedPaths.has(img));
}
