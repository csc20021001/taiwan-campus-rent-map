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
        <Link className="legal-back" href="/">← 返回租屋地圖</Link>
        <p className="legal-kicker">WZUNAA · CAMPUS HOUSING TAIWAN</p>
        <h1>隱私權政策</h1>
        <p className="legal-updated">生效日期：2026 年 8 月 26 日</p>

        <section>
          <h2>我們蒐集的資料</h2>
          <ul>
            <li>Google 登入後提供的帳號識別碼、姓名與電子郵件地址。</li>
            <li>你主動新增的租屋地點，以及回報的實付月租、住過評分或老師四項評分。</li>
            <li>維持登入與防止濫用所需的工作階段、操作時間窗計數及基本技術紀錄。</li>
          </ul>
        </section>

        <section>
          <h2>使用目的與公開範圍</h2>
          <p>我們使用帳號資料來驗證身分、防止同一帳號重複灌票，以及維護服務安全。公開頁面只顯示租屋地點與匿名聚合後的租金、評分及人數；不顯示 Email、Google ID、內部 user ID、個別使用者回報內容或 OAuth token。</p>
        </section>

        <section>
          <h2>登入與安全</h2>
          <p>Google 登入採用 OpenID Connect。本站不保存 Google 密碼、access token 或 refresh token；登入工作階段以 HttpOnly Cookie 和資料庫中的雜湊值維護。租屋地點不提供房東姓名、電話、私人地址留言或自由文字欄位。</p>
        </section>

        <section>
          <h2>服務供應商</h2>
          <p>本站可能透過 Google 提供登入與廣告服務，透過 Cloudflare／OpenAI Sites 提供網站與資料儲存，並使用 OpenStreetMap、Protomaps 與 MapLibre 顯示地圖。各供應商會依其隱私政策處理必要資料；若日後啟用 AdSense，Google 可能使用 Cookie 提供與衡量廣告。</p>
        </section>

        <section>
          <h2>保存、權利與聯絡方式</h2>
          <p>資料會保存到達成服務目的、處理爭議與維護安全所需的期間。你可依法請求查詢、更正或刪除自己的帳號、租屋地點與回報資料。請寄信至 <a href="mailto:sjehd363960@gmail.com">sjehd363960@gmail.com</a>，我們會在確認身分後處理。</p>
        </section>

        <nav className="legal-nav" aria-label="網站政策">
          <Link href="/">租屋地圖</Link>
          <Link href="/terms">服務條款</Link>
        </nav>
      </article>
    </main>
  );
}
