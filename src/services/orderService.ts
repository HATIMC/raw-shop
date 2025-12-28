import type { Order } from '@/types/order';
import type { StoreConfig } from '@/types/config';

/**
 * Format order for WhatsApp message - Pretty JSON format
 */
export function formatWhatsAppMessage(order: Order): string {
  const userId = getUserId();
  
  const orderData = {
    orderId: order.orderId,
    orderDate: order.orderDate,
    userId: userId,
    customer: {
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      email: order.customer.email || '',
      phone: order.customer.phone,
    },
    shippingAddress: order.shippingAddress.address1,
    items: order.items.map(item => ({
      productId: item.product.productId,
      productName: item.product.productName,
      quantity: item.quantity,
      price: item.product.price,
      thumbnail: item.product.thumbnail,
      color: item.selectedColor || '',
      size: item.selectedSize || '',
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    shippingMethod: order.shippingMethod.shippingName,
    paymentMethod: order.paymentMethod,
    orderNotes: order.orderNotes,
    discountCode: order.discountCode || '',
  };
  
  // Pretty-printed JSON for human readability and easy parsing
  return JSON.stringify(orderData, null, 2);
}

/**
 * Send order via WhatsApp
 */
export function sendOrderToWhatsApp(order: Order, config: StoreConfig): void {
  if (!config.whatsappNumber) {
    console.error('WhatsApp number not configured');
    return;
  }

  const message = formatWhatsAppMessage(order);
  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = config.whatsappNumber.replace(/\D/g, '');
  
  const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  
  // Open WhatsApp in new window
  window.open(url, '_blank');
}

/**
 * Send order via Email (mailto link)
 */
export function sendOrderToEmail(order: Order, config: StoreConfig): void {
  if (!config.storeEmail) {
    console.error('Store email not configured');
    return;
  }

  const subject = `New Order #${order.orderId}`;
  const body = formatWhatsAppMessage(order);
  
  const mailto = `mailto:${config.storeEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

/**
 * Get or create user ID for tracking orders
 */
export function getUserId(): string {
  let userId = localStorage.getItem('userId');
  
  if (!userId) {
    // Generate unique user ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  
  return userId;
}

/**
 * Process order submission - Saves to localStorage only, then sends WhatsApp
 * Admin will manually add to CSV after receiving WhatsApp
 */
export async function submitOrder(order: Order, config: StoreConfig): Promise<void> {
  const userId = getUserId();
  
  // Save order to localStorage with userId
  try {
    const orderWithUserId = { ...order, userId };
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderWithUserId);
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('Order saved to localStorage successfully');
  } catch (error) {
    console.error('Failed to save order to localStorage:', error);
  }

  // Send notification based on config
  const method = config.orderNotificationMethod || 'whatsapp';
  
  if (method === 'whatsapp') {
    sendOrderToWhatsApp(order, config);
  } else if (method === 'email') {
    sendOrderToEmail(order, config);
  }
}
