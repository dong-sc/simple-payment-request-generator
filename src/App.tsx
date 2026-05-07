import { useEffect, useMemo, useState } from 'react';
import { ActionBar } from './components/ActionBar';
import { Header } from './components/Header';
import { PaymentRequestForm } from './components/PaymentRequestForm';
import { PaymentRequestPreview } from './components/PaymentRequestPreview';
import { SupportSection } from './components/SupportSection';
import type { PaymentRequestData } from './types/paymentRequest';
import { calculateTotals } from './utils/calculation';
import {
  clearPaymentRequestData,
  loadPaymentRequestData,
  savePaymentRequestData,
} from './utils/storage';
import { generatePaymentRequestPlainText } from './utils/paymentRequestText';

function getPrintableTitle(title: string): string {
  const normalizedTitle = title.trim() || '請款單';
  const safeTitle = normalizedTitle.replace(/[\\/:*?"<>|]/g, '-');

  return `${safeTitle}_請款單`;
}

export default function App() {
  const [paymentRequestData, setPaymentRequestData] =
    useState<PaymentRequestData>(() => loadPaymentRequestData());
  const [copyMessage, setCopyMessage] = useState('');
  const totals = useMemo(
    () => calculateTotals(paymentRequestData),
    [paymentRequestData],
  );

  useEffect(() => {
    savePaymentRequestData(paymentRequestData);
  }, [paymentRequestData]);

  function handleClear() {
    setPaymentRequestData(clearPaymentRequestData());
    setCopyMessage('');
  }

  async function handleCopyText() {
    const plainText = generatePaymentRequestPlainText(paymentRequestData, totals);
    await navigator.clipboard.writeText(plainText);
    setCopyMessage('已複製文字版請款內容');
    window.setTimeout(() => setCopyMessage(''), 2200);
  }

  function handlePrint() {
    const originalTitle = document.title;
    document.title = getPrintableTitle(paymentRequestData.title);

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };

    window.addEventListener('afterprint', restoreTitle);
    window.print();
    window.setTimeout(restoreTitle, 1000);
  }

  return (
    <>
      <Header />
      <main className="app-shell">
        <section className="workspace" aria-label="請款單製作工作區">
          <div className="form-pane">
            <ActionBar
              copyMessage={copyMessage}
              onClear={handleClear}
              onCopyText={handleCopyText}
              onPrint={handlePrint}
            />
            <PaymentRequestForm
              data={paymentRequestData}
              onChange={setPaymentRequestData}
              totals={totals}
            />
          </div>
          <PaymentRequestPreview data={paymentRequestData} totals={totals} />
        </section>
        <SupportSection />
      </main>
    </>
  );
}
