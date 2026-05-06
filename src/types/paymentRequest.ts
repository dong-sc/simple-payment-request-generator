export type Currency = 'TWD' | 'USD' | 'JPY' | 'HKD' | 'CNY';

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
  quantity: number;
  unit: string;
  unitPrice: number;
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
  dueDays: number;
  currency: Currency;
  issuerName: string;
  issuerTaxId: string;
  issuerEmail: string;
  issuerPhone: string;
  issuerAddress: string;
  issuerWebsite: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  items: PaymentItem[];
  discountAmount: number;
  taxRate: number;
  receivedAmount: number;
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
