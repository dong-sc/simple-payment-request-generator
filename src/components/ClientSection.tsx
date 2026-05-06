import type { PaymentRequestData } from '../types/paymentRequest';

interface ClientSectionProps {
  data: PaymentRequestData;
  onChange: (data: PaymentRequestData) => void;
}

export function ClientSection({ data, onChange }: ClientSectionProps) {
  function update<K extends keyof PaymentRequestData>(
    key: K,
    value: PaymentRequestData[K],
  ) {
    onChange({ ...data, [key]: value });
  }

  return (
    <section className="form-section">
      <h2>客戶資訊</h2>
      <div className="field-grid two-columns">
        <label>
          客戶名稱
          <input
            value={data.clientName}
            onChange={(event) => update('clientName', event.target.value)}
          />
        </label>
        <label>
          客戶公司
          <input
            value={data.clientCompany}
            onChange={(event) => update('clientCompany', event.target.value)}
            placeholder="可留空"
          />
        </label>
        <label>
          客戶 Email
          <input
            type="email"
            value={data.clientEmail}
            onChange={(event) => update('clientEmail', event.target.value)}
            placeholder="可留空"
          />
        </label>
        <label>
          客戶電話
          <input
            value={data.clientPhone}
            onChange={(event) => update('clientPhone', event.target.value)}
            placeholder="可留空"
          />
        </label>
      </div>
    </section>
  );
}
