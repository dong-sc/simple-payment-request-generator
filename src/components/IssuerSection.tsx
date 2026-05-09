import type { PaymentRequestData } from '../types/paymentRequest';
import { CollapsibleFieldGroup } from './CollapsibleFieldGroup';

interface IssuerSectionProps {
  data: PaymentRequestData;
  onChange: (data: PaymentRequestData) => void;
}

const logoImageMaxWidth = 720;
const logoImageMaxHeight = 360;

function resizeLogoImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(
          1,
          logoImageMaxWidth / image.width,
          logoImageMaxHeight / image.height,
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Canvas is not supported.'));
          return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      image.onerror = () => reject(new Error('Unable to load image.'));
      image.src = String(reader.result || '');
    };

    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

export function IssuerSection({ data, onChange }: IssuerSectionProps) {
  function update<K extends keyof PaymentRequestData>(
    key: K,
    value: PaymentRequestData[K],
  ) {
    onChange({ ...data, [key]: value });
  }

  async function handleLogoUpload(file: File | null) {
    if (!file) {
      return;
    }

    try {
      update('issuerLogoImage', await resizeLogoImage(file));
    } catch {
      update('issuerLogoImage', '');
    }
  }

  return (
    <section className="form-section">
      <h2>請款方資訊</h2>
      <div className="field-grid two-columns">
        <label>
          聯絡人 / 姓名
          <input
            value={data.issuerName}
            onChange={(event) => update('issuerName', event.target.value)}
            placeholder="可留空"
          />
        </label>
        <label>
          公司名稱
          <input
            value={data.issuerCompany}
            onChange={(event) => update('issuerCompany', event.target.value)}
            placeholder="可留空"
          />
        </label>
        <label>
          統編
          <input
            value={data.issuerTaxId}
            onChange={(event) => update('issuerTaxId', event.target.value)}
            placeholder="可留空"
          />
        </label>
        <label>
          聯絡 Email
          <input
            type="email"
            value={data.issuerEmail}
            onChange={(event) => update('issuerEmail', event.target.value)}
          />
        </label>
        <label>
          聯絡電話
          <input
            value={data.issuerPhone}
            onChange={(event) => update('issuerPhone', event.target.value)}
          />
        </label>
        <CollapsibleFieldGroup title="LOGO、地址、網站">
          <div className="field-grid two-columns nested-field-grid">
            <div className="image-upload-card span-two">
              <label>
                請款方 Logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    void handleLogoUpload(event.currentTarget.files?.[0] ?? null)
                  }
                />
              </label>
              <p className="upload-note">
                建議使用橫式或透明背景 Logo，系統會限制在預覽格內。
              </p>
              <div className="logo-upload-preview" aria-label="請款方 Logo 預覽">
                {data.issuerLogoImage ? (
                  <img src={data.issuerLogoImage} alt="請款方 Logo" />
                ) : (
                  <span>尚未上傳</span>
                )}
              </div>
              <button
                className="text-button danger"
                type="button"
                disabled={!data.issuerLogoImage}
                onClick={() => update('issuerLogoImage', '')}
              >
                移除 Logo
              </button>
            </div>
            <label className="span-two">
              地址
              <input
                value={data.issuerAddress}
                onChange={(event) => update('issuerAddress', event.target.value)}
                placeholder="可留空"
              />
            </label>
            <label className="span-two">
              網站
              <input
                value={data.issuerWebsite}
                onChange={(event) => update('issuerWebsite', event.target.value)}
                placeholder="可留空"
              />
            </label>
          </div>
        </CollapsibleFieldGroup>
      </div>
    </section>
  );
}
