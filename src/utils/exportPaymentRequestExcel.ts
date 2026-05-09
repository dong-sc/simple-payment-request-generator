import type {
  PaymentInfo,
  PaymentRequestData,
  PaymentTotals,
} from '../types/paymentRequest';
import { calculateItemSubtotal } from './calculation';
import { clampNonNegative, formatCurrency } from './currency';
import { addDays } from './date';
import {
  formatPaymentItemCategory,
  formatPaymentItemName,
  getGroupedPaymentItems,
} from './items';

type CellValue = string | number;
type MergeRange = {
  s: { r: number; c: number };
  e: { r: number; c: number };
};

const methodLabels: Record<PaymentInfo['method'], string> = {
  bank_transfer: '銀行轉帳',
  cash: '現金',
  check: '支票',
  paypal: 'PayPal',
  other: '其他',
};

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function safeFilePart(value: string): string {
  return cleanText(value).replace(/[\\/:*?"<>|]/g, '-');
}

function getPaymentMethodLabel(paymentInfo: PaymentInfo): string {
  if (paymentInfo.method === 'other') {
    return cleanText(paymentInfo.customMethod) || '其他';
  }

  return methodLabels[paymentInfo.method];
}

function getExportFileName(data: PaymentRequestData): string {
  const date = cleanText(data.issueDate) || new Date().toISOString().slice(0, 10);
  const clientName = safeFilePart(data.clientName || data.clientCompany);
  const datePart = safeFilePart(date);

  return clientName
    ? `請款單_${clientName}_${datePart}.xlsx`
    : `請款單_${datePart}.xlsx`;
}

function pushMergedRow(
  rows: CellValue[][],
  merges: MergeRange[],
  values: CellValue[],
  endColumn: number,
): void {
  const rowIndex = rows.length;
  rows.push(values);
  merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: endColumn } });
}

function pushSectionTitle(
  rows: CellValue[][],
  merges: MergeRange[],
  title: string,
): void {
  if (rows.length > 0) {
    rows.push([]);
  }

  pushMergedRow(rows, merges, [title], 8);
}

function pushWideRow(
  rows: CellValue[][],
  merges: MergeRange[],
  label: string,
  value: CellValue,
): void {
  const rowIndex = rows.length;
  rows.push([label, value, '', '', '', '', '', '', '']);
  merges.push({ s: { r: rowIndex, c: 1 }, e: { r: rowIndex, c: 8 } });
}

function pushPartyInfo(
  rows: CellValue[][],
  merges: MergeRange[],
  leftRows: CellValue[][],
  rightRows: CellValue[][],
): void {
  const headingRowIndex = rows.length;
  rows.push(['請款方資訊', '', '', '', '客戶資訊', '', '', '', '']);
  merges.push({ s: { r: headingRowIndex, c: 0 }, e: { r: headingRowIndex, c: 3 } });
  merges.push({ s: { r: headingRowIndex, c: 4 }, e: { r: headingRowIndex, c: 7 } });

  const rowCount = Math.max(leftRows.length, rightRows.length);
  for (let index = 0; index < rowCount; index += 1) {
    const leftRow = leftRows[index] ?? ['', ''];
    const rightRow = rightRows[index] ?? ['', ''];
    rows.push([leftRow[0], leftRow[1], '', '', rightRow[0], rightRow[1], '', '', '']);
  }
}

export async function exportPaymentRequestExcel(
  data: PaymentRequestData,
  totals: PaymentTotals,
): Promise<void> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const dueDate = addDays(data.issueDate, data.dueDays);
  const taxRate = clampNonNegative(data.taxRate);

  const rows: CellValue[][] = [];
  const merges: MergeRange[] = [];

  pushMergedRow(rows, merges, [cleanText(data.title) || '請款單'], 8);
  rows.push([
    '文件類型',
    '請款單',
    '',
    '請款單編號',
    cleanText(data.requestNumber),
    '請款日期',
    cleanText(data.issueDate),
    '',
    '',
  ]);
  rows.push([
    '幣別',
    data.currency,
    '',
    '付款期限',
    dueDate,
    '匯出日期',
    new Date().toISOString().slice(0, 10),
    '',
    '',
  ]);
  pushSectionTitle(rows, merges, '請款資訊');
  rows.push(
    ['請款單標題', cleanText(data.title), '', '', '付款期限天數', `${data.dueDays || 0} 天`, '', '', ''],
    ['對應報價單編號', cleanText(data.relatedQuoteNumber), '', '', '專案名稱', cleanText(data.projectName), '', '', ''],
  );
  rows.push([]);
  pushPartyInfo(
    rows,
    merges,
    [
      ['聯絡人', cleanText(data.issuerName)],
      ['公司名稱', cleanText(data.issuerCompany)],
      ['統編', cleanText(data.issuerTaxId)],
      ['Email', cleanText(data.issuerEmail)],
      ['電話', cleanText(data.issuerPhone)],
      ['地址', cleanText(data.issuerAddress)],
      ['網站', cleanText(data.issuerWebsite)],
    ],
    [
      ['聯絡人', cleanText(data.clientName)],
      ['公司名稱', cleanText(data.clientCompany)],
      ['統編', cleanText(data.clientTaxId)],
      ['Email', cleanText(data.clientEmail)],
      ['電話', cleanText(data.clientPhone)],
      ['地址', cleanText(data.clientAddress)],
      ['網站', cleanText(data.clientWebsite)],
    ],
  );

  pushSectionTitle(rows, merges, '請款項目');
  rows.push(
    ['序號', '類別', '品項名稱', '說明', '數量', '單位', '單價', '小計', '備註'],
    ...getGroupedPaymentItems(data.items).map(({ item, originalIndex }, index) => [
      index + 1,
      formatPaymentItemCategory(item),
      formatPaymentItemName(item, originalIndex),
      cleanText(item.description),
      clampNonNegative(item.quantity),
      cleanText(item.unit),
      formatCurrency(item.unitPrice, data.currency),
      formatCurrency(calculateItemSubtotal(item), data.currency),
      '',
    ]),
  );

  pushSectionTitle(rows, merges, '金額摘要');
  rows.push(
    ['', '', '', '', '欄位', '', '金額 / 內容', '', ''],
    ['', '', '', '', '請款項目小計', '', formatCurrency(totals.itemsSubtotal, data.currency), '', ''],
    ['', '', '', '', '折扣', '', formatCurrency(totals.discountAmount, data.currency), '', ''],
    ['', '', '', '', '折扣後金額', '', formatCurrency(totals.taxableAmount, data.currency), '', ''],
    ['', '', '', '', '稅率', '', `${taxRate}%`, '', ''],
    ['', '', '', '', '稅額', '', formatCurrency(totals.taxAmount, data.currency), '', ''],
    ['', '', '', '', '本次請款金額', '', formatCurrency(totals.requestTotal, data.currency), '', ''],
    ['', '', '', '', '已收訂金 / 已收款項', '', formatCurrency(totals.receivedAmount, data.currency), '', ''],
    ['', '', '', '', '尚待支付金額', '', formatCurrency(totals.remainingAmount, data.currency), '', ''],
  );

  pushSectionTitle(rows, merges, '付款資訊');
  pushWideRow(rows, merges, '付款方式', getPaymentMethodLabel(data.paymentInfo));
  pushWideRow(rows, merges, '銀行名稱', cleanText(data.paymentInfo.bankName));
  pushWideRow(rows, merges, '分行名稱', cleanText(data.paymentInfo.branchName));
  pushWideRow(rows, merges, '銀行代碼', cleanText(data.paymentInfo.bankCode));
  pushWideRow(rows, merges, '帳號', cleanText(data.paymentInfo.accountNumber));
  pushWideRow(rows, merges, '戶名', cleanText(data.paymentInfo.accountName));
  pushWideRow(rows, merges, '付款備註', cleanText(data.paymentInfo.paymentNote));
  pushWideRow(
    rows,
    merges,
    '匯款後回覆方式',
    cleanText(data.paymentInfo.confirmationInstruction),
  );

  pushSectionTitle(rows, merges, '備註與條款');
  pushWideRow(rows, merges, '請款備註', cleanText(data.requestNotes));
  pushWideRow(rows, merges, '付款條款', cleanText(data.paymentTerms));
  pushWideRow(rows, merges, '交付說明', cleanText(data.deliveryNotes));

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 30 },
    { wch: 10 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
  ];
  worksheet['!merges'] = merges;
  XLSX.utils.book_append_sheet(workbook, worksheet, '請款單資料');

  XLSX.writeFile(workbook, getExportFileName(data), { compression: true });
}
