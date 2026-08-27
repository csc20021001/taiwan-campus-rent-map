'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ExternalLink, GraduationCap, LogIn, Search, ShieldCheck, Star, X } from 'lucide-react';
import { universities } from '@/app/data';

type Professor = {
  id: string;
  universityId: string;
  department: string;
  name: string;
  officialSourceUrl: string;
  averageRating: number | null;
  averageAttitude: number | null;
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
type RatingScores = { attitudeScore: number; learningScore: number; workloadScore: number; examDifficultyScore: number; gradingStandardScore: number };

const initialScores: RatingScores = {
  attitudeScore: 3,
  learningScore: 3,
  workloadScore: 3,
  examDifficultyScore: 3,
  gradingStandardScore: 3,
};

const ratingDimensions: Array<{
  key: keyof RatingScores;
  label: string;
  low: string;
  high: string;
  hint?: string;
  averageKey: keyof Pick<Professor, 'averageAttitude' | 'averageLearning' | 'averageWorkload' | 'averageExamDifficulty' | 'averageGradingStandard'>;
}> = [
  { key: 'attitudeScore', label: '老師態度', low: '較不友善', high: '很友善', averageKey: 'averageAttitude' },
  { key: 'learningScore', label: '學習收穫', low: '較少', high: '很多', hint: '越高代表越能學到東西', averageKey: 'averageLearning' },
  { key: 'workloadScore', label: '作業量', low: '很少', high: '很多', averageKey: 'averageWorkload' },
  { key: 'examDifficultyScore', label: '考試難易', low: '較容易', high: '很困難', averageKey: 'averageExamDifficulty' },
  { key: 'gradingStandardScore', label: '給分標準', low: '較嚴格', high: '較寬鬆', hint: '越高代表給分越寬鬆', averageKey: 'averageGradingStandard' },
];

export function ProfessorDirectory() {
  const [schoolId, setSchoolId] = useState('ntu');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [auth, setAuth] = useState<AuthState>({ user: null, googleConfigured: false });
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [error, setError] = useState('');
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
      .catch((caught) => { setDepartments([]); setError(caught instanceof Error ? caught.message : '系所資料載入失敗'); })
      .finally(() => setDepartmentsLoading(false));
  }, [schoolId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ university_id: schoolId });
      if (search.trim()) params.set('search', search.trim());
      if (department.trim()) params.set('department', department.trim());
      fetch(`/api/professors?${params}`)
        .then(async (response) => {
          const data = await response.json() as { professors?: Professor[]; error?: string };
          if (!response.ok) throw new Error(data.error || '教授資料載入失敗');
          setProfessors(data.professors ?? []);
          setError('');
        })
        .catch((caught) => { setProfessors([]); setError(caught instanceof Error ? caught.message : '教授資料載入失敗'); })
        .finally(() => setLoading(false));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [department, schoolId, search]);

  const departmentsByCollege = useMemo(() => {
    const grouped = new Map<string, Department[]>();
    for (const item of departments) grouped.set(item.college, [...(grouped.get(item.college) ?? []), item]);
    return [...grouped.entries()];
  }, [departments]);

  const sourceUrl = departments[0]?.officialSourceUrl;

  function openRating(professor: Professor) {
    if (!auth.user) {
      window.location.assign(`/api/auth/google/start?returnTo=${encodeURIComponent('/professors')}`);
      return;
    }
    setRatingTargetId(professor.id);
    setScores(initialScores);
    setError('');
  }

  async function submitRating(event: FormEvent<HTMLFormElement>, professor: Professor) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`/api/professors/${encodeURIComponent(professor.id)}/rating`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scores),
      });
      const data = await response.json() as { professor?: Professor; error?: string };
      if (!response.ok || !data.professor) throw new Error(data.error || '評分失敗');
      setProfessors((current) => current.map((item) => item.id === data.professor!.id ? data.professor! : item));
      setRatingTargetId('');
      setError('評分已更新。');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '評分失敗');
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="professor-page">
    <header className="professor-topbar"><Link href="/rentals"><ArrowLeft size={15} />回租屋地圖</Link><span className="professor-brand"><GraduationCap size={18} />WZUNAA</span>{auth.user ? <small>{auth.user.name}</small> : <a href="/api/auth/google/start?returnTo=%2Fprofessors"><LogIn size={14} />Google 登入</a>}</header>
    <section className="professor-hero"><p><Star size={14} fill="currentColor" />教授評分專區</p><h1>{school.shortName}教授評分</h1><span>看看學生對教學、學習收穫、作業、考試與給分的評價</span></section>
    <p className="professor-source-note"><ShieldCheck size={14} />已收錄 {departmentsLoading ? '…' : departments.length} 個系所與學位單位。{sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">查看學校網站<ExternalLink size={11} /></a>}</p>
    <section className="professor-controls">
      <label>學校<select value={schoolId} onChange={(event) => { setDepartmentsLoading(true); setSchoolId(event.target.value); setDepartment(''); setRatingTargetId(''); }}>{universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label><Search size={14} />搜尋老師或系所<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="輸入姓名或系所" /></label>
      <label>系所<select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">全部系所（{departments.length}）</option>{departmentsByCollege.map(([college, units]) => <optgroup label={college} key={college}>{units.map((item) => <option value={item.name} key={item.id}>{item.name}</option>)}</optgroup>)}</select></label>
    </section>
    {error && <p className={`professor-message ${error === '評分已更新。' ? 'is-success' : ''}`}>{error}</p>}
    <section className="professor-grid">
      {loading && <div className="professor-empty"><span className="loading-dot" />載入中</div>}
      {!loading && professors.length === 0 && <div className="professor-empty"><GraduationCap size={28} /><strong>{department ? `${department}目前沒有老師資料` : '目前沒有老師資料'}</strong><span>請試著切換系所或搜尋其他姓名。</span></div>}
      {professors.map((professor) => <article className={`professor-card ${ratingTargetId === professor.id ? 'is-rating' : ''}`} key={professor.id}>
        <small>{professor.department}</small><h2>{professor.name}</h2>
        <a className="professor-official-link" href={professor.officialSourceUrl} target="_blank" rel="noreferrer">查看官方師資頁<ExternalLink size={12} /></a>
        <div className="professor-score"><Star size={18} fill="currentColor" /><strong>{professor.averageRating === null ? '—' : professor.averageRating.toFixed(1)}</strong><span>/ 5 · {professor.ratingCount} 人評分</span></div>
        <dl className="professor-dimensions">
          {ratingDimensions.map((dimension) => <div key={dimension.key}><dt>{dimension.label}{dimension.hint && <small>{dimension.hint}</small>}</dt><dd>{professor[dimension.averageKey] === null ? '—' : professor[dimension.averageKey]!.toFixed(1)}</dd></div>)}
        </dl>
        {ratingTargetId !== professor.id && <button className="open-rating-button" type="button" onClick={() => openRating(professor)}>評這位老師</button>}
        {ratingTargetId === professor.id && <form className="rating-form" onSubmit={(event) => void submitRating(event, professor)}>
          <button className="rating-close" type="button" onClick={() => setRatingTargetId('')} aria-label="關閉評分"><X size={15} /></button>
          {ratingDimensions.map((dimension) => <fieldset key={dimension.key}>
            <legend>{dimension.label}{dimension.hint && <small>{dimension.hint}</small>}</legend>
            <div className="dimension-scale" aria-label={`${professor.name}的${dimension.label}`}>
              {[1, 2, 3, 4, 5].map((score) => <button className={scores[dimension.key] === score ? 'is-selected' : ''} type="button" key={score} aria-pressed={scores[dimension.key] === score} onClick={() => setScores((current) => ({ ...current, [dimension.key]: score }))}>{score}</button>)}
            </div>
            <small><span>1 {dimension.low}</span><span>5 {dimension.high}</span></small>
          </fieldset>)}
          <button className="rating-submit" type="submit" disabled={submitting}>{submitting ? '送出中…' : <><Check size={14} />送出五項評分</>}</button>
        </form>}
      </article>)}
    </section>
  </main>;
}
