import { TotalsSummary } from './TotalsSummary';
import type {
  PaymentRequestData,
  PaymentTotals,
} from '../types/paymentRequest';
import { parseNumberInput } from '../utils/currency';

interface TotalsEditorProps {
  data: PaymentRequestData;
  onChange: (data: PaymentRequestData) => void;
  totals: PaymentTotals;
}

export function TotalsEditor({ data, onChange, totals }: TotalsEditorProps) {
  return (
    <section className="form-section">
      <h2>金額計算</h2>
      <div className="field-grid two-columns">
        <label>
          折扣金額
          <input
            min="0"
            type="number"
            value={data.discountAmount}
            onChange={(event) =>
              onChange({
                ...data,
                discountAmount: parseNumberInput(event.target.value),
              })
            }
          />
        </label>
        <label>
          稅率（%）
          <input
            min="0"
            type="number"
            value={data.taxRate}
            onChange={(event) =>
              onChange({ ...data, taxRate: parseNumberInput(event.target.value) })
            }
          />
        </label>
        <label className="span-two">
          已收訂金 / 已收款項
          <input
            min="0"
            type="number"
            value={data.receivedAmount}
            onChange={(event) =>
              onChange({
                ...data,
                receivedAmount: parseNumberInput(event.target.value),
              })
            }
          />
        </label>
      </div>
      <TotalsSummary data={data} totals={totals} />
    </section>
  );
}
