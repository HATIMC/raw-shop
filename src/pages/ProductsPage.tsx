import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductFilter, ProductSort } from '@/types/product';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const { products, filterProducts, sortProducts, loading } = useProducts();
  const [filters, setFilters] = useState<ProductFilter>({
    searchQuery: searchParams.get('search') || '',
    categories: [],
    priceRange: undefined,
    inStock: undefined,
  });
  const [sort, setSort] = useState<ProductSort>({
    field: 'name',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const mainRef = useRef<HTMLElement | null>(null);

  // Scroll the product list into view whenever the page changes (helps mobile UX)
  useEffect(() => {
    try {
      if (mainRef.current) {
        mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      // ignore
    }
  }, [currentPage]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(filters);
    return sortProducts(filtered, sort);
  }, [products, filters, sort, filterProducts, sortProducts]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Get unique values for filters
  const allBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(brands);
  }, [products]);

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 max-h-[calc(100vh-6rem)] overflow-auto">
            <h2 className="text-lg font-bold mb-4">Filters</h2>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                placeholder="Search products..."
                className="input text-sm"
              />
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceRange: {
                        min: Number(e.target.value) || 0,
                        max: filters.priceRange?.max || priceRange.max,
                      },
                    })
                  }
                  className="input text-sm"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceRange: {
                        min: filters.priceRange?.min || 0,
                        max: Number(e.target.value) || priceRange.max,
                      },
                    })
                  }
                  className="input text-sm"
                />
              </div>
            </div>

            {/* In Stock */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) =>
                    setFilters({ ...filters, inStock: e.target.checked || undefined })
                  }
                  className="mr-2"
                />
                <span className="text-sm">In Stock Only</span>
              </label>
            </div>

            {/* Brands */}
            {allBrands.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Brands</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allBrands.map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brands?.includes(brand)}
                        onChange={(e) => {
                          const brands = filters.brands || [];
                          if (e.target.checked) {
                            setFilters({ ...filters, brands: [...brands, brand] });
                          } else {
                            setFilters({
                              ...filters,
                              brands: brands.filter((b) => b !== brand),
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({
                  searchQuery: '',
                  categories: [],
                  priceRange: undefined,
                  inStock: undefined,
                  brands: [],
                });
              }}
              className="w-full btn btn-outline text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main ref={mainRef} className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Products</h1>
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {/* Sort */}
            <select
              value={`${sort.field}-${sort.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [
                  ProductSort['field'],
                  ProductSort['direction']
                ];
                setSort({ field, direction });
              }}
              className="input w-full sm:w-auto"
            >
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="createdDate-desc">Newest First</option>
              <option value="popularity-desc">Most Popular</option>
            </select>
          </div>

          {/* Products Grid */}
          <ProductGrid products={paginatedProducts} loading={loading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-outline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
