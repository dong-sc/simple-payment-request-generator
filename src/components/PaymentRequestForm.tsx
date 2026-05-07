import { ClientSection } from './ClientSection';
import { IssuerSection } from './IssuerSection';
import { PaymentInfoEditor } from './PaymentInfoEditor';
import { PaymentItemsEditor } from './PaymentItemsEditor';
import { TermsEditor } from './TermsEditor';
import { TotalsEditor } from './TotalsEditor';
import type {
  Currency,
  PaymentRequestData,
  PaymentTotals,
} from '../types/paymentRequest';
import { parseNumberInput } from '../utils/currency';

interface PaymentRequestFormProps {
  data: PaymentRequestData;
  onChange: (data: PaymentRequestData) => void;
  totals: PaymentTotals;
}

const currencies: Currency[] = ['TWD', 'USD', 'JPY', 'HKD', 'CNY'];

export function PaymentRequestForm({
  data,
  onChange,
  totals,
}: PaymentRequestFormProps) {
  function update<K extends keyof PaymentRequestData>(
    key: K,
    value: PaymentRequestData[K],
  ) {
    onChange({ ...data, [key]: value });
  }

  return (
    <form className="document-form">
      <section className="form-section">
        <h2>請款單資訊</h2>
        <div className="field-grid two-columns">
          <label>
            請款單標題
            <input
              value={data.title}
              onChange={(event) => update('title', event.target.value)}
            />
          </label>
          <label>
            請款單編號
            <input
              value={data.requestNumber}
              onChange={(event) => update('requestNumber', event.target.value)}
              placeholder="可留空"
            />
          </label>
          <label>
            請款日期
            <input
              type="date"
              value={data.issueDate}
              onChange={(event) => update('issueDate', event.target.value)}
            />
          </label>
          <label>
            付款期限（天）
            <input
              min="0"
              type="number"
              value={data.dueDays}
              onChange={(event) =>
                update('dueDays', parseNumberInput(event.target.value))
              }
            />
          </label>
          <label>
            幣別
            <select
              value={data.currency}
              onChange={(event) => update('currency', event.target.value as Currency)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
          <label>
            對應報價單編號
            <input
              value={data.relatedQuoteNumber}
              onChange={(event) =>
                update('relatedQuoteNumber', event.target.value)
              }
              placeholder="可留空"
            />
          </label>
          <label className="span-two">
            專案名稱
            <input
              value={data.projectName}
              onChange={(event) => update('projectName', event.target.value)}
              placeholder="可留空"
            />
          </label>
        </div>
      </section>

      <IssuerSection data={data} onChange={onChange} />
      <ClientSection data={data} onChange={onChange} />
      <PaymentItemsEditor data={data} onChange={onChange} />
      <TotalsEditor data={data} onChange={onChange} totals={totals} />
      <PaymentInfoEditor data={data} onChange={onChange} />
      <TermsEditor data={data} onChange={onChange} />
    </form>
  );
}
