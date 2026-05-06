import type {
  PaymentInfo,
  PaymentMethod,
  PaymentRequestData,
} from '../types/paymentRequest';

interface PaymentInfoEditorProps {
  data: PaymentRequestData;
  onChange: (data: PaymentRequestData) => void;
}

const methodOptions: Array<{ label: string; value: PaymentMethod }> = [
  { label: '銀行轉帳', value: 'bank_transfer' },
  { label: '現金', value: 'cash' },
  { label: '支票', value: 'check' },
  { label: 'PayPal', value: 'paypal' },
  { label: '其他', value: 'other' },
];

export function PaymentInfoEditor({ data, onChange }: PaymentInfoEditorProps) {
  const paymentInfo = data.paymentInfo;

  function updatePaymentInfo(patch: Partial<PaymentInfo>) {
    onChange({ ...data, paymentInfo: { ...paymentInfo, ...patch } });
  }

  return (
    <section className="form-section">
      <h2>付款資訊</h2>
      <div className="field-grid two-columns">
        <label>
          付款方式
          <select
            value={paymentInfo.method}
            onChange={(event) =>
              updatePaymentInfo({ method: event.target.value as PaymentMethod })
            }
          >
            {methodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {paymentInfo.method === 'other' ? (
          <label>
            自訂付款方式
            <input
              value={paymentInfo.customMethod}
              onChange={(event) =>
                updatePaymentInfo({ customMethod: event.target.value })
              }
            />
          </label>
        ) : null}
        <label>
          銀行名稱
          <input
            value={paymentInfo.bankName}
            onChange={(event) => updatePaymentInfo({ bankName: event.target.value })}
          />
        </label>
        <label>
          分行名稱
          <input
            value={paymentInfo.branchName}
            onChange={(event) =>
              updatePaymentInfo({ branchName: event.target.value })
            }
            placeholder="可留空"
          />
        </label>
        <label>
          銀行代碼
          <input
            value={paymentInfo.bankCode}
            onChange={(event) => updatePaymentInfo({ bankCode: event.target.value })}
            placeholder="可留空"
          />
        </label>
        <label>
          帳號
          <input
            value={paymentInfo.accountNumber}
            onChange={(event) =>
              updatePaymentInfo({ accountNumber: event.target.value })
            }
          />
        </label>
        <label>
          戶名
          <input
            value={paymentInfo.accountName}
            onChange={(event) =>
              updatePaymentInfo({ accountName: event.target.value })
            }
          />
        </label>
        <label className="span-two">
          匯款後回覆方式
          <input
            value={paymentInfo.confirmationInstruction}
            onChange={(event) =>
              updatePaymentInfo({
                confirmationInstruction: event.target.value,
              })
            }
            placeholder="匯款後請回覆末五碼，謝謝。"
          />
        </label>
        <label className="span-two">
          付款備註
          <textarea
            rows={3}
            value={paymentInfo.paymentNote}
            onChange={(event) =>
              updatePaymentInfo({ paymentNote: event.target.value })
            }
          />
        </label>
      </div>
    </section>
  );
}
