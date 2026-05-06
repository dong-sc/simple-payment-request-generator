import type { PaymentRequestData } from '../types/paymentRequest';
import { createDefaultPaymentRequestData } from './defaultPaymentRequest';

const storageKey = 'simple-payment-request-generator.payment-request-data';

function normalizePaymentRequestData(value: unknown): PaymentRequestData {
  const fallback = createDefaultPaymentRequestData();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const data = value as Partial<PaymentRequestData>;

  return {
    ...fallback,
    ...data,
    items:
      Array.isArray(data.items) && data.items.length > 0
        ? data.items.map((item) => ({ ...fallback.items[0], ...item }))
        : fallback.items,
    paymentInfo: {
      ...fallback.paymentInfo,
      ...data.paymentInfo,
    },
  };
}

export function loadPaymentRequestData(): PaymentRequestData {
  try {
    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) {
      return createDefaultPaymentRequestData();
    }

    return normalizePaymentRequestData(JSON.parse(storedValue));
  } catch {
    return createDefaultPaymentRequestData();
  }
}

export function savePaymentRequestData(data: PaymentRequestData): void {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function clearPaymentRequestData(): PaymentRequestData {
  localStorage.removeItem(storageKey);
  return createDefaultPaymentRequestData();
}
