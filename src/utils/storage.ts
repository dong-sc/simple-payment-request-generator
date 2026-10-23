import type { PaymentRequestData } from '../types/paymentRequest';
import { createDefaultPaymentRequestData } from './defaultPaymentRequest';

const storageKey = 'simple-payment-request-generator.payment-request-data';

function normalizePaymentRequestData(value: unknown): PaymentRequestData {
  const fallback = createDefaultPaymentRequestData();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const data = value as Partial<PaymentRequestData>;
  const issuerCompany =
    data.issuerCompany ??
    (!data.issuerTaxId && !data.issuerEmail && !data.issuerPhone
      ? (data.issuerName ?? '')
      : '');

  return {
    ...fallback,
    ...data,
    issuerCompany,
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

export function savePaymentRequestData(data: PaymentRequestData): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch {
    // Keep the current document usable when browser storage is unavailable or full.
    return false;
  }
}

export function clearPaymentRequestData(): PaymentRequestData {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Reset the in-memory document even when browser storage is unavailable.
  }
  return createDefaultPaymentRequestData();
}
