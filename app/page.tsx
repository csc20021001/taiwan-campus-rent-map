'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, GraduationCap, House, MapPin, ShieldAlert, Star, X } from 'lucide-react';

type EntryKind = 'rentals' | 'courses';

type DisclaimerSection = {
  heading: string;
  points: string[];
};

const disclaimers: Record<EntryKind, { title: string; description: string; sections: DisclaimerSection[] }> = {
  rentals: {
    title: '租屋地圖使用聲明',
    description: '請先了解資料限制、交易風險與公開發言責任；本服務只能作為找房線索，不能取代看屋、身分查核與正式契約。',
    sections: [
      {
        heading: '資料與地圖限制',
        points: [
          '租屋資料可能來自政府公開資料或使用者刊登；歷史租金、平均租金、空房狀態、屋況與地圖座標都可能過時、近似、不完整或有誤，也不代表政府或學校推薦。',
          '價格與評分是多筆來源的統計或個別經驗，不是估價、鑑價、品質保證或目前成交條件。',
        ],
      },
      {
        heading: '交易與人身安全',
        points: [
          '本站不是房東、承租人、仲介、代管或包租業者，不驗證刊登者身分、所有權或出租權，也不代收款、帶看、議價、簽約或處理糾紛。',
          '請親自看屋，核對出租人身分、權利證明、設備、費用與契約；未完成查核前，不要只憑本站內容交付訂金、押金、證件或匯款。',
        ],
      },
      {
        heading: '刊登與公開評論',
        points: [
          '只能刊登有權公開且真實的內容；評論應基於親身經驗並區分事實與意見。不得揭露私人聯絡方式、證件、門牌以外的私生活資訊，或發布誹謗、侮辱、侵權、歧視、詐騙與垃圾內容。',
          '使用者須為自己提交的地址、文字、評分及其他內容負責；有疑義時，本站得標示爭議、限制顯示或移除內容。',
        ],
      },
      {
        heading: '責任界線與申訴',
        points: [
          '外部連結與廣告由第三方提供，出現於本站不代表本站背書。若發現錯誤、詐騙、侵權或個資問題，請寄信至 sjehd363960@gmail.com。',
          '免責與責任限制只在法律允許的範圍內適用，不排除依法不得預先免除或限制的責任。',
        ],
      },
    ],
  },
  courses: {
    title: '課程評分使用聲明',
    description: '課程資料與評價只供選課參考；評分是個人經驗，不是對教師人格、教學品質或學習成果的客觀認定。',
    sections: [
      {
        heading: '課程資料限制',
        points: [
          '課名、教師、系所與連結以學校公開頁面為來源，但開課狀態、授課教師、內容與評量方式可能隨學期變更；請以當學期校方選課系統及公告為準。',
          '平均分數只彙整有效使用者評分；同一門課的感受會因學期、教師、班別、修課背景與投入程度而不同。',
        ],
      },
      {
        heading: '評分與發言責任',
        points: [
          '請只評價實際修過的課程，並聚焦學習收穫、作業量、考試難易及給分標準；涉及具體事實時，應有合理查證基礎。',
          '不得以評論為由侮辱、誹謗、騷擾教師或學生，也不得公開私人聯絡方式、住址、健康、家庭、成績等非必要個資，或張貼侵權內容。',
        ],
      },
      {
        heading: '非校方立場',
        points: [
          '本站與各大學、系所及授課教師沒有代理、認證或合作關係；校名、教師姓名與官方連結僅用來辨識公開課程資訊，不表示校方支持本站。',
          '評分不能保證選課名額、成績、學分承認或學習成果；使用者應依正式課綱與自身需求獨立判斷。',
        ],
      },
      {
        heading: '更正、申訴與責任界線',
        points: [
          '若資料有誤，或內容涉及侵權、名譽、隱私等問題，請寄信至 sjehd363960@gmail.com；本站得在查核期間限制顯示或移除內容。',
          '免責與責任限制只在法律允許的範圍內適用，不排除依法不得預先免除或限制的責任。',
        ],
      },
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
        <p className="entry-intro">選擇租屋地圖，或查看各校課程評分。</p>
        <div className="entry-choices">
          <button className="entry-choice is-rental" type="button" onClick={() => openDisclaimer('rentals')}>
            <span className="entry-choice-icon"><House size={30} /></span>
            <span className="entry-choice-copy"><small>校園周邊</small><strong>查房子</strong><span>看租金、位置、住戶評分與公開評論</span></span>
            <ArrowRight className="entry-arrow" size={22} />
          </button>
          <button className="entry-choice is-professor" type="button" onClick={() => openDisclaimer('courses')}>
            <span className="entry-choice-icon"><GraduationCap size={31} /></span>
            <span className="entry-choice-copy"><small>課程選擇</small><strong>查課程</strong><span>看授課教師、學習收穫、作業、考試與給分評價</span></span>
            <span className="entry-rating-cue"><Star size={13} fill="currentColor" />四項評分</span>
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
          <div className="entry-disclaimer-sections">
            {disclaimer.sections.map((section) => <section key={section.heading}>
              <h3>{section.heading}</h3>
              <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </section>)}
          </div>
          <p className="entry-disclaimer-note">完整規範請見 <Link href="/terms" target="_blank">服務條款</Link> 與 <Link href="/privacy" target="_blank">隱私權政策</Link>。本聲明為一般風險提示，不構成法律、租賃或選課建議。</p>
          <label className="entry-consent"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>我已閱讀、理解並同意以上聲明</span></label>
          <div className="entry-disclaimer-actions"><button type="button" onClick={closeDisclaimer}>取消</button><button type="button" disabled={!agreed} onClick={continueToEntry}>同意並前往</button></div>
        </section>
      </div>}
    </main>
  );
}
