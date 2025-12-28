import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address').optional().or(z.literal(''));

export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits');

export const addressSchema = z.object({
  address: z.string().min(10, 'Please enter your complete address'),
});

export const customerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema,
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  shippingAddress: addressSchema,
  shippingMethod: z.string().min(1, 'Please select a shipping method'),
  orderNotes: z.string().optional(),
  sameAsShipping: z.boolean().default(false),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
