import { useState, useEffect } from 'react';
import { loadProducts } from '@/services/dataService';
import type { Product, ProductFilter, ProductSort } from '@/types/product';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductsData();
  }, []);

  const loadProductsData = async () => {
    try {
      setLoading(true);
      const data = await loadProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (filters: ProductFilter): Product[] => {
    return products.filter((product) => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = product.productName.toLowerCase().includes(query);
        const matchesDescription = product.description?.toLowerCase().includes(query);
        const matchesTags = product.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Categories
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(product.categoryId)) {
          return false;
        }
      }

      // Price range
      if (filters.priceRange) {
        if (
          product.price < filters.priceRange.min ||
          product.price > filters.priceRange.max
        ) {
          return false;
        }
      }

      // Brands
      if (filters.brands && filters.brands.length > 0) {
        if (!filters.brands.includes(product.brand)) {
          return false;
        }
      }

      // Colors
      if (filters.colors && filters.colors.length > 0) {
        const hasMatchingColor = product.colorVariants?.some((color) =>
          filters.colors!.includes(color)
        );
        if (!hasMatchingColor) {
          return false;
        }
      }

      // Sizes
      if (filters.sizes && filters.sizes.length > 0) {
        const hasMatchingSize = product.sizeVariants?.some((size) =>
          filters.sizes!.includes(size)
        );
        if (!hasMatchingSize) {
          return false;
        }
      }

      // In stock
      if (filters.inStock !== undefined) {
        if (filters.inStock && (!product.isAvailable || product.stockQuantity <= 0)) {
          return false;
        }
      }

      // Featured
      if (filters.isFeatured !== undefined) {
        if (filters.isFeatured && !product.isFeatured) {
          return false;
        }
      }

      // Tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = product.tags?.some((tag) =>
          filters.tags!.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  };

  const sortProducts = (products: Product[], sort: ProductSort): Product[] => {
    const sorted = [...products];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'createdDate':
          comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
          break;
        case 'popularity':
          // Could be based on view count or sales, for now use featured status
          comparison = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
          break;
      }
      
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.productId === id);
  };

  const getProductsBySku = (sku: string): Product | undefined => {
    return products.find((p) => p.sku === sku);
  };

  const getFeaturedProducts = (limit?: number): Product[] => {
    const featured = products.filter((p) => p.isFeatured && p.isAvailable);
    return limit ? featured.slice(0, limit) : featured;
  };

  const getRelatedProducts = (product: Product, limit = 4): Product[] => {
    return products
      .filter(
        (p) =>
          p.productId !== product.productId &&
          p.isAvailable &&
          (p.categoryId === product.categoryId ||
            p.brand === product.brand ||
            p.tags?.some((tag) => product.tags?.includes(tag)))
      )
      .slice(0, limit);
  };

  return {
    products,
    loading,
    error,
    filterProducts,
    sortProducts,
    getProductById,
    getProductsBySku,
    getFeaturedProducts,
    getRelatedProducts,
    reload: loadProductsData,
  };
}
