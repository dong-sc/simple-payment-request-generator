import type {
  PaymentItem,
  PaymentRequestData,
  PaymentTotals,
} from '../types/paymentRequest';
import { clampNonNegative } from './currency';

export function calculateItemSubtotal(item: PaymentItem): number {
  const quantity = clampNonNegative(item.quantity);
  const unitPrice = clampNonNegative(item.unitPrice);

  return quantity * unitPrice;
}

export function calculateTotals(data: PaymentRequestData): PaymentTotals {
  const itemsSubtotal = data.items.reduce(
    (sum, item) => sum + calculateItemSubtotal(item),
    0,
  );
  const discountAmount = clampNonNegative(data.discountAmount);
  const taxableAmount = Math.max(0, itemsSubtotal - discountAmount);
  const taxRate = clampNonNegative(data.taxRate);
  const taxAmount = taxableAmount * (taxRate / 100);
  const requestTotal = taxableAmount + taxAmount;
  const receivedAmount = clampNonNegative(data.receivedAmount);
  const remainingAmount = Math.max(0, requestTotal - receivedAmount);

  return {
    itemsSubtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    requestTotal,
    receivedAmount,
    remainingAmount,
  };
}
