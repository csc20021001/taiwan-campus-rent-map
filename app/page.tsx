'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, GraduationCap, House, MapPin, ShieldAlert, Star, X } from 'lucide-react';

type EntryKind = 'rentals' | 'professors';

const disclaimers: Record<EntryKind, { title: string; description: string; points: string[] }> = {
  rentals: {
    title: '租屋資訊使用提醒',
    description: '地圖內容來自政府公開資料與使用者分享，只供查找與經驗交流。',
    points: [
      '租金、空房與屋況可能隨時變動，簽約前請向出租人確認並親自看屋。',
      '本站不參與仲介、收款或簽約，也不保證每筆內容完整或持續有效。',
      '公開評論代表個別使用者經驗，請自行判斷並保護個人資料。',
    ],
  },
  professors: {
    title: '教授評分使用提醒',
    description: '評分是使用者的個人修課經驗，只供選課參考，不代表客觀事實或校方立場。',
    points: [
      '請以尊重、具體且與教學相關的方式評分，不得騷擾、侮辱或誹謗。',
      '同一位老師的評價可能因課程、學期與修課者而不同。',
      '選課決定與學習結果由使用者自行評估與負責。',
    ],
  },
};

export default function Home() {
  const router = useRouter();
  const [entry, setEntry] = useState<EntryKind | null>(null);
  const [agreed, setAgreed] = useState(false);
  const disclaimer = entry ? disclaimers[entry] : null;

  function openDisclaimer(nextEntry: EntryKind) {
    setEntry(nextEntry);
    setAgreed(false);
  }

  function closeDisclaimer() {
    setEntry(null);
    setAgreed(false);
  }

  function continueToEntry() {
    if (!entry || !agreed) return;
    router.push(`/${entry}`);
  }

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
          <button className="entry-choice is-rental" type="button" onClick={() => openDisclaimer('rentals')}>
            <span className="entry-choice-icon"><House size={30} /></span>
            <span className="entry-choice-copy"><small>校園周邊</small><strong>查房子</strong><span>看租金、位置、住戶評分與公開評論</span></span>
            <ArrowRight className="entry-arrow" size={22} />
          </button>
          <button className="entry-choice is-professor" type="button" onClick={() => openDisclaimer('professors')}>
            <span className="entry-choice-icon"><GraduationCap size={31} /></span>
            <span className="entry-choice-copy"><small>課程選擇</small><strong>查教授</strong><span>看教學、學習收穫、作業、考試與給分評價</span></span>
            <span className="entry-rating-cue"><Star size={13} fill="currentColor" />五項評分</span>
            <ArrowRight className="entry-arrow" size={22} />
          </button>
        </div>
      </section>
      <footer className="entry-footer"><span>WZUNAA</span><nav><Link href="/privacy">隱私權</Link><Link href="/terms">服務條款</Link></nav></footer>

      {entry && disclaimer && <div className="entry-disclaimer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDisclaimer(); }}>
        <section className="entry-disclaimer" role="dialog" aria-modal="true" aria-labelledby="entry-disclaimer-title">
          <button className="entry-disclaimer-close" type="button" onClick={closeDisclaimer} aria-label="關閉免責聲明"><X size={17} /></button>
          <span className="entry-disclaimer-icon"><ShieldAlert size={23} /></span>
          <p>使用前請先閱讀</p>
          <h2 id="entry-disclaimer-title">{disclaimer.title}</h2>
          <span className="entry-disclaimer-intro">{disclaimer.description}</span>
          <ul>{disclaimer.points.map((point) => <li key={point}>{point}</li>)}</ul>
          <label className="entry-consent"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>我已閱讀並同意以上提醒</span></label>
          <div className="entry-disclaimer-actions"><button type="button" onClick={closeDisclaimer}>取消</button><button type="button" disabled={!agreed} onClick={continueToEntry}>同意並前往</button></div>
        </section>
      </div>}
    </main>
  );
}
