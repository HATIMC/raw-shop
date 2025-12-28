import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readCSV } from '../services/csvService';

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

interface OrderFromCSV {
  order_id: string;
  order_date: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items_json: string;
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  total: string;
  shipping_method: string;
  payment_method: string;
  order_notes: string;
  status: string;
  admin_status: string;
  admin_comment: string;
  discount_code: string;
}

interface Order {
  orderId: string;
  orderDate: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
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
  statusHistory?: { status: string; timestamp: string; comment?: string }[];
}

export default function OrdersManager() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'cancelled'>('all');
  const [newStatus, setNewStatus] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const csv = await readCSV('orders.csv');
      
      const ordersData = csv.rows.map((row: OrderFromCSV) => {
        let items: OrderItem[] = [];
        try {
          items = JSON.parse(row.items_json || '[]');
        } catch (e) {
          console.error('Failed to parse items JSON:', e);
        }

        // Parse shipping address if stored as JSON, otherwise put the raw string into address1
        let shippingAddressObj: any = {};
        if (row.shipping_address) {
          try {
            shippingAddressObj = JSON.parse(row.shipping_address);
          } catch (e) {
            shippingAddressObj = { address1: row.shipping_address };
          }
        }

        return {
          orderId: row.order_id,
          orderDate: row.order_date,
          customer: {
            firstName: row.customer_first_name,
            lastName: row.customer_last_name,
            email: row.customer_email,
            phone: row.customer_phone,
          },
          shippingAddress: shippingAddressObj,
          items,
          subtotal: parseFloat(row.subtotal || '0'),
          tax: parseFloat(row.tax || '0'),
          shipping: parseFloat(row.shipping || '0'),
          discount: parseFloat(row.discount || '0'),
          total: parseFloat(row.total || '0'),
          shippingMethod: row.shipping_method,
          paymentMethod: row.payment_method,
          orderNotes: row.order_notes,
          status: row.status,
          adminStatus: row.admin_status || 'pending',
          adminComment: row.admin_comment || '',
          discountCode: row.discount_code,
        };
      });

      // Sort by date (newest first)
      ordersData.sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );

      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, comment: string) => {
    try {
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5174';
      const response = await fetch(`${API_URL}/api/update-order-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status, comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      await loadOrders();
      setSelectedOrder(null);
      setNewStatus('');
      setNewComment('');
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
      return;
    }

    try {
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5174';
      const response = await fetch(`${API_URL}/api/delete-order`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      await loadOrders();
      setSelectedOrder(null);
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.adminStatus === filter;
  });

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate('/orders/add')}
            className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors w-full md:w-auto"
          >
            + Add New Order
          </button>
          <div className="text-sm text-gray-600">
            Total Orders: {orders.length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending ({orders.filter(o => o.adminStatus === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          In Progress ({orders.filter(o => o.adminStatus === 'in-progress').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completed ({orders.filter(o => o.adminStatus === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cancelled ({orders.filter(o => o.adminStatus === 'cancelled').length})
        </button>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{order.orderId}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(order.orderDate)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>{order.customer.firstName} {order.customer.lastName}</div>
                      <div className="text-xs text-gray-500">{order.customer.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.items.length} item(s)</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.adminStatus || 'pending')}`}>
                        {order.adminStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Details - {selectedOrder.orderId}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer & Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-2">Customer Information</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Order Information</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                    <p>
                      <strong>Current Status:</strong>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedOrder.adminStatus || 'pending')}`}>
                        {selectedOrder.adminStatus || 'pending'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-bold mb-2">Shipping Address</h3>
                <div className="text-sm">
                  <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                  <p>{selectedOrder.shippingAddress.address1}</p>
                  {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                  {selectedOrder.shippingAddress.city !== 'N/A' && (
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  )}
                  {selectedOrder.shippingAddress.country !== 'N/A' && <p>{selectedOrder.shippingAddress.country}</p>}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded">
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.product.productName}</div>
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="text-xs text-gray-600">
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            {item.selectedColor && item.selectedSize && <span> • </span>}
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          </div>
                        )}
                        <div className="text-sm">Quantity: {item.quantity}</div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-bold mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatPrice(selectedOrder.shipping)}</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.orderNotes && (
                <div>
                  <h3 className="font-bold mb-2">Customer Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedOrder.orderNotes}</p>
                </div>
              )}

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">Status History</h3>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((entry, index) => (
                      <div key={index} className="text-sm p-3 bg-gray-50 rounded">
                        <div className="flex justify-between mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(entry.status)}`}>
                            {entry.status}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        {entry.comment && <p className="text-gray-700 mt-1">{entry.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Status Form */}
              <div className="border-t pt-6">
                <h3 className="font-bold mb-3">Update Order Status</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="input"
                    >
                      <option value="">Select Status...</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Comment / Notes</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="input"
                      rows={3}
                      placeholder="Add any notes or comments about this status update..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (!newStatus) {
                          alert('Please select a status');
                          return;
                        }
                        updateOrderStatus(selectedOrder.orderId, newStatus, newComment);
                      }}
                      className="btn-primary flex-1"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => deleteOrder(selectedOrder.orderId)}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                    >
                      Delete Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
