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
        <p className="legal-updated">最後更新：2026 年 8 月 27 日</p>

        <section>
          <h2>個資蒐集者與聯絡方式</h2>
          <p>本服務由 WZUNAA 營運。對個人資料蒐集、處理、利用或權利行使有疑問，請寄信至 <a href="mailto:sjehd363960@gmail.com">sjehd363960@gmail.com</a>。</p>
        </section>

        <section>
          <h2>我們蒐集的資料</h2>
          <ul>
            <li>Google 登入後提供的帳號識別碼、姓名與電子郵件地址。</li>
            <li>你主動新增的租屋地點、租金回報、租屋評分、公開評論，以及課程四項評分。</li>
            <li>工作階段、登入時間、請求時間與次數、錯誤及防止濫用所需的基本技術與安全紀錄。</li>
          </ul>
        </section>

        <section>
          <h2>蒐集目的</h2>
          <p>資料用於會員登入與身分確認、提供刊登及評分功能、顯示與管理公開內容、計算統計、處理更正與申訴、防止詐騙與濫用、維護服務安全、排除故障，以及履行法律義務。除非另行告知並取得合法依據，我們不會將登入資料改作與上述目的無關的利用。</p>
        </section>

        <section>
          <h2>利用期間、地區、對象與方式</h2>
          <ul>
            <li><strong>期間：</strong>帳號存續、達成服務目的、依法保存及處理申訴或安全事件所必要的期間。</li>
            <li><strong>地區：</strong>臺灣及提供雲端、登入、地圖、分析或廣告服務的供應商實際處理資料之地區，可能包含境外處理。</li>
            <li><strong>對象：</strong>WZUNAA、受委託的服務供應商，以及依法有權要求提供資料的法院或主管機關。</li>
            <li><strong>方式：</strong>以自動化或非自動化方式蒐集、儲存、驗證、整理、統計、顯示、備份、安全監控及處理申訴。</li>
          </ul>
        </section>

        <section>
          <h2>公開範圍與使用者責任</h2>
          <p>公開評論會顯示你的 Google 帳號名稱與評論內容；Email、Google 帳號識別碼及安全紀錄不會作為一般公開內容。租屋刊登地址及你主動提交的內容可能公開顯示。請勿在地址或評論中填入電話、Email、證件、金融資料、健康、家庭、非公開住址、成績或其他不必要的個人資料；也不得公開他人個資或秘密。</p>
        </section>

        <section>
          <h2>Google 登入、服務供應商與廣告</h2>
          <p>Google 登入由 Google 驗證，本站不會取得或保存你的 Google 密碼。網站使用 Cloudflare 提供網站、資料庫與安全服務，並可能使用 Google 提供登入及廣告服務，以及地圖與其他必要供應商。這些第三方可能依其服務條款與隱私政策處理 IP 位址、Cookie、裝置及使用資訊；若啟用個人化廣告或非必要追蹤，本站會依適用法令提供相應告知與選擇。</p>
        </section>

        <section>
          <h2>是否必須提供資料及不提供的影響</h2>
          <p>你可不登入並瀏覽可公開查看的內容；但若不提供 Google 登入所需資料，將無法使用刊登、回報、評論或評分等需要確認帳號的功能。你可選擇不提交任何租屋或課程內容。</p>
        </section>

        <section>
          <h2>你的個資權利</h2>
          <p>你可依法請求查詢或閱覽、製給複製本、補充或更正、停止蒐集處理或利用，以及刪除個人資料。請寄信至 <a href="mailto:sjehd363960@gmail.com">sjehd363960@gmail.com</a>，說明請求內容；為避免他人冒用，本站得先合理確認身分。法律另有保存義務、處理爭議或保護重大權益所必要時，可能無法立即或完整刪除，屆時會說明理由。</p>
        </section>

        <section>
          <h2>正確性、安全與事件處理</h2>
          <p>本站採取合理技術與管理措施保護資料，並會依請求更正有爭議或不正確的資料；但網路傳輸與儲存無法保證絕對安全。若發生依法須通知的個資事件，本站會採取控制、調查與修復措施，並依適用法律通知受影響者或主管機關。</p>
        </section>

        <section>
          <h2>政策更新</h2>
          <p>本政策可能因功能、供應商或法令變更而調整，更新後會在本頁標示日期；重大變更會以合理方式提示。若不同意更新後的資料處理方式，請停止使用需登入的功能並聯絡本站行使權利。</p>
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
