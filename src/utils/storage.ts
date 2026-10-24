import type { PaymentRequestData } from '../types/paymentRequest';
import { createDefaultPaymentRequestData } from './defaultPaymentRequest';

const storageKey = 'simple-payment-request-generator.payment-request-data';

// Do not let mount autosave overwrite a draft that could not be read.
let preserveUnreadDraft = false;
let expectedStoredValue: string | null | undefined;

function normalizePaymentRequestData(value: unknown): PaymentRequestData {
  const fallback = createDefaultPaymentRequestData();

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid stored draft');
  }

  if ('title' in value && typeof value.title !== 'string') {
    throw new Error('Invalid stored draft title');
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
    expectedStoredValue = storedValue;
    if (!storedValue) {
      return createDefaultPaymentRequestData();
    }

    return normalizePaymentRequestData(JSON.parse(storedValue));
  } catch {
    preserveUnreadDraft = true;
    return createDefaultPaymentRequestData();
  }
}

export function savePaymentRequestData(data: PaymentRequestData): boolean {
  if (preserveUnreadDraft) return false;

  try {
    // Best-effort conflict detection; localStorage has no atomic compare-and-swap.
    if (localStorage.getItem(storageKey) !== expectedStoredValue) {
      preserveUnreadDraft = true;
      return false;
    }
    const serialized = JSON.stringify(data);
    localStorage.setItem(storageKey, serialized);
    expectedStoredValue = serialized;
    return true;
  } catch {
    // Keep the current document usable when browser storage is unavailable or full.
    return false;
  }
}

export function clearPaymentRequestData(): PaymentRequestData {
  // An explicit reset authorizes replacing an unread draft.
  preserveUnreadDraft = false;
  try {
    localStorage.removeItem(storageKey);
    expectedStoredValue = null;
  } catch {
    // Reset the in-memory document even when browser storage is unavailable.
  }
  return createDefaultPaymentRequestData();
}
