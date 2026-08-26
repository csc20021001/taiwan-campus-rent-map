import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '服務條款｜校邊 Campus Nest',
  description: '使用校邊 Campus Nest 新增租屋地點、回報租金與評分時適用的服務規範。',
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
          <p>校邊 Campus Nest 提供校園周邊租屋地點、匿名聚合租金與評分資訊。本站不是招租平台、房仲、出租人、承租人或付款代收方，也不提供即時空房、房東聯絡方式或交易服務。</p>
        </section>

        <section>
          <h2>地點與回報規範</h2>
          <ul>
            <li>只能提供合法、真實且你有權公開的資訊。</li>
            <li>不得冒用身分、詐騙、侵權、送出大量垃圾地點或操縱評分。</li>
            <li>租金與住過評分應基於實際租屋經驗，不得在地址中夾帶電話、姓名或其他私人資料。</li>
          </ul>
        </section>

        <section>
          <h2>資訊限制</h2>
          <p>政府歷史租賃參考不代表目前開價；使用者平均與中位數也只反映已提交回報，不能取代現場查核或契約。地圖近似座標應以文字地址為準。</p>
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
