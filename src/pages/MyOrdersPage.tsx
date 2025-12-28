import { useState, useEffect } from 'react';
import { getUserId } from '@/services/orderService';
import { readCSV } from '@/utils/csvReader';

interface OrderItem {
  product: {
    productId: string;
    productName: string;
    price: number;
    thumbnail: string;
  };
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface Order {
  userId: string;
  orderId: string;
  orderDate: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingMethod: string;
  paymentMethod: string;
  orderNotes: string;
  status: string;
  adminStatus: string;
  adminComment: string;
  discountCode: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const userId = getUserId();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Load orders from localStorage (cached with all details)
      const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const userOrders = localOrders.filter((order: any) => order.userId === userId);
      
      // Read order statuses from CSV directly (no API calls)
      const orderStatuses: Record<string, { adminStatus: string; adminComment: string }> = {};
      
      try {
        const csv = await readCSV('orders.csv');
        csv.rows.forEach((row: any) => {
          // Filter by userId and map status
          if (row.user_id === userId) {
            orderStatuses[row.order_id] = {
              adminStatus: row.admin_status || 'pending',
              adminComment: row.admin_comment || '',
            };
          }
        });
      } catch (error) {
        console.log('Could not read order statuses from CSV, using pending status');
      }
      
      // Map orders with status from CSV (or default to pending)
      const ordersWithStatus = userOrders.map((order: any) => {
        const csvStatus = orderStatuses[order.orderId] || { adminStatus: 'pending', adminComment: '' };
        
        return {
          userId: order.userId,
          orderId: order.orderId,
          orderDate: order.orderDate,
          customerFirstName: order.customer.firstName,
          customerLastName: order.customer.lastName,
          customerEmail: order.customer.email,
          customerPhone: order.customer.phone,
          shippingAddress: order.shippingAddress.address1,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          shippingMethod: order.shippingMethod.shippingName,
          paymentMethod: order.paymentMethod,
          orderNotes: order.orderNotes,
          status: order.status,
          adminStatus: csvStatus.adminStatus,
          adminComment: csvStatus.adminComment,
          discountCode: order.discountCode,
        };
      });

      // Sort by date (newest first)
      ordersWithStatus.sort((a: Order, b: Order) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );

      setOrders(ordersWithStatus);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const deleteOrder = (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      // Remove from localStorage only (shop portal is read-only for CSV)
      const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = localOrders.filter((order: any) => order.orderId !== orderId);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Note: CSV deletion must be done by admin portal
      // This only removes from local cache

      // Reload orders
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-8">Start shopping to see your orders here!</p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order #{order.orderId}</h2>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(order.orderDate)}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(order.adminStatus)}`}>
                    {order.adminStatus.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-primary hover:text-secondary font-semibold transition-colors"
                  >
                    View Details →
                  </button>
                  <button
                    onClick={() => deleteOrder(order.orderId)}
                    className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                    title="Delete order"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Items ({order.items.length})</h3>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.productName}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.product.productName}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600">+ {order.items.length - 2} more items</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">{formatPrice(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {order.adminComment && (
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Update from Shop:</p>
                  <p className="text-sm text-blue-700">{order.adminComment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order #{selectedOrder.orderId}</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => deleteOrder(selectedOrder.orderId)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Delete Order
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedOrder.customerFirstName} {selectedOrder.customerLastName}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Shipping Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-line">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.product.productName}</h4>
                        {item.selectedColor && <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>}
                        {item.selectedSize && <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>}
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.product.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {selectedOrder.discountCode && `(${selectedOrder.discountCode})`}:</span>
                      <span className="font-medium">-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tax:</span>
                      <span className="font-medium">{formatPrice(selectedOrder.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-700">Shipping:</span>
                    <span className="font-medium">{formatPrice(selectedOrder.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-gray-300">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.orderNotes && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Order Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedOrder.orderNotes}</p>
                  </div>
                </div>
              )}

              {/* Status & Comment */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-700">Status:</span>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(selectedOrder.adminStatus)}`}>
                      {selectedOrder.adminStatus.toUpperCase()}
                    </span>
                  </div>
                  {selectedOrder.adminComment && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                      <p className="text-sm font-semibold text-blue-800 mb-1">Latest Update:</p>
                      <p className="text-sm text-blue-700">{selectedOrder.adminComment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
