import type { PaymentItem, PaymentRequestData } from '../types/paymentRequest';
import { getTodayString } from './date';

export const paymentTextTemplates = [
  '請於付款期限內完成付款。',
  '匯款後請回覆帳號末五碼，以便核對款項。',
  '本請款單僅作為款項通知使用，實際交易內容依雙方確認之報價或合約為準。',
  '若需開立發票，請提前提供完整抬頭與統編資訊。',
  '逾期付款可能影響後續交付或服務安排。',
];

export function createEmptyItem(): PaymentItem {
  return {
    id: crypto.randomUUID(),
    category: '',
    name: '',
    description: '',
    quantity: 1,
    unit: '式',
    unitPrice: 0,
  };
}

export function createDefaultPaymentRequestData(): PaymentRequestData {
  return {
    title: '請款單',
    requestNumber: '',
    relatedQuoteNumber: '',
    projectName: '',
    issueDate: getTodayString(),
    dueDays: 7,
    currency: 'TWD',
    issuerName: '',
    issuerCompany: '',
    issuerTaxId: '',
    issuerEmail: '',
    issuerPhone: '',
    issuerAddress: '',
    issuerWebsite: '',
    issuerLogoImage: '',
    clientName: '',
    clientCompany: '',
    clientTaxId: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientWebsite: '',
    items: [createEmptyItem()],
    discountAmount: 0,
    taxRate: 5,
    receivedAmount: 0,
    paymentInfo: {
      method: 'bank_transfer',
      customMethod: '',
      bankName: '',
      branchName: '',
      bankCode: '',
      accountNumber: '',
      accountName: '',
      paymentNote: '',
      confirmationInstruction: '匯款後請回覆末五碼，謝謝。',
    },
    requestNotes: '',
    paymentTerms: '',
    deliveryNotes: '',
  };
}
