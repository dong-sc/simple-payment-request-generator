import type { PaymentRequestData } from '../types/paymentRequest';
import { paymentTextTemplates } from '../utils/defaultPaymentRequest';

interface TermsEditorProps {
  data: PaymentRequestData;
  onChange: (data: PaymentRequestData) => void;
}

export function TermsEditor({ data, onChange }: TermsEditorProps) {
  function update<K extends keyof PaymentRequestData>(
    key: K,
    value: PaymentRequestData[K],
  ) {
    onChange({ ...data, [key]: value });
  }

  function appendTemplate(template: string) {
    const nextTerms = data.paymentTerms.trim()
      ? `${data.paymentTerms.trim()}\n${template}`
      : template;
    update('paymentTerms', nextTerms);
  }

  return (
    <section className="form-section">
      <h2>備註與條款</h2>
      <div className="stacked-fields">
        <label>
          請款備註
          <textarea
            rows={3}
            value={data.requestNotes}
            onChange={(event) => update('requestNotes', event.target.value)}
          />
        </label>
        <div>
          <p className="template-label">預設文字範本</p>
          <div className="template-buttons">
            {paymentTextTemplates.map((template) => (
              <button
                className="chip-button"
                type="button"
                key={template}
                onClick={() => appendTemplate(template)}
              >
                {template}
              </button>
            ))}
          </div>
        </div>
        <label>
          付款條款
          <textarea
            rows={5}
            value={data.paymentTerms}
            onChange={(event) => update('paymentTerms', event.target.value)}
          />
        </label>
        <label>
          交付說明
          <textarea
            rows={3}
            value={data.deliveryNotes}
            onChange={(event) => update('deliveryNotes', event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
