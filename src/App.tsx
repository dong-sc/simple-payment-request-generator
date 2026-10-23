import { useEffect, useMemo, useState } from 'react';
import { ActionBar } from './components/ActionBar';
import { AuthorPromoSection } from './components/AuthorPromoSection';
import { DongToolsBar } from './components/DongToolsBar';
import { Header } from './components/Header';
import { PaymentRequestForm } from './components/PaymentRequestForm';
import { PaymentRequestPreview } from './components/PaymentRequestPreview';
import { SupportSection } from './components/SupportSection';
import { VisitorCounter } from './components/VisitorCounter';
import type { PaymentRequestData } from './types/paymentRequest';
import { calculateTotals } from './utils/calculation';
import { exportPaymentRequestExcel } from './utils/exportPaymentRequestExcel';
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
  const [draftSaved, setDraftSaved] = useState(true);
  const totals = useMemo(
    () => calculateTotals(paymentRequestData),
    [paymentRequestData],
  );

  useEffect(() => {
    document.getElementById('root')?.removeAttribute('inert');
  }, []);

  useEffect(() => {
    setDraftSaved(savePaymentRequestData(paymentRequestData));
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

  async function handleExportExcel() {
    try {
      await exportPaymentRequestExcel(paymentRequestData, totals);
      setCopyMessage('已匯出 Excel 資料表');
      window.setTimeout(() => setCopyMessage(''), 2200);
    } catch {
      setCopyMessage('匯出 Excel 失敗，請稍後再試');
      window.setTimeout(() => setCopyMessage(''), 2200);
    }
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
      <DongToolsBar />
      <Header />
      <main className="app-shell">
        <section className="workspace" aria-label="請款單製作工作區">
          <div className="form-pane">
            {!draftSaved && (
              <p role="alert">
                草稿未能讀取或儲存，原有儲存內容會保留。目前仍可編輯與匯出，但關閉頁面後本次變更可能遺失；請先匯出或列印。若要捨棄原草稿並重新儲存，請按「清空表單」。
              </p>
            )}
            <ActionBar
              copyMessage={copyMessage}
              onClear={handleClear}
              onCopyText={handleCopyText}
              onExportExcel={handleExportExcel}
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
        <AuthorPromoSection />
        <VisitorCounter />
      </main>
    </>
  );
}
