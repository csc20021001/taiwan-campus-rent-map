import Link from 'next/link';
import { ArrowRight, GraduationCap, House, MapPin, Star } from 'lucide-react';

export default function Home() {
  return (
    <main className="entry-page">
      <header className="entry-topbar">
        <Link className="brand" href="/" aria-label="WZUNAA 首頁"><span className="brand-mark"><MapPin size={19} /></span><span>WZUNAA</span></Link>
        <span>台灣校園生活指南</span>
      </header>
      <section className="entry-hero">
        <p className="entry-kicker">從這裡開始</p>
        <h1>今天想查什麼？</h1>
        <p className="entry-intro">選擇租屋地圖，或查看各校教授評分。</p>
        <div className="entry-choices">
          <Link className="entry-choice is-rental" href="/rentals">
            <span className="entry-choice-icon"><House size={30} /></span>
            <span className="entry-choice-copy"><small>校園周邊</small><strong>查房子</strong><span>看租金、位置、住戶評分與公開評論</span></span>
            <ArrowRight className="entry-arrow" size={22} />
          </Link>
          <Link className="entry-choice is-professor" href="/professors">
            <span className="entry-choice-icon"><GraduationCap size={31} /></span>
            <span className="entry-choice-copy"><small>課程選擇</small><strong>查教授</strong><span>看教學、學習收穫、作業、考試與給分評價</span></span>
            <span className="entry-rating-cue"><Star size={13} fill="currentColor" />五項評分</span>
            <ArrowRight className="entry-arrow" size={22} />
          </Link>
        </div>
      </section>
      <footer className="entry-footer"><span>WZUNAA</span><nav><Link href="/privacy">隱私權</Link><Link href="/terms">服務條款</Link></nav></footer>
    </main>
  );
}
