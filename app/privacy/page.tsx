import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '隱私權政策｜校邊 Campus Nest',
  description: '校邊 Campus Nest 的資料蒐集、使用、保存與使用者權利說明。',
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
            <li>你主動刊登的租屋資料、地圖位置、聯絡方式，以及公開留言與評分。</li>
            <li>維持登入與防止濫用所需的工作階段及基本技術紀錄。</li>
          </ul>
        </section>

        <section>
          <h2>使用目的與公開範圍</h2>
          <p>我們使用帳號資料來驗證身分、標示內容來源、管理刊登與留言，以及維護服務安全。租屋刊登中的聯絡方式、留言暱稱、評分與留言內容會公開顯示；Google 帳號電子郵件不會公開，除非你自行把它填入公開聯絡欄位。</p>
        </section>

        <section>
          <h2>登入與安全</h2>
          <p>Google 登入採用 OpenID Connect。本站不保存 Google 密碼、access token 或 refresh token；登入工作階段以 HttpOnly Cookie 和資料庫中的雜湊值維護。請勿在公開欄位填入不希望公開的個人資料。</p>
        </section>

        <section>
          <h2>服務供應商</h2>
          <p>本站可能透過 Google 提供登入與廣告服務，透過 Cloudflare／OpenAI Sites 提供網站與資料儲存，並使用 OpenStreetMap、Protomaps 與 MapLibre 顯示地圖。各供應商會依其隱私政策處理必要資料；若日後啟用 AdSense，Google 可能使用 Cookie 提供與衡量廣告。</p>
        </section>

        <section>
          <h2>保存、權利與聯絡方式</h2>
          <p>資料會保存到達成服務目的、處理爭議與維護安全所需的期間。你可依法請求查詢、更正或刪除自己的帳號與刊登資料。請寄信至 <a href="mailto:sjehd363960@gmail.com">sjehd363960@gmail.com</a>，我們會在確認身分後處理。</p>
        </section>

        <nav className="legal-nav" aria-label="網站政策">
          <Link href="/">租屋地圖</Link>
          <Link href="/terms">服務條款</Link>
        </nav>
      </article>
    </main>
  );
}
