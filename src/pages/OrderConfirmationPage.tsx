import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Order } from '@/types/order';
import { formatPrice, formatDate } from '@/utils/formatters';
import { useStoreConfig } from '@/hooks/useStoreConfig';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { config } = useStoreConfig();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Load order from localStorage
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = orders.find((o: Order) => o.orderId === orderId);
      setOrder(foundOrder || null);
    } catch (error) {
      console.error('Failed to load order:', error);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your order. We've received your request.</p>
        </div>

        {/* Order Details Card */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">Order #{order.orderId}</h2>
              <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
            </div>
            <span className="badge badge-success">Pending</span>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Customer Information</h3>
            <p className="text-sm text-gray-600">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-sm text-gray-600">{order.customer.email}</p>
            <p className="text-sm text-gray-600">{order.customer.phone}</p>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="text-sm text-gray-600">{order.shippingAddress.address1}</p>
            {order.shippingAddress.address2 && (
              <p className="text-sm text-gray-600">{order.shippingAddress.address2}</p>
            )}
            {order.shippingAddress.city !== 'N/A' && (
              <p className="text-sm text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
            )}
            {order.shippingAddress.country && order.shippingAddress.country !== 'N/A' && (
              <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
            )}
          </div>

          {/* Shipping Method */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Shipping Method</h3>
            <p className="text-sm text-gray-600">{order.shippingMethod.shippingName}</p>
            <p className="text-sm text-gray-600">
              Estimated delivery: {order.shippingMethod.estimatedDaysMin}-{order.shippingMethod.estimatedDaysMax} days
            </p>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded">
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.product.productName}</div>
                    {(item.selectedColor || item.selectedSize) && (
                      <div className="text-xs text-gray-600">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedColor && item.selectedSize && <span className="mx-1">•</span>}
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                  </div>
                  <div className="font-medium text-sm">
                    {formatPrice(item.product.price * item.quantity, config.currencySymbol)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="border-t pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal, config.currencySymbol)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.discountCode && ` (${order.discountCode})`}:</span>
                  <span>-{formatPrice(order.discount, config.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatPrice(order.shipping, config.currencySymbol)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatPrice(order.tax, config.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(order.total, config.currencySymbol)}</span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.orderNotes && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-bold mb-2">Order Notes</h3>
              <p className="text-sm text-gray-600">{order.orderNotes}</p>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="card bg-blue-50">
          <h3 className="font-bold mb-3">What happens next?</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>We've received your order request via WhatsApp</li>
            <li>Our team will review and confirm your order</li>
            <li>You'll receive a confirmation and tracking information</li>
            <li>Your order will be shipped within 1-2 business days</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link to="/products" className="btn btn-primary flex-1 text-center">
            Continue Shopping
          </Link>
          <Link to="/" className="btn btn-outline flex-1 text-center">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
