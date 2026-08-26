import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '服務條款｜校邊 Campus Nest',
  description: '使用校邊 Campus Nest 刊登租屋、留言與評分時適用的服務規範。',
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <Link className="legal-back" href="/">← 返回租屋地圖</Link>
        <p className="legal-kicker">WZUNAA · CAMPUS HOUSING TAIWAN</p>
        <h1>服務條款</h1>
        <p className="legal-updated">生效日期：2026 年 8 月 26 日</p>

        <section>
          <h2>服務定位</h2>
          <p>校邊 Campus Nest 提供校園周邊租屋資訊、地圖位置、留言與評分的交流平台。本站不是房仲、出租人、承租人或付款代收方，也不保證刊登內容、空房狀態或交易結果。</p>
        </section>

        <section>
          <h2>刊登與留言規範</h2>
          <ul>
            <li>只能提供合法、真實且你有權公開的資訊。</li>
            <li>不得冒用身分、詐騙、歧視、騷擾、侵權、散布惡意程式或大量垃圾內容。</li>
            <li>不得公開他人不適合揭露的個人資料；留言應針對實際租屋經驗並保持可驗證性。</li>
          </ul>
        </section>

        <section>
          <h2>交易與安全</h2>
          <p>使用者應自行確認房東或房客身分、房屋權利、契約內容與付款方式。看屋前請避免預付不明款項，並保留對話與付款紀錄；發現可疑內容時請停止交易並聯絡站方。</p>
        </section>

        <section>
          <h2>內容管理與服務變更</h2>
          <p>為維護安全與合法性，我們得移除違規內容、限制帳號或配合法令處理資料。服務可能因維護或不可抗力暫停；條款更新後會在此頁標示新日期。若不同意更新內容，請停止使用服務。</p>
        </section>

        <section>
          <h2>聯絡方式</h2>
          <p>申訴、下架或權利問題請寄信至 <a href="mailto:sjehd363960@gmail.com">sjehd363960@gmail.com</a>。</p>
        </section>

        <nav className="legal-nav" aria-label="網站政策">
          <Link href="/">租屋地圖</Link>
          <Link href="/privacy">隱私權政策</Link>
        </nav>
      </article>
    </main>
  );
}
