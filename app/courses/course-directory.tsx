'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ExternalLink, GraduationCap, LogIn, Search, ShieldCheck, Star, X } from 'lucide-react';
import { universities } from '@/app/data';

type Course = {
  id: string;
  universityId: string;
  term: string;
  firstTerm: string;
  lastTerm: string;
  offeredTerms: string[];
  courseCode: string;
  name: string;
  department: string;
  officialSourceUrl: string;
  departmentSourceUrl: string;
  instructors: Array<{ name: string; officialSourceUrl: string }>;
  averageRating: number | null;
  averageLearning: number | null;
  averageWorkload: number | null;
  averageExamDifficulty: number | null;
  averageGradingStandard: number | null;
  ratingCount: number;
};

type Department = {
  id: string;
  universityId: string;
  college: string;
  name: string;
  unitType: 'department' | 'institute' | 'program' | 'academic-unit';
  officialSourceUrl: string;
};

type AuthState = { user: { id: string; name: string } | null; googleConfigured: boolean };
type RatingScores = { learningScore: number; workloadScore: number; examDifficultyScore: number; gradingStandardScore: number };

const initialScores: RatingScores = {
  learningScore: 3,
  workloadScore: 3,
  examDifficultyScore: 3,
  gradingStandardScore: 3,
};

const terms = Array.from({ length: 19 }, (_, index) => {
  const sequence = 18 - index;
  return `${106 + Math.floor(sequence / 2)}-${sequence % 2 + 1}`;
});

const ratingDimensions: Array<{
  key: keyof RatingScores;
  label: string;
  low: string;
  high: string;
  hint?: string;
  averageKey: keyof Pick<Course, 'averageLearning' | 'averageWorkload' | 'averageExamDifficulty' | 'averageGradingStandard'>;
}> = [
  { key: 'learningScore', label: '學習收穫', low: '較少', high: '很多', hint: '越高代表越能學到東西', averageKey: 'averageLearning' },
  { key: 'workloadScore', label: '作業量', low: '很少', high: '很多', averageKey: 'averageWorkload' },
  { key: 'examDifficultyScore', label: '考試難易', low: '較容易', high: '很困難', averageKey: 'averageExamDifficulty' },
  { key: 'gradingStandardScore', label: '給分標準', low: '較嚴格', high: '較寬鬆', hint: '越高代表給分越寬鬆', averageKey: 'averageGradingStandard' },
];

export function CourseDirectory() {
  const [schoolId, setSchoolId] = useState('ntu');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [term, setTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [auth, setAuth] = useState<AuthState>({ user: null, googleConfigured: false });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [ratingTargetId, setRatingTargetId] = useState('');
  const [scores, setScores] = useState<RatingScores>(initialScores);
  const [submitting, setSubmitting] = useState(false);
  const school = universities.find((item) => item.id === schoolId) ?? universities[0];

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => response.json() as Promise<AuthState>)
      .then(setAuth)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch(`/api/departments?university_id=${encodeURIComponent(schoolId)}`)
      .then(async (response) => {
        const data = await response.json() as { departments?: Department[]; error?: string };
        if (!response.ok) throw new Error(data.error || '系所資料載入失敗');
        setDepartments(data.departments ?? []);
      })
      .catch((caught) => { setDepartments([]); setMessage(caught instanceof Error ? caught.message : '系所資料載入失敗'); })
      .finally(() => setDepartmentsLoading(false));
  }, [schoolId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ university_id: schoolId });
      if (search.trim()) params.set('search', search.trim());
      if (department.trim()) params.set('department', department.trim());
      if (term) params.set('term', term);
      params.set('limit', '36');
      params.set('offset', '0');
      fetch(`/api/courses?${params}`)
        .then(async (response) => {
          const data = await response.json() as { courses?: Course[]; total?: number; nextOffset?: number | null; error?: string };
          if (!response.ok) throw new Error(data.error || '課程資料載入失敗');
          setCourses(data.courses ?? []);
          setTotal(data.total ?? 0);
          setNextOffset(data.nextOffset ?? null);
          setMessage('');
        })
        .catch((caught) => { setCourses([]); setTotal(0); setNextOffset(null); setMessage(caught instanceof Error ? caught.message : '課程資料載入失敗'); })
        .finally(() => setLoading(false));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [department, schoolId, search, term]);

  async function loadMore() {
    if (nextOffset === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ university_id: schoolId, limit: '36', offset: String(nextOffset) });
      if (search.trim()) params.set('search', search.trim());
      if (department.trim()) params.set('department', department.trim());
      if (term) params.set('term', term);
      const response = await fetch(`/api/courses?${params}`);
      const data = await response.json() as { courses?: Course[]; total?: number; nextOffset?: number | null; error?: string };
      if (!response.ok) throw new Error(data.error || '課程資料載入失敗');
      setCourses((current) => [...current, ...(data.courses ?? [])]);
      setTotal(data.total ?? total);
      setNextOffset(data.nextOffset ?? null);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : '課程資料載入失敗');
    } finally {
      setLoadingMore(false);
    }
  }

  const departmentsByCollege = useMemo(() => {
    const grouped = new Map<string, Department[]>();
    for (const item of departments) grouped.set(item.college, [...(grouped.get(item.college) ?? []), item]);
    return [...grouped.entries()];
  }, [departments]);

  function openRating(course: Course) {
    if (!auth.user) {
      window.location.assign(`/api/auth/google/start?returnTo=${encodeURIComponent('/courses')}`);
      return;
    }
    setRatingTargetId(course.id);
    setScores(initialScores);
    setMessage('');
  }

  async function submitRating(event: FormEvent<HTMLFormElement>, course: Course) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(course.id)}/rating`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scores),
      });
      const data = await response.json() as { course?: Course; error?: string };
      if (!response.ok || !data.course) throw new Error(data.error || '評分失敗');
      setCourses((current) => current.map((item) => item.id === data.course!.id ? data.course! : item));
      setRatingTargetId('');
      setMessage('評分已更新。');
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : '評分失敗');
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="professor-page">
    <header className="professor-topbar"><Link href="/rentals"><ArrowLeft size={15} />回租屋地圖</Link><span className="professor-brand"><GraduationCap size={18} />WZUNAA</span>{auth.user ? <small>{auth.user.name}</small> : <a href="/api/auth/google/start?returnTo=%2Fcourses"><LogIn size={14} />Google 登入</a>}</header>
    <section className="professor-hero"><p><Star size={14} fill="currentColor" />課程評分專區</p><h1>{school.shortName}課程評分</h1><span>以課程為單位，查看授課教師、學習收穫、作業、考試與給分評價</span></section>
    <p className="professor-source-note"><ShieldCheck size={14} />僅收錄學校與系所官方公開資料，並以現職師資名錄交叉核對；歷史範圍最早自 106-1 起。</p>
    <section className="professor-controls">
      <label>學校<select value={schoolId} onChange={(event) => { setDepartmentsLoading(true); setSchoolId(event.target.value); setDepartment(''); setTerm(''); setRatingTargetId(''); }}>{universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label><Search size={14} />搜尋課程、老師或系所<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="輸入課名、課號、老師或系所" /></label>
      <label>系所<select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">全部系所（{departmentsLoading ? '…' : departments.length}）</option>{departmentsByCollege.map(([college, units]) => <optgroup label={college} key={college}>{units.map((item) => <option value={item.name} key={item.id}>{item.name}</option>)}</optgroup>)}</select></label>
      <label>學期<select value={term} onChange={(event) => setTerm(event.target.value)}><option value="">近十學年全部</option>{terms.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
    </section>
    {message && <p className={`professor-message ${message === '評分已更新。' ? 'is-success' : ''}`}>{message}</p>}
    <section className="professor-grid">
      {loading && <div className="professor-empty"><span className="loading-dot" />載入中</div>}
      {!loading && courses.length === 0 && <div className="professor-empty"><GraduationCap size={28} /><strong>{department ? `${department}目前沒有已收錄課程` : '目前沒有符合條件的課程'}</strong><span>只有能由官方課程頁與現職師資名錄同時核對的課程才會顯示。</span></div>}
      {courses.map((course) => <article className={`professor-card ${ratingTargetId === course.id ? 'is-rating' : ''}`} key={course.id}>
        <small>{course.firstTerm === course.lastTerm ? course.lastTerm : `${course.firstTerm}～${course.lastTerm}`} · {course.offeredTerms.length} 學期 · {course.courseCode}</small><h2>{course.name}</h2>
        <p className="course-instructors">授課：{course.instructors.map((instructor, index) => <span key={`${course.id}-${instructor.name}`}>{index > 0 && '／'}{instructor.officialSourceUrl ? <a href={instructor.officialSourceUrl} target="_blank" rel="noreferrer">{instructor.name}<ExternalLink size={10} /></a> : instructor.name}</span>)}</p>
        <div className="course-official-links"><a href={course.officialSourceUrl} target="_blank" rel="noreferrer">官方課程資料<ExternalLink size={11} /></a>{course.departmentSourceUrl && <a href={course.departmentSourceUrl} target="_blank" rel="noreferrer">官方系所網站<ExternalLink size={11} /></a>}</div>
        <div className="professor-score"><Star size={18} fill="currentColor" /><strong>{course.averageRating === null ? '—' : course.averageRating.toFixed(1)}</strong><span>/ 5 · {course.ratingCount} 人評分</span></div>
        <dl className="professor-dimensions">
          {ratingDimensions.map((dimension) => <div key={dimension.key}><dt>{dimension.label}{dimension.hint && <small>{dimension.hint}</small>}</dt><dd>{course[dimension.averageKey] === null ? '—' : course[dimension.averageKey]!.toFixed(1)}</dd></div>)}
        </dl>
        {ratingTargetId !== course.id && <button className="open-rating-button" type="button" onClick={() => openRating(course)}>評這門課</button>}
        {ratingTargetId === course.id && <form className="rating-form" onSubmit={(event) => void submitRating(event, course)}>
          <button className="rating-close" type="button" onClick={() => setRatingTargetId('')} aria-label="關閉評分"><X size={15} /></button>
          {ratingDimensions.map((dimension) => <fieldset key={dimension.key}>
            <legend>{dimension.label}{dimension.hint && <small>{dimension.hint}</small>}</legend>
            <div className="dimension-scale" aria-label={`${course.name}的${dimension.label}`}>
              {[1, 2, 3, 4, 5].map((score) => <button className={scores[dimension.key] === score ? 'is-selected' : ''} type="button" key={score} aria-pressed={scores[dimension.key] === score} onClick={() => setScores((current) => ({ ...current, [dimension.key]: score }))}>{score}</button>)}
            </div>
            <small><span>1 {dimension.low}</span><span>5 {dimension.high}</span></small>
          </fieldset>)}
          <button className="rating-submit" type="submit" disabled={submitting}>{submitting ? '送出中…' : <><Check size={14} />送出四項課程評分</>}</button>
        </form>}
      </article>)}
    </section>
    {!loading && courses.length > 0 && <div className="course-pagination"><span>已顯示 {courses.length}／{total} 門</span>{nextOffset !== null && <button type="button" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? '載入中…' : '顯示更多課程'}</button>}</div>}
  </main>;
}
