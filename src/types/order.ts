import { CartItem } from './cart';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface ShippingMethod {
  shippingId: string;
  shippingName: string;
  shippingType: string;
  shippingCost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  description: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'confirmed' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export interface Order {
  orderId: string;
  orderDate: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: string;
  orderNotes?: string;
  status: OrderStatus;
  discountCode?: string;
}

export interface OrderFormData {
  customer: CustomerInfo;
  shippingAddress: Address;
  billingAddress: Address;
  sameAsShipping: boolean;
  shippingMethod: string;
  orderNotes?: string;
}
