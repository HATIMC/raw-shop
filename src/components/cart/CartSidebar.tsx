import { useNavigate } from 'react-router-dom';
import useCartStore from '@/hooks/useCart';
import CartItem from './CartItem';
import { formatPrice } from '@/utils/formatters';
import { useStoreConfig } from '@/hooks/useStoreConfig';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const navigate = useNavigate();
  const { config } = useStoreConfig();
  const { items, subtotal, clearCart } = useCartStore();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Shopping Cart ({items.length})</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mt-2">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <CartItem key={`${item.product.productId}-${index}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Subtotal:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(subtotal, config.currencySymbol)}
              </span>
            </div>

            {/* Shipping Notice */}
            <p className="text-xs text-gray-500 mb-4 text-center">
              Shipping and taxes calculated at checkout
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full btn btn-primary py-3 text-lg"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                className="w-full btn btn-outline text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
