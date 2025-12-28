import { CartItem as CartItemType } from '@/types/cart';
import { formatPrice } from '@/utils/formatters';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import useCartStore from '@/hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { config } = useStoreConfig();
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stockQuantity) {
      alert(`Only ${item.product.stockQuantity} items available in stock`);
      return;
    }
    updateQuantity(item.product.productId, newQuantity, item.variant);
  };

  const handleRemove = () => {
    removeItem(item.product.productId, item.variant);
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border">
      {/* Image */}
      <img
        src={item.product.thumbnail}
        alt={item.product.productName}
        className="w-20 h-20 object-cover rounded"
      />

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-medium text-sm mb-1">{item.product.productName}</h3>
        
        {/* Variants */}
        {(item.selectedColor || item.selectedSize) && (
          <div className="text-xs text-gray-500 mb-2">
            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
            {item.selectedColor && item.selectedSize && <span className="mx-1">•</span>}
            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
          </div>
        )}

        {/* Price & Quantity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Quantity Controls */}
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-bold text-sm">
              {formatPrice(item.product.price * item.quantity, config.currencySymbol)}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-gray-500">
                {formatPrice(item.product.price, config.currencySymbol)} each
              </div>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="text-xs text-red-600 hover:text-red-800 mt-2"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
