export interface Product {
  productId: string;
  productName: string;
  categoryId: string;
  subcategoryId: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  isFeatured: boolean;
  weight: number;
  dimensions: string;
  colorVariants: string[];
  sizeVariants: string[];
  images: string[];
  thumbnail: string;
  videoUrl?: string;
  brand: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  createdDate: string;
  modifiedDate: string;
}

export interface ProductVariant {
  color?: string;
  size?: string;
  sku?: string;
  price?: number;
  stockQuantity?: number;
}

export interface ProductFilter {
  categories?: string[];
  priceRange?: { min: number; max: number };
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  searchQuery?: string;
}

export interface ProductSort {
  field: 'price' | 'name' | 'createdDate' | 'popularity';
  direction: 'asc' | 'desc';
}
