export type Currency = 'TWD' | 'USD' | 'JPY' | 'HKD' | 'CNY';
export type NumericInputValue = number | '';

export type PaymentMethod =
  | 'bank_transfer'
  | 'cash'
  | 'check'
  | 'paypal'
  | 'other';

export interface PaymentItem {
  id: string;
  name: string;
  description: string;
  quantity: NumericInputValue;
  unit: string;
  unitPrice: NumericInputValue;
}

export interface PaymentInfo {
  method: PaymentMethod;
  customMethod: string;
  bankName: string;
  branchName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  paymentNote: string;
  confirmationInstruction: string;
}

export interface PaymentRequestData {
  title: string;
  requestNumber: string;
  relatedQuoteNumber: string;
  projectName: string;
  issueDate: string;
  dueDays: NumericInputValue;
  currency: Currency;
  issuerName: string;
  issuerCompany: string;
  issuerTaxId: string;
  issuerEmail: string;
  issuerPhone: string;
  issuerAddress: string;
  issuerWebsite: string;
  clientName: string;
  clientCompany: string;
  clientTaxId: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientWebsite: string;
  items: PaymentItem[];
  discountAmount: NumericInputValue;
  taxRate: NumericInputValue;
  receivedAmount: NumericInputValue;
  paymentInfo: PaymentInfo;
  requestNotes: string;
  paymentTerms: string;
  deliveryNotes: string;
}

export interface PaymentTotals {
  itemsSubtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  requestTotal: number;
  receivedAmount: number;
  remainingAmount: number;
}
