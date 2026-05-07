import type { Currency } from '../types/paymentRequest';

const currencyPrefixes: Record<Currency, string> = {
  TWD: 'NT$',
  USD: 'USD ',
  JPY: 'JPY ',
  HKD: 'HKD ',
  CNY: 'CNY ',
};

export function parseSafeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return 0;
    }

    const parsedValue = Number(trimmedValue.replaceAll(',', ''));
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}

export function clampNonNegative(value: unknown): number {
  return Math.max(0, parseSafeNumber(value));
}

export function parseNumberInput(value: string): number | '' {
  if (value.trim() === '') {
    return '';
  }

  return clampNonNegative(value);
}

export function formatCurrency(amount: unknown, currency: Currency): string {
  const safeAmount = clampNonNegative(amount);
  const roundedAmount = Math.round(safeAmount);

  return `${currencyPrefixes[currency]}${roundedAmount.toLocaleString('en-US')}`;
}
