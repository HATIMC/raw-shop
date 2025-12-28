import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { formatPrice } from '@/utils/formatters';
import { useStoreConfig } from '@/hooks/useStoreConfig';

export default function SearchBar() {
  const { query, setQuery, suggestions, clearSearch, isSearching } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { config } = useStoreConfig();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    setShowResults(value.length > 0);
  };

  return (
    <div ref={searchRef} className="relative w-full md:w-64">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length > 0 && setShowResults(true)}
          placeholder="Search products..."
          className="w-full pl-11 pr-10 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 group-hover:border-gray-300"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            onClick={() => {
              clearSearch();
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors hover:scale-110"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto custom-scrollbar animate-fade-in">
          {isSearching ? (
            <div className="p-6 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-2">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((product) => (
                <Link
                  key={product.productId}
                  to={`/products/${product.productId}`}
                  onClick={() => {
                    setShowResults(false);
                    clearSearch();
                  }}
                  className="flex items-center p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 border-b last:border-b-0 group"
                >
                  <div className="relative">
                    <img
                      src={product.thumbnail}
                      alt={product.productName}
                      className="w-14 h-14 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-sm text-gray-900 group-hover:text-primary transition-colors">{product.productName}</div>
                    <div className="text-primary text-sm font-bold">
                      {formatPrice(product.price, config.currencySymbol)}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
              {suggestions.length > 0 && (
                <Link
                  to={`/products?search=${query}`}
                  onClick={() => {
                    setShowResults(false);
                    clearSearch();
                  }}
                  className="flex items-center justify-center gap-2 p-4 text-center text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 border-t-2"
                >
                  <span>View all results</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500 font-semibold">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
