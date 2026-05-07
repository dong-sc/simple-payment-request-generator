import type {
  PaymentRequestData,
  PaymentTotals,
} from '../types/paymentRequest';
import { clampNonNegative, formatCurrency } from '../utils/currency';

interface TotalsSummaryProps {
  data: PaymentRequestData;
  totals: PaymentTotals;
}

export function TotalsSummary({ data, totals }: TotalsSummaryProps) {
  const taxRate = clampNonNegative(data.taxRate);
  const taxLabel = taxRate > 0 ? `稅額（${taxRate}%）` : '稅額（未稅 / 免稅）';

  return (
    <div className="totals-summary">
      <div>
        <span>請款項目小計</span>
        <strong>{formatCurrency(totals.itemsSubtotal, data.currency)}</strong>
      </div>
      <div>
        <span>折扣</span>
        <strong>{formatCurrency(totals.discountAmount, data.currency)}</strong>
      </div>
      <div>
        <span>{taxLabel}</span>
        <strong>{formatCurrency(totals.taxAmount, data.currency)}</strong>
      </div>
      <div>
        <span>本次請款金額</span>
        <strong>{formatCurrency(totals.requestTotal, data.currency)}</strong>
      </div>
      <div>
        <span>已收訂金 / 已收款項</span>
        <strong>{formatCurrency(totals.receivedAmount, data.currency)}</strong>
      </div>
      <div className="grand-row">
        <span>尚待支付金額</span>
        <strong>{formatCurrency(totals.remainingAmount, data.currency)}</strong>
      </div>
    </div>
  );
}
