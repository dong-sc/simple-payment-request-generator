import type {
  PaymentInfo,
  PaymentRequestData,
  PaymentTotals,
} from '../types/paymentRequest';
import { calculateItemSubtotal } from './calculation';
import { clampNonNegative, formatCurrency } from './currency';
import { addDays } from './date';

const methodLabels: Record<PaymentInfo['method'], string> = {
  bank_transfer: '銀行轉帳',
  cash: '現金',
  check: '支票',
  paypal: 'PayPal',
  other: '其他',
};

function optionalLine(label: string, value: string): string[] {
  return value.trim() ? [`${label}：${value.trim()}`] : [];
}

function getPaymentMethodLabel(paymentInfo: PaymentInfo): string {
  if (paymentInfo.method === 'other') {
    return paymentInfo.customMethod.trim() || '其他';
  }

  return methodLabels[paymentInfo.method];
}

export function generatePaymentRequestPlainText(
  data: PaymentRequestData,
  totals: PaymentTotals,
): string {
  const dueDate = addDays(data.issueDate, data.dueDays);
  const taxRate = clampNonNegative(data.taxRate);
  const taxLabel = taxRate > 0 ? `稅額（${taxRate}%）` : '稅額（未稅 / 免稅）';
  const itemLines = data.items.map((item, index) => {
    const name = item.name.trim() || `品項 ${index + 1}`;
    const description = item.description.trim()
      ? `，說明：${item.description.trim()}`
      : '';

    return `${index + 1}. ${name}${description}，數量：${item.quantity || 0} ${
      item.unit || ''
    }，單價：${formatCurrency(item.unitPrice || 0, data.currency)}，小計：${formatCurrency(
      calculateItemSubtotal(item),
      data.currency,
    )}`;
  });

  return [
    data.title,
    ...optionalLine('請款單編號', data.requestNumber),
    ...optionalLine('對應報價單編號', data.relatedQuoteNumber),
    ...optionalLine('專案名稱', data.projectName),
    '',
    '請款方',
    ...optionalLine('聯絡人', data.issuerName),
    ...optionalLine('公司名稱', data.issuerCompany),
    ...optionalLine('統編', data.issuerTaxId),
    ...optionalLine('Email', data.issuerEmail),
    ...optionalLine('電話', data.issuerPhone),
    ...optionalLine('地址', data.issuerAddress),
    ...optionalLine('網站', data.issuerWebsite),
    '',
    '客戶',
    ...optionalLine('聯絡人', data.clientName),
    ...optionalLine('公司名稱', data.clientCompany),
    ...optionalLine('統編', data.clientTaxId),
    ...optionalLine('Email', data.clientEmail),
    ...optionalLine('電話', data.clientPhone),
    ...optionalLine('地址', data.clientAddress),
    ...optionalLine('網站', data.clientWebsite),
    '',
    `請款日期：${data.issueDate}`,
    `付款期限：${data.dueDays} 天（至 ${dueDate}）`,
    '',
    '請款項目',
    ...itemLines,
    '',
    `請款項目小計：${formatCurrency(totals.itemsSubtotal, data.currency)}`,
    `折扣：${formatCurrency(totals.discountAmount, data.currency)}`,
    `${taxLabel}：${formatCurrency(totals.taxAmount, data.currency)}`,
    `本次請款金額：${formatCurrency(totals.requestTotal, data.currency)}`,
    `已收訂金 / 已收款項：${formatCurrency(totals.receivedAmount, data.currency)}`,
    `尚待支付金額：${formatCurrency(totals.remainingAmount, data.currency)}`,
    '',
    `付款方式：${getPaymentMethodLabel(data.paymentInfo)}`,
    ...optionalLine('銀行名稱', data.paymentInfo.bankName),
    ...optionalLine('分行名稱', data.paymentInfo.branchName),
    ...optionalLine('銀行代碼', data.paymentInfo.bankCode),
    ...optionalLine('帳號', data.paymentInfo.accountNumber),
    ...optionalLine('戶名', data.paymentInfo.accountName),
    ...optionalLine('付款備註', data.paymentInfo.paymentNote),
    ...optionalLine('匯款後回覆方式', data.paymentInfo.confirmationInstruction),
    '',
    ...optionalLine('請款備註', data.requestNotes),
    ...optionalLine('付款條款', data.paymentTerms),
    ...optionalLine('交付說明', data.deliveryNotes),
  ]
    .filter((line, index, lines) => !(line === '' && lines[index - 1] === ''))
    .join('\n');
}
