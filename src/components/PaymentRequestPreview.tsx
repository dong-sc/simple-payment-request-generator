import type {
  PaymentInfo,
  PaymentRequestData,
  PaymentTotals,
} from '../types/paymentRequest';
import { calculateItemSubtotal } from '../utils/calculation';
import { formatCurrency } from '../utils/currency';
import { addDays } from '../utils/date';

interface PaymentRequestPreviewProps {
  data: PaymentRequestData;
  totals: PaymentTotals;
}

const methodLabels: Record<PaymentInfo['method'], string> = {
  bank_transfer: '銀行轉帳',
  cash: '現金',
  check: '支票',
  paypal: 'PayPal',
  other: '其他',
};

function DetailLine({ label, value }: { label: string; value: string }) {
  if (!value.trim()) {
    return null;
  }

  return (
    <p>
      <span>{label}</span>
      {value}
    </p>
  );
}

function AlignedDetailLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p className={value.trim() ? undefined : 'empty-detail'}>
      <span>{label}</span>
      {value.trim() || '\u00A0'}
    </p>
  );
}

function MultilineBlock({ title, value }: { title: string; value: string }) {
  if (!value.trim()) {
    return null;
  }

  return (
    <section className="preview-block">
      <h3>{title}</h3>
      <p className="multiline">{value}</p>
    </section>
  );
}

function getPaymentMethodLabel(paymentInfo: PaymentInfo): string {
  if (paymentInfo.method === 'other') {
    return paymentInfo.customMethod.trim() || '其他';
  }

  return methodLabels[paymentInfo.method];
}

export function PaymentRequestPreview({
  data,
  totals,
}: PaymentRequestPreviewProps) {
  const dueDate = addDays(data.issueDate, data.dueDays);
  const taxLabel = data.taxRate > 0 ? `稅額（${data.taxRate}%）` : '稅額（未稅 / 免稅）';

  return (
    <aside className="preview-pane" aria-label="請款單預覽">
      <article className="payment-preview">
        <header className="preview-header">
          <div>
            <p className="preview-label">Payment Request</p>
            <h2>{data.title || '請款單'}</h2>
          </div>
          <div className="preview-meta">
            <DetailLine label="編號" value={data.requestNumber} />
            <DetailLine label="報價單" value={data.relatedQuoteNumber} />
            <DetailLine label="專案" value={data.projectName} />
            <DetailLine label="請款日" value={data.issueDate} />
            <DetailLine label="付款期限" value={dueDate} />
          </div>
        </header>

        <section className="preview-party-grid">
          <div className="preview-party">
            <h3>請款方</h3>
            <strong>{data.issuerCompany || data.issuerName || '請款方'}</strong>
            <AlignedDetailLine label="聯絡人" value={data.issuerName} />
            <AlignedDetailLine label="公司名稱" value={data.issuerCompany} />
            <AlignedDetailLine label="統編" value={data.issuerTaxId} />
            <AlignedDetailLine label="Email" value={data.issuerEmail} />
            <AlignedDetailLine label="電話" value={data.issuerPhone} />
            <AlignedDetailLine label="地址" value={data.issuerAddress} />
            <AlignedDetailLine label="網站" value={data.issuerWebsite} />
          </div>
          <div className="preview-party">
            <h3>客戶</h3>
            <strong>{data.clientCompany || data.clientName || '客戶'}</strong>
            <AlignedDetailLine label="聯絡人" value={data.clientName} />
            <AlignedDetailLine label="公司名稱" value={data.clientCompany} />
            <AlignedDetailLine label="統編" value={data.clientTaxId} />
            <AlignedDetailLine label="Email" value={data.clientEmail} />
            <AlignedDetailLine label="電話" value={data.clientPhone} />
            <AlignedDetailLine label="地址" value={data.clientAddress} />
            <AlignedDetailLine label="網站" value={data.clientWebsite} />
          </div>
        </section>

        <section className="preview-block">
          <h3>請款項目</h3>
          <div className="preview-table-wrap">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>品項</th>
                  <th>說明</th>
                  <th className="number-cell">數量</th>
                  <th>單位</th>
                  <th className="number-cell">單價</th>
                  <th className="number-cell">小計</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.name || `品項 ${index + 1}`}</td>
                    <td>{item.description || '-'}</td>
                    <td className="number-cell">{item.quantity || 0}</td>
                    <td>{item.unit || '-'}</td>
                    <td className="number-cell">
                      {formatCurrency(item.unitPrice || 0, data.currency)}
                    </td>
                    <td className="number-cell">
                      {formatCurrency(calculateItemSubtotal(item), data.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="preview-totals" aria-label="金額摘要">
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
          <div className="preview-total-main">
            <span>尚待支付金額</span>
            <strong>{formatCurrency(totals.remainingAmount, data.currency)}</strong>
          </div>
        </section>

        <section className="preview-block payment-details">
          <h3>付款資訊</h3>
          <div className="payment-info-grid">
            <DetailLine label="付款方式" value={getPaymentMethodLabel(data.paymentInfo)} />
            <DetailLine label="銀行名稱" value={data.paymentInfo.bankName} />
            <DetailLine label="分行名稱" value={data.paymentInfo.branchName} />
            <DetailLine label="銀行代碼" value={data.paymentInfo.bankCode} />
            <DetailLine label="帳號" value={data.paymentInfo.accountNumber} />
            <DetailLine label="戶名" value={data.paymentInfo.accountName} />
          </div>
          <MultilineBlock title="匯款後回覆方式" value={data.paymentInfo.confirmationInstruction} />
          <MultilineBlock title="付款備註" value={data.paymentInfo.paymentNote} />
        </section>

        <MultilineBlock title="請款備註" value={data.requestNotes} />
        <MultilineBlock title="付款條款" value={data.paymentTerms} />
        <MultilineBlock title="交付說明" value={data.deliveryNotes} />
      </article>
    </aside>
  );
}
