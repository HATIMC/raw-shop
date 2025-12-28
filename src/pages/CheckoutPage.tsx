import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useCartStore from '@/hooks/useCart';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { checkoutSchema, CheckoutFormData } from '@/services/validationService';
import { loadShippingRules, loadDiscounts } from '@/services/dataService';
import { submitOrder } from '@/services/orderService';
import { formatPrice } from '@/utils/formatters';
import { generateId } from '@/utils/helpers';
import { Order } from '@/types/order';
import { ShippingRule, Discount } from '@/types/config';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { config } = useStoreConfig();
  const cart = useCartStore();
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const sameAsShipping = watch('sameAsShipping');
  const selectedShippingId = watch('shippingMethod');

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/products');
    }

    loadShippingRules().then(setShippingRules);
    loadDiscounts().then(setDiscounts);
  }, [cart.items, navigate]);

  // Calculate shipping cost
  useEffect(() => {
    if (selectedShippingId) {
      const rule = shippingRules.find((r) => r.shippingId === selectedShippingId);
      if (rule) {
        cart.updateShipping(rule.shippingCost);
      }
    }
  }, [selectedShippingId, shippingRules]);

  // Calculate tax
  useEffect(() => {
    if (config.enableTax && config.taxRate) {
      const taxAmount = (cart.subtotal * config.taxRate) / 100;
      cart.updateTax(taxAmount);
    }
  }, [cart.subtotal, config.enableTax, config.taxRate]);

  // If user chooses sameAsShipping, copy contact info into shipping address
  useEffect(() => {
    if (sameAsShipping) {
      const customer = getValues('customer') || { firstName: '', lastName: '', phone: '' };
      const addressString = `${customer.firstName || ''} ${customer.lastName || ''} ${customer.phone || ''}`.trim();
      setValue('shippingAddress.address', addressString);
    }
  }, [sameAsShipping, setValue, getValues]);

  const handleApplyDiscount = () => {
    const discount = discounts.find(
      (d) => d.discountCode.toUpperCase() === discountCode.toUpperCase() && d.isActive
    );

    if (!discount) {
      alert('Invalid discount code');
      return;
    }

    // Check min purchase
    if (cart.subtotal < discount.minPurchase) {
      alert(`Minimum purchase of ${formatPrice(discount.minPurchase, config.currencySymbol)} required`);
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = (cart.subtotal * discount.discountValue) / 100;
      discountAmount = Math.min(discountAmount, discount.maxDiscount);
    } else if (discount.discountType === 'fixed') {
      discountAmount = discount.discountValue;
    } else if (discount.discountType === 'shipping') {
      discountAmount = cart.shipping;
    }

    cart.applyDiscount(discount.discountCode, discountAmount);
    alert('Discount applied!');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      const selectedShipping = shippingRules.find((r) => r.shippingId === data.shippingMethod);

      if (!selectedShipping) {
        throw new Error('Please select a shipping method');
      }

      const order: Order = {
        orderId: generateId('ORD'),
        orderDate: new Date().toISOString(),
        customer: {
          ...data.customer,
          email: data.customer.email || '',
        },
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total,
        shippingAddress: {
          ...data.shippingAddress,
          firstName: data.customer.firstName,
          lastName: data.customer.lastName,
          phone: data.customer.phone,
          address1: data.shippingAddress.address,
          address2: '',
          city: 'N/A',
          state: 'N/A',
          zipCode: 'N/A',
          country: 'India',
        },
        billingAddress: {
          ...data.shippingAddress,
          firstName: data.customer.firstName,
          lastName: data.customer.lastName,
          phone: data.customer.phone,
          address1: data.shippingAddress.address,
          address2: '',
          city: 'N/A',
          state: 'N/A',
          zipCode: 'N/A',
          country: 'India',
        },
        shippingMethod: {
          shippingId: selectedShipping.shippingId,
          shippingName: selectedShipping.shippingName,
          shippingType: selectedShipping.shippingType,
          shippingCost: selectedShipping.shippingCost,
          estimatedDaysMin: selectedShipping.estimatedDaysMin,
          estimatedDaysMax: selectedShipping.estimatedDaysMax,
          description: selectedShipping.description,
        },
        paymentMethod: 'WhatsApp Order',
        orderNotes: data.orderNotes,
        status: 'pending',
        discountCode: cart.appliedDiscountCode,
      };

      await submitOrder(order, config as any);
      cart.clearCart();
      navigate(`/order-confirmation/${order.orderId}`);
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const availableShipping = shippingRules.filter(
    (rule) =>
      rule.isActive &&
      cart.subtotal >= rule.minOrderValue &&
      cart.subtotal <= rule.maxOrderValue
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input {...register('customer.firstName')} className="input" placeholder="John" />
                  {errors.customer?.firstName && (
                    <p className="text-red-600 text-xs mt-1">{errors.customer.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input {...register('customer.lastName')} className="input" placeholder="Doe" />
                  {errors.customer?.lastName && (
                    <p className="text-red-600 text-xs mt-1">{errors.customer.lastName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input type="tel" {...register('customer.phone')} className="input" placeholder="+91 98765 43210" />
                  {errors.customer?.phone && (
                    <p className="text-red-600 text-xs mt-1">{errors.customer.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                  <input type="email" {...register('customer.email')} className="input" placeholder="john@example.com" />
                  {errors.customer?.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.customer.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Complete Address *</label>
                <div className="mb-3">
                  <label className="flex items-center">
                    <input type="checkbox" {...register('sameAsShipping')} className="mr-2" />
                    <span className="text-sm">Use contact information as delivery address</span>
                  </label>
                </div>
                <textarea
                  {...register('shippingAddress.address')}
                  className="input"
                  rows={3}
                  placeholder="House/Flat No., Street, Landmark, City, State, PIN Code"
                />
                {errors.shippingAddress?.address && (
                  <p className="text-red-600 text-xs mt-1">{errors.shippingAddress.address.message}</p>
                )}
              </div>
            </div>

            {/* Shipping Method */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
              <div className="space-y-3">
                {availableShipping.map((rule) => (
                  <label
                    key={rule.shippingId}
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <input
                      type="radio"
                      value={rule.shippingId}
                      {...register('shippingMethod')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{rule.shippingName}</div>
                      <div className="text-sm text-gray-600">{rule.description}</div>
                      <div className="text-xs text-gray-500">
                        Estimated delivery: {rule.estimatedDaysMin}-{rule.estimatedDaysMax} days
                      </div>
                    </div>
                    <div className="font-bold">
                      {rule.shippingCost === 0
                        ? 'FREE'
                        : formatPrice(rule.shippingCost, config.currencySymbol)}
                    </div>
                  </label>
                ))}
              </div>
              {errors.shippingMethod && (
                <p className="text-red-600 text-sm mt-2">{errors.shippingMethod.message}</p>
              )}
            </div>

            {/* Order Notes */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Order Notes (Optional)</h2>
              <textarea
                {...register('orderNotes')}
                rows={4}
                placeholder="Any special instructions for your order?"
                className="input"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{item.product.productName}</div>
                      <div className="text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-medium text-sm">
                      {formatPrice(item.product.price * item.quantity, config.currencySymbol)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Discount code"
                    className="flex-1 input text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="btn btn-outline text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cart.subtotal, config.currencySymbol)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(cart.discount, config.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatPrice(cart.shipping, config.currencySymbol)}</span>
                </div>
                {cart.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatPrice(cart.tax, config.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(cart.total, config.currencySymbol)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || cart.items.length === 0}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
