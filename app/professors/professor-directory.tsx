'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, LogIn, Search, ShieldCheck, Star } from 'lucide-react';
import { universities } from '@/app/data';

type Professor = { id: string; universityId: string; department: string; name: string; averageRating: number | null; ratingCount: number };
type AuthState = { user: { id: string; name: string } | null; googleConfigured: boolean };

export function ProfessorDirectory() {
  const [schoolId, setSchoolId] = useState('ntu');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [auth, setAuth] = useState<AuthState>({ user: null, googleConfigured: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const school = universities.find((item) => item.id === schoolId) ?? universities[0];

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => response.json() as Promise<AuthState>)
      .then(setAuth)
      .catch(() => undefined);
  }, []);

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

  const departments = useMemo(() => [...new Set(professors.map((item) => item.department))].sort(), [professors]);

  async function rate(professor: Professor, score: number) {
    if (!auth.user) {
      window.location.assign(`/api/auth/google/start?returnTo=${encodeURIComponent('/professors')}`);
      return;
    }
    const response = await fetch(`/api/professors/${encodeURIComponent(professor.id)}/rating`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ easyToPassScore: score }),
    });
    const data = await response.json() as { professor?: Professor; error?: string };
    if (!response.ok || !data.professor) return setError(data.error || '評分失敗');
    setProfessors((current) => current.map((item) => item.id === data.professor!.id ? data.professor! : item));
    setError('評分已更新；同一帳號只保留一筆。');
  }

  return <main className="professor-page">
    <header className="professor-topbar"><Link href="/"><ArrowLeft size={15} />回租屋地圖</Link><span className="professor-brand"><GraduationCap size={18} />校邊教授評分</span>{auth.user ? <small>{auth.user.name}</small> : <a href="/api/auth/google/start?returnTo=%2Fprofessors"><LogIn size={14} />Google 登入</a>}</header>
    <section className="professor-hero"><p><ShieldCheck size={14} />匿名聚合、無自由文字留言</p><h1>{school.shortName}教授好不好過</h1><span>每位使用者對同一教授只保留一筆 1～5 分評分；重新提交會更新。</span></section>
    <section className="professor-controls">
      <label>學校<select value={schoolId} onChange={(event) => { setSchoolId(event.target.value); setDepartment(''); }}>{universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label><Search size={14} />搜尋教授或系所<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="輸入姓名或系所" /></label>
      <label>系所<select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">全部系所</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
    </section>
    {error && <p className="professor-message">{error}</p>}
    <section className="professor-grid">
      {loading && <div className="professor-empty"><span className="loading-dot" />載入中</div>}
      {!loading && professors.length === 0 && <div className="professor-empty"><GraduationCap size={28} /><strong>目前尚無教授種子資料</strong><span>資料表、搜尋與評分流程已就緒；匯入姓名、系所與學校後即可使用。</span></div>}
      {professors.map((professor) => <article className="professor-card" key={professor.id}>
        <small>{professor.department}</small><h2>{professor.name}</h2>
        <div className="professor-score"><Star size={18} fill="currentColor" /><strong>{professor.averageRating === null ? '—' : professor.averageRating.toFixed(1)}</strong><span>/ 5 · {professor.ratingCount} 人評分</span></div>
        <div className="score-picker" aria-label={`替 ${professor.name} 評分`}>{[1, 2, 3, 4, 5].map((score) => <button key={score} onClick={() => void rate(professor, score)}>{score}</button>)}</div>
      </article>)}
    </section>
  </main>;
}
