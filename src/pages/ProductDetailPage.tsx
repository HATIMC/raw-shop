import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import useCartStore from '@/hooks/useCart';
import { formatPrice, getStockStatus } from '@/utils/formatters';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import ProductGrid from '@/components/product/ProductGrid';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { config } = useStoreConfig();
  const { getProductById, getRelatedProducts } = useProducts();
  const addItem = useCartStore((state) => state.addItem);

  const product = getProductById(id || '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      if (product.colorVariants && product.colorVariants.length > 0) {
        setSelectedColor(product.colorVariants[0]);
      }
      if (product.sizeVariants && product.sizeVariants.length > 0) {
        setSelectedSize(product.sizeVariants[0]);
      }
    }
    // Ensure the page is scrolled to top when a product is opened (helps on mobile and desktop)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stockQuantity, product.lowStockThreshold);
  const relatedProducts = getRelatedProducts(product);

  const handleAddToCart = () => {
    if (product.stockQuantity < quantity) {
      alert('Not enough stock available');
      return;
    }

    addItem(product, quantity, {
      color: selectedColor,
      size: selectedSize,
    });

    alert('Added to cart!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          {/* Main Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center h-auto lg:h-[min(60vh,420px)]">
            <img
              src={product.images[selectedImage] || product.thumbnail}
              alt={product.productName}
              className="max-w-full max-h-full object-contain lg:cursor-pointer"
              onClick={() => {
                if (!product.images || product.images.length <= 1) return;
                setSelectedImage((i) => (i + 1) % product.images.length);
              }}
              title={product.images && product.images.length > 1 ? 'Click to view next image' : undefined}
            />
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`${product.productName} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Brand */}
          {product.brand && <div className="text-gray-600 mb-2">{product.brand}</div>}

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">{product.productName}</h1>

          {/* Price */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price, config.currencySymbol)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.compareAtPrice, config.currencySymbol)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className={`text-sm mb-6 ${stockStatus.className}`}>
            {stockStatus.label}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-gray-700 mb-6">{product.shortDescription}</p>
          )}

          {/* Color Selection */}
          {product.colorVariants && product.colorVariants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Color: {selectedColor}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colorVariants.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                      selectedColor === color
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizeVariants && product.sizeVariants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Size: {selectedSize}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizeVariants.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded border border-gray-300 hover:bg-gray-100"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(product.stockQuantity, val)));
                }}
                className="w-20 text-center border border-gray-300 rounded px-2 py-2"
              />
              <button
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                className="w-10 h-10 rounded border border-gray-300 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || product.stockQuantity === 0}
            className="w-full btn btn-primary py-4 text-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="font-bold mb-2">Product Details</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>SKU: {product.sku}</li>
              {product.weight && <li>Weight: {product.weight} kg</li>}
              {product.dimensions && <li>Dimensions: {product.dimensions} cm</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-2xl font-bold mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
