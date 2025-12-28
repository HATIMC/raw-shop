import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCSV, readCSV } from '../services/csvService';

interface OrderFormData {
  userId: string;
  orderId: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    price: number;
    thumbnail?: string;
    color?: string;
    size?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingMethod: string;
  paymentMethod: string;
  orderNotes: string;
  adminStatus: string;
  adminComment: string;
  discountCode: string;
}

export default function AddOrderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [formData, setFormData] = useState<OrderFormData>({
    userId: '',
    orderId: '',
    customerFirstName: '',
    customerLastName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    items: [{ productId: '', productName: '', quantity: 1, price: 0, thumbnail: '' }],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    shippingMethod: 'Standard Shipping',
    paymentMethod: 'Cash on Delivery',
    orderNotes: '',
    adminStatus: 'pending',
    adminComment: '',
    discountCode: '',
  });

  const parseWhatsAppMessage = (message: string) => {
    try {
      // Parse the entire message as JSON
      const orderData = JSON.parse(message.trim());
      
      // Map to form data
      const formUpdate: any = {
        userId: orderData.userId || '',
        orderId: orderData.orderId || '',
        customerFirstName: orderData.customer?.firstName || '',
        customerLastName: orderData.customer?.lastName || '',
        customerEmail: orderData.customer?.email || '',
        customerPhone: orderData.customer?.phone || '',
        shippingAddress: orderData.shippingAddress || '',
        subtotal: parseFloat(orderData.subtotal) || 0,
        tax: parseFloat(orderData.tax) || 0,
        shipping: parseFloat(orderData.shipping) || 0,
        discount: parseFloat(orderData.discount) || 0,
        total: parseFloat(orderData.total) || 0,
        shippingMethod: orderData.shippingMethod || 'Standard Shipping',
        paymentMethod: orderData.paymentMethod || 'WhatsApp Order',
        orderNotes: orderData.orderNotes || '',
        discountCode: orderData.discountCode || '',
      };
      
      // Map items
      if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
        formUpdate.items = orderData.items.map((item: any) => ({
          productId: item.productId || '',
          productName: item.productName || '',
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
          thumbnail: item.thumbnail || '',
          color: item.color || '',
          size: item.size || '',
        }));
      }
      
      // Update form
      setFormData(prev => ({
        ...prev,
        ...formUpdate,
      }));
      
      alert('Order data parsed successfully!');
    } catch (error) {
      console.error('Failed to parse WhatsApp message:', error);
      alert('Failed to parse message. Please ensure you copied the complete JSON.');
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
    calculateTotals(newItems, formData.shipping, formData.discount, formData.tax);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', productName: '', quantity: 1, price: 0, thumbnail: '' }],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
    calculateTotals(newItems, formData.shipping, formData.discount, formData.tax);
  };

  const calculateTotals = (items: any[], shipping: number, discount: number, tax: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + tax + shipping - discount;
    setFormData(prev => ({ ...prev, subtotal, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.orderId || !formData.customerFirstName || !formData.customerPhone) {
      alert('Please fill in all required fields (User ID, Order ID, Name, Phone)');
      return;
    }

    setLoading(true);

    try {
      const csv = await readCSV('orders.csv');
      
      // Create items JSON
      const itemsJson = JSON.stringify(formData.items.map(item => ({
        product: {
          productId: item.productId || '',
          productName: item.productName,
          price: item.price,
          thumbnail: item.thumbnail || '',
        },
        quantity: item.quantity,
        selectedColor: item.color || '',
        selectedSize: item.size || '',
      })));

      // Create new row
      const newRow = {
        user_id: formData.userId,
        order_id: formData.orderId,
        order_date: new Date().toISOString(),
        customer_first_name: formData.customerFirstName,
        customer_last_name: formData.customerLastName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        shipping_address: formData.shippingAddress,
        items_json: itemsJson,
        subtotal: formData.subtotal.toString(),
        tax: formData.tax.toString(),
        shipping: formData.shipping.toString(),
        discount: formData.discount.toString(),
        total: formData.total.toString(),
        shipping_method: formData.shippingMethod,
        payment_method: formData.paymentMethod,
        order_notes: formData.orderNotes,
        status: 'pending',
        admin_status: formData.adminStatus,
        admin_comment: formData.adminComment,
        discount_code: formData.discountCode,
      };

      // Add new row to CSV
      const updatedRows = [...csv.rows, newRow];
      await saveCSV('orders.csv', updatedRows);

      alert('Order added successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Failed to add order:', error);
      alert('Failed to add order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Add New Order</h1>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
        >
          ← Back to Orders
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WhatsApp Message Parser */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">📋 Paste WhatsApp JSON</h2>
          <p className="text-sm text-blue-700 mb-4">
            Paste the JSON from WhatsApp to auto-fill the form
          </p>
          <textarea
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={12}
            placeholder='Paste JSON here...&#10;{&#10;  "orderId": "ORD-123",&#10;  "customer": {...},&#10;  ...&#10;}'
          />
          <button
            type="button"
            onClick={() => parseWhatsAppMessage(whatsappMessage)}
            className="mt-3 px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
          >
            Parse & Auto-Fill
          </button>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="user_1234567890_abc123"
                required
              />
              <p className="text-xs text-gray-500 mt-1">User's unique identifier from localStorage</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ORD-1234567890"
                required
              />
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Customer Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerFirstName}
                onChange={(e) => handleInputChange('customerFirstName', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.customerLastName}
                onChange={(e) => handleInputChange('customerLastName', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
            <textarea
              value={formData.shippingAddress}
              onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Order Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Add Item
            </button>
          </div>
          {formData.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    value={item.color || ''}
                    onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <input
                    type="text"
                    value={item.size || ''}
                    onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Totals</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal (₹)</label>
              <input
                type="number"
                value={formData.subtotal}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.tax}
                onChange={(e) => {
                  const tax = parseFloat(e.target.value) || 0;
                  handleInputChange('tax', tax);
                  calculateTotals(formData.items, formData.shipping, formData.discount, tax);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.shipping}
                onChange={(e) => {
                  const shipping = parseFloat(e.target.value) || 0;
                  handleInputChange('shipping', shipping);
                  calculateTotals(formData.items, shipping, formData.discount, formData.tax);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0;
                  handleInputChange('discount', discount);
                  calculateTotals(formData.items, formData.shipping, discount, formData.tax);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Total (₹)</label>
            <input
              type="number"
              value={formData.total}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-bold text-lg"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Additional Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Method</label>
              <input
                type="text"
                value={formData.shippingMethod}
                onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <input
                type="text"
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code</label>
              <input
                type="text"
                value={formData.discountCode}
                onChange={(e) => handleInputChange('discountCode', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Status</label>
              <select
                value={formData.adminStatus}
                onChange={(e) => handleInputChange('adminStatus', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
            <textarea
              value={formData.orderNotes}
              onChange={(e) => handleInputChange('orderNotes', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Comment</label>
            <textarea
              value={formData.adminComment}
              onChange={(e) => handleInputChange('adminComment', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Visible to customer"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Adding Order...' : 'Add Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
