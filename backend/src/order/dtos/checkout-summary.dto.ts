export class CheckoutSummaryDto {
  subtotal: number;
  tax: number;
  discount: number;
  deliveryCost: number;
  total: number;
  currency: string;
  shippingAddress?: string | null;
  shippingPhone?: string | null;
  deliveryNotes?: string | null;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    taxAmount: number;
    total: number;
  }[];
}