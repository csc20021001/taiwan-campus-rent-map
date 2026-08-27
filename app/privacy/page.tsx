import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '隱私權政策｜WZUNAA',
  description: 'WZUNAA 的資料蒐集、使用、保存與使用者權利說明。',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <Link className="legal-back" href="/">← 返回首頁</Link>
        <p className="legal-kicker">WZUNAA · CAMPUS HOUSING TAIWAN</p>
        <h1>隱私權政策</h1>
        <p className="legal-updated">生效日期：2026 年 8 月 26 日</p>

        <section>
          <h2>我們蒐集的資料</h2>
          <ul>
            <li>Google 登入後提供的帳號識別碼、姓名與電子郵件地址。</li>
            <li>你主動新增的租屋地點，以及回報的實付月租、住過評分或課程四項評分。</li>
            <li>維持登入與防止濫用所需的工作階段、操作時間窗計數及基本技術紀錄。</li>
          </ul>
        </section>

        <section>
          <h2>使用目的與公開範圍</h2>
          <p>我們使用帳號資料確認身分並維護服務安全。公開評論會顯示你的帳號名稱與評論內容；Email 與帳號識別資訊不會公開。</p>
        </section>

        <section>
          <h2>登入與安全</h2>
          <p>Google 登入由 Google 驗證，本站不會取得或保存你的 Google 密碼。租屋頁面不公開房東姓名、電話或其他私人聯絡資料。</p>
        </section>

        <section>
          <h2>服務供應商</h2>
          <p>本站使用 Google 提供登入與廣告服務，並由網站與地圖服務供應商處理提供功能所需的資料。各供應商會依其隱私政策處理相關資料。</p>
        </section>

        <section>
          <h2>保存、權利與聯絡方式</h2>
          <p>資料會保存到達成服務目的、處理爭議與維護安全所需的期間。你可依法請求查詢、更正或刪除自己的帳號、租屋地點與回報資料。請寄信至 <a href="mailto:sjehd363960@gmail.com">sjehd363960@gmail.com</a>，我們會在確認身分後處理。</p>
        </section>

        <nav className="legal-nav" aria-label="網站政策">
          <Link href="/rentals">租屋地圖</Link>
          <Link href="/courses">課程評分</Link>
          <Link href="/terms">服務條款</Link>
        </nav>
      </article>
    </main>
  );
}
