const shortcuts = [
  {
    label: '報價單',
    href: 'https://quote.donglinphoto.com/',
    current: false,
  },
  {
    label: '服務範圍確認',
    href: 'https://scope.donglinphoto.com/',
    current: false,
  },
  {
    label: '請款單',
    href: 'https://payment.donglinphoto.com/',
    current: true,
  },
];

export function Header() {
  return (
    <header className="site-header">
      <div>
        <p className="eyebrow">Dong Tools · Payment</p>
        <h1>請款單製作工具</h1>
        <p className="intro">
          一個給自由工作者與小型工作室使用的簡易請款單製作工具。不用登入、不需安裝，填寫資料後即可產生可列印、可另存 PDF 的請款單。
        </p>
        <p className="desktop-hint">建議使用電腦版操作，填寫與預覽會更直覺。</p>
        <nav className="header-tool-shortcuts" aria-label="其他接案文件工具">
          {shortcuts.map((shortcut) => (
            <a
              aria-current={shortcut.current ? 'page' : undefined}
              href={shortcut.href}
              key={shortcut.href}
            >
              {shortcut.label}
            </a>
          ))}
        </nav>
      </div>
      <p className="privacy-note">資料僅儲存在你的瀏覽器，不會上傳到任何伺服器。</p>
    </header>
  );
}
