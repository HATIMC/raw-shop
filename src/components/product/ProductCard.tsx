import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { formatPrice, calculateDiscountPercentage, getStockStatus } from '@/utils/formatters';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import useCartStore from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { config } = useStoreConfig();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  const stockStatus = getStockStatus(product.stockQuantity, product.lowStockThreshold);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link to={`/products/${product.productId}`} className="group block">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift animate-fade-in hover:shadow-2xl transition-all duration-500 border border-gray-100">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          <img
            src={product.thumbnail || product.images[0]}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isFeatured && (
              <span className="badge badge-primary shadow-lg animate-scale-in backdrop-blur-sm bg-primary/90">✨ Featured</span>
            )}
            {hasDiscount && (
              <span className="badge bg-red-500 text-white shadow-lg animate-scale-in backdrop-blur-sm">
                🔥 {calculateDiscountPercentage(product.compareAtPrice!, product.price)}% OFF
              </span>
            )}
            {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
              <span className="badge badge-warning shadow-lg backdrop-blur-sm">⚠️ Low Stock</span>
            )}
            {product.stockQuantity === 0 && (
              <span className="badge badge-danger shadow-lg backdrop-blur-sm">❌ Out of Stock</span>
            )}
          </div>

          {/* Quick Add Button */}
          {product.isAvailable && product.stockQuantity > 0 && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110"
              title="Add to cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Brand */}
          {product.brand && (
            <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">{product.brand}</div>
          )}

          {/* Title */}
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors text-lg">
            {product.productName}
          </h3>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {formatPrice(product.price, config.currencySymbol)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice!, config.currencySymbol)}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className={`text-xs font-semibold ${stockStatus.className}`}>
            {stockStatus.label}
          </div>
        </div>
      </div>
    </Link>
  );
}
