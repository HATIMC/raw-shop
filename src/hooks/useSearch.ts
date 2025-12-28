import { useState, useEffect, useMemo } from 'react';
import { useProducts } from './useProducts';

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const { products } = useProducts();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }

    const searchTerm = debouncedQuery.toLowerCase();

    return products.filter((product) => {
      const matchesName = product.productName.toLowerCase().includes(searchTerm);
      const matchesDescription = product.description?.toLowerCase().includes(searchTerm);
      const matchesBrand = product.brand?.toLowerCase().includes(searchTerm);
      const matchesTags = product.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );
      const matchesSku = product.sku?.toLowerCase().includes(searchTerm);

      return (
        product.isAvailable &&
        (matchesName || matchesDescription || matchesBrand || matchesTags || matchesSku)
      );
    });
  }, [debouncedQuery, products]);

  // Search suggestions (top 5 results)
  const suggestions = useMemo(() => {
    return results.slice(0, 5);
  }, [results]);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return {
    query,
    setQuery,
    results,
    suggestions,
    clearSearch,
    isSearching: query !== debouncedQuery,
  };
}
