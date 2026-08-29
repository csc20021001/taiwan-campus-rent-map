'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, ExternalLink, GraduationCap, LogIn, Plus, Search, ShieldCheck, Star, X } from 'lucide-react';
import { universities } from '@/app/data';

type Course = {
  id: string;
  courseId: string;
  universityId: string;
  semester: '1' | '2';
  courseCode: string;
  name: string;
  department: string;
  officialSourceUrl: string;
  departmentSourceUrl: string;
  sourceType: 'official' | 'user';
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
  const [semester, setSemester] = useState('');
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
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [courseSubmission, setCourseSubmission] = useState({ semester: '1', department: '', name: '', instructorName: '', officialSourceUrl: '' });
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
      if (semester) params.set('semester', semester);
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
  }, [department, schoolId, search, semester]);

  async function loadMore() {
    if (nextOffset === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ university_id: schoolId, limit: '36', offset: String(nextOffset) });
      if (search.trim()) params.set('search', search.trim());
      if (department.trim()) params.set('department', department.trim());
      if (semester) params.set('semester', semester);
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

  function openSubmission() {
    if (!auth.user) {
      window.location.assign(`/api/auth/google/start?returnTo=${encodeURIComponent('/courses')}`);
      return;
    }
    setCourseSubmission({ semester: semester || '1', department: department || departments[0]?.name || '', name: '', instructorName: '', officialSourceUrl: '' });
    setSubmissionOpen(true);
    setMessage('');
  }

  async function submitCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/courses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId: schoolId, ...courseSubmission }),
      });
      const data = await response.json() as { course?: Course; error?: string };
      if (!response.ok || !data.course) throw new Error(data.error || '新增課程失敗');
      setCourses((current) => [data.course!, ...current]);
      setTotal((current) => current + 1);
      setSubmissionOpen(false);
      setMessage('課程已新增。');
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : '新增課程失敗');
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="professor-page">
    <header className="professor-topbar"><span className="professor-brand"><GraduationCap size={18} />WZUNAA 課程評分</span>{auth.user ? <small>{auth.user.name}</small> : <a href="/api/auth/google/start?returnTo=%2Fcourses"><LogIn size={14} />Google 登入</a>}</header>
    <section className="professor-hero"><p><Star size={14} fill="currentColor" />課程評分專區</p><h1>{school.shortName}課程評分</h1><span>以課程與授課教師為單位，查看學習收穫、作業、考試與給分評價</span><button className="course-add-button" type="button" onClick={openSubmission}><Plus size={15} />新增課程</button></section>
    <p className="professor-source-note"><ShieldCheck size={14} />資料來源以學校公開課程頁為準；課程與授課教師仍可能依校方最新公告調整。</p>
    <section className="professor-controls">
      <label>學校<select value={schoolId} onChange={(event) => { setDepartmentsLoading(true); setSchoolId(event.target.value); setDepartment(''); setSemester(''); setRatingTargetId(''); }}>{universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label><Search size={14} />搜尋課程、老師或系所<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="輸入課名、老師或系所" /></label>
      <label>系所<select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">全部系所（{departmentsLoading ? '…' : departments.length}）</option>{departmentsByCollege.map(([college, units]) => <optgroup label={college} key={college}>{units.map((item) => <option value={item.name} key={item.id}>{item.name}</option>)}</optgroup>)}</select></label>
      <label>學期<select value={semester} onChange={(event) => setSemester(event.target.value)}><option value="">全部</option><option value="1">上學期</option><option value="2">下學期</option></select></label>
    </section>
    {message && <p className={`professor-message ${message === '評分已更新。' || message === '課程已新增。' ? 'is-success' : ''}`}>{message}</p>}
    <section className="professor-grid">
      {loading && <div className="professor-empty"><span className="loading-dot" />載入中</div>}
      {!loading && courses.length === 0 && <div className="professor-empty"><GraduationCap size={28} /><strong>{department ? `${department}目前沒有已收錄課程` : '目前沒有符合條件的課程'}</strong><span>只有能由官方課程頁與現職師資名錄同時核對的課程才會顯示。</span></div>}
      {courses.map((course) => <article className={`professor-card ${ratingTargetId === course.id ? 'is-rating' : ''}`} key={course.id}>
        <small>{course.semester === '1' ? '上學期' : '下學期'}{course.sourceType === 'user' ? ' · 使用者新增' : ''}</small><h2>{course.name}</h2>
        <p className="course-instructors">授課：{course.instructors.map((instructor) => <span key={`${course.id}-${instructor.name}`}>{instructor.officialSourceUrl ? <a href={instructor.officialSourceUrl} target="_blank" rel="noreferrer">{instructor.name}<ExternalLink size={10} /></a> : instructor.name}</span>)}</p>
        <div className="course-official-links">{course.officialSourceUrl && <a href={course.officialSourceUrl} target="_blank" rel="noreferrer">{course.sourceType === 'official' ? '官方課程資料' : '參考來源'}<ExternalLink size={11} /></a>}{course.departmentSourceUrl && <a href={course.departmentSourceUrl} target="_blank" rel="noreferrer">官方系所網站<ExternalLink size={11} /></a>}</div>
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
    {submissionOpen && <div className="course-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSubmissionOpen(false); }}><form className="course-modal" role="dialog" aria-modal="true" aria-labelledby="course-modal-title" onSubmit={(event) => void submitCourse(event)}>
      <button className="course-modal-close" type="button" onClick={() => setSubmissionOpen(false)} aria-label="關閉"><X size={17} /></button>
      <p><Plus size={14} />新增課程</p><h2 id="course-modal-title">新增{school.shortName}課程</h2>
      <label>學期<select value={courseSubmission.semester} onChange={(event) => setCourseSubmission((current) => ({ ...current, semester: event.target.value }))}><option value="1">上學期</option><option value="2">下學期</option></select></label>
      <label>系所<select required value={courseSubmission.department} onChange={(event) => setCourseSubmission((current) => ({ ...current, department: event.target.value }))}><option value="">請選擇系所</option>{departmentsByCollege.map(([college, units]) => <optgroup label={college} key={college}>{units.map((item) => <option value={item.name} key={item.id}>{item.name}</option>)}</optgroup>)}</select></label>
      <label>課程名稱<input required minLength={2} maxLength={100} value={courseSubmission.name} onChange={(event) => setCourseSubmission((current) => ({ ...current, name: event.target.value }))} placeholder="例如：資料結構" /></label>
      <label>授課教師<input required minLength={2} maxLength={80} value={courseSubmission.instructorName} onChange={(event) => setCourseSubmission((current) => ({ ...current, instructorName: event.target.value }))} placeholder="請填寫教師全名" /></label>
      <label>學校官方來源（選填）<input type="url" value={courseSubmission.officialSourceUrl} onChange={(event) => setCourseSubmission((current) => ({ ...current, officialSourceUrl: event.target.value }))} placeholder="https://該校官方網站/..." /></label>
      <small>送出後，同學就能分享這門課的修課經驗。</small>
      <button className="course-modal-submit" type="submit" disabled={submitting || departments.length === 0}>{submitting ? '送出中…' : '新增課程'}</button>
    </form></div>}
    <footer className="course-footer"><span>WZUNAA</span><nav><a href="/privacy">隱私權政策</a><a href="/terms">服務條款</a></nav></footer>
  </main>;
}
