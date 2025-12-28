import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Cart } from '@/types/cart';
import type { Product, ProductVariant } from '@/types/product';

interface CartStore extends Cart {
  // Actions
  addItem: (product: Product, quantity: number, variant?: ProductVariant) => void;
  removeItem: (productId: string, variant?: ProductVariant) => void;
  updateQuantity: (productId: string, quantity: number, variant?: ProductVariant) => void;
  clearCart: () => void;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;
  updateShipping: (shippingCost: number) => void;
  updateTax: (taxAmount: number) => void;
  calculateTotals: () => void;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      appliedDiscountCode: undefined,

      addItem: (product, quantity, variant) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) =>
            item.product.productId === product.productId &&
            item.selectedColor === variant?.color &&
            item.selectedSize === variant?.size
        );

        let newItems: CartItem[];
        if (existingIndex >= 0) {
          newItems = items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            product,
            quantity,
            selectedColor: variant?.color,
            selectedSize: variant?.size,
            variant,
            addedAt: new Date().toISOString(),
          };
          newItems = [...items, newItem];
        }

        set({ items: newItems });
        get().calculateTotals();
      },

      removeItem: (productId, variant) => {
        const items = get().items.filter(
          (item) =>
            !(
              item.product.productId === productId &&
              item.selectedColor === variant?.color &&
              item.selectedSize === variant?.size
            )
        );
        set({ items });
        get().calculateTotals();
      },

      updateQuantity: (productId, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(productId, variant);
          return;
        }

        const items = get().items.map((item) =>
          item.product.productId === productId &&
          item.selectedColor === variant?.color &&
          item.selectedSize === variant?.size
            ? { ...item, quantity }
            : item
        );
        set({ items });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
          appliedDiscountCode: undefined,
        });
      },

      applyDiscount: (code, amount) => {
        set({ appliedDiscountCode: code, discount: amount });
        get().calculateTotals();
      },

      removeDiscount: () => {
        set({ appliedDiscountCode: undefined, discount: 0 });
        get().calculateTotals();
      },

      updateShipping: (shippingCost) => {
        set({ shipping: shippingCost });
        get().calculateTotals();
      },

      updateTax: (taxAmount) => {
        set({ tax: taxAmount });
        get().calculateTotals();
      },

      calculateTotals: () => {
        const { items, tax, shipping, discount } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        const total = subtotal + tax + shipping - discount;
        set({ subtotal, total });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
