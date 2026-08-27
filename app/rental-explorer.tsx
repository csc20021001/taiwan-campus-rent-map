'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BarChart3, ChevronDown, CircleDollarSign, LocateFixed, LogIn, LogOut, MapPin, MessageSquare, Plus, ShieldCheck, Star, X } from 'lucide-react';
import type { Map as MapLibreMap, MapMouseEvent, Marker as MapLibreMarker } from 'maplibre-gl';
import { AdSenseSlot } from './adsense';
import { createCampusMapStyle, DEFAULT_VECTOR_TILE_URL } from './campus-map-style.mjs';
import { universities } from './data';
import { absoluteLngLat, boundsForLocations } from './map-geometry.mjs';

type AuthUser = { id: string; email: string; name: string; avatarUrl: string | null };
type AuthState = { user: AuthUser | null; googleConfigured: boolean };
type Rental = {
  id: string;
  universityId: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  source: 'government' | 'user' | 'admin';
  referenceRent: number | null;
  referenceRentSource: string | null;
  coordinateSource: string | null;
  coordinatesVerified: boolean;
  averageRent: number | null;
  medianRent: number | null;
  priceSourceCount: number;
  rentReportCount: number;
  averageRating: number | null;
  ratingCount: number;
};
type RentalComment = { id: string; authorName: string; content: string; createdAt: string };
type Filter = 'all' | 'rated' | 'under10';

const money = new Intl.NumberFormat('zh-TW');
const date = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
const vectorTileUrl = process.env.NEXT_PUBLIC_VECTOR_TILE_URL?.trim() || DEFAULT_VECTOR_TILE_URL;

function rentLabel(rental: Rental) {
  if (rental.averageRent !== null) return `$${Math.round(rental.averageRent / 100) / 10}k`;
  return '待回報';
}

function ratingLabel(rental: Rental) {
  return rental.averageRating === null ? '★ 未評' : `★ ${rental.averageRating.toFixed(1)}`;
}

export function RentalExplorer() {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const markers = useRef<MapLibreMarker[]>([]);
  const fittedCoordinates = useRef('');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [schoolId, setSchoolId] = useState('ntu');
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [mobilePanel, setMobilePanel] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ user: null, googleConfigured: false });
  const [authLoading, setAuthLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [draftAddress, setDraftAddress] = useState('');
  const [draftLatitude, setDraftLatitude] = useState(universities[0].latitude);
  const [draftLongitude, setDraftLongitude] = useState(universities[0].longitude);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [comments, setComments] = useState<RentalComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');

  const school = universities.find((item) => item.id === schoolId) ?? universities[0];
  const selected = rentals.find((item) => item.id === selectedId) ?? null;
  const filteredRentals = useMemo(() => rentals.filter((rental) => {
    if (filter === 'rated') return rental.ratingCount > 0;
    if (filter === 'under10') return rental.averageRent !== null && rental.averageRent < 10000;
    return true;
  }), [filter, rentals]);

  useEffect(() => {
    let active = true;
    fetch(`/api/rentals?university_id=${encodeURIComponent(schoolId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('資料載入失敗');
        return response.json() as Promise<{ rentals: Rental[] }>;
      })
      .then((data) => {
        if (!active) return;
        setRentals(data.rentals);
        setSelectedId((current) => data.rentals.some((item) => item.id === current) ? current : '');
      })
      .catch(() => { if (active) { setRentals([]); setToast('租屋地點載入失敗，請稍後再試'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadVersion, schoolId]);

  useEffect(() => {
    if (!selectedId || !detailOpen) return;
    let active = true;
    fetch(`/api/rentals/${encodeURIComponent(selectedId)}`)
      .then(async (response) => {
        const data = await response.json() as { rental?: Rental };
        if (active && response.ok && data.rental) {
          setRentals((current) => current.map((item) => item.id === data.rental!.id ? data.rental! : item));
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [detailOpen, selectedId]);

  useEffect(() => {
    if (!selectedId || !detailOpen) return;
    let active = true;
    fetch(`/api/rentals/${encodeURIComponent(selectedId)}/comments`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json() as { comments?: RentalComment[]; error?: string };
        if (!response.ok) throw new Error(data.error || '評論載入失敗');
        if (active) setComments(data.comments ?? []);
      })
      .catch((error) => { if (active) setCommentError(error instanceof Error ? error.message : '評論載入失敗'); })
      .finally(() => { if (active) setCommentsLoading(false); });
    return () => { active = false; };
  }, [detailOpen, selectedId]);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => response.json() as Promise<AuthState>)
      .then((data) => {
        if (!active) return;
        setAuth(data);
        const params = new URLSearchParams(window.location.search);
        const authError = params.get('authError');
        if (authError === 'not-configured') setToast('此網址尚未完成 Google 登入設定，請改用正式網站');
        else if (authError === 'invalid-state') setToast('登入驗證已逾時，請重新登入');
        else if (authError) setToast('Google 登入失敗，請重新登入');
        if (data.user && params.get('add') === '1') setAddOpen(true);
        if (params.has('authError') || params.has('add')) window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!mapNode.current || mapInstance.current) return;
    let active = true;
    let resizeObserver: ResizeObserver | null = null;
    Promise.all([
      import('maplibre-gl'),
      import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
    ]).then(([maplibregl, workerModule]) => {
      if (!active || !mapNode.current || mapInstance.current) return;
      // Production bundlers do not automatically copy MapLibre's sibling
      // worker file. Importing it as an asset keeps the worker URL deployable.
      maplibregl.setWorkerUrl(workerModule.default);
      const map = new maplibregl.Map({
        container: mapNode.current,
        style: createCampusMapStyle(vectorTileUrl),
        center: absoluteLngLat(school.latitude, school.longitude),
        zoom: 14.6,
        maxZoom: 18,
        attributionControl: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      mapInstance.current = map;
      map.once('load', () => {
        if (!active) return;
        setMapError('');
        setMapReady(true);
        requestAnimationFrame(() => map.resize());
      });
      map.on('error', () => {
        if (active && !map.isStyleLoaded()) setMapError('底圖載入失敗，請重新整理頁面');
      });
      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(mapNode.current);
    }).catch(() => {
      if (active) setMapError('地圖元件載入失敗，請重新整理頁面');
    });
    return () => {
      active = false;
      resizeObserver?.disconnect();
      markers.current.forEach((marker) => marker.remove());
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map) return;
    fittedCoordinates.current = '';
    map.flyTo({ center: absoluteLngLat(school.latitude, school.longitude), zoom: 14.6, duration: 800, essential: true });
  }, [mapReady, school.latitude, school.longitude]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map || loading) return;
    const coordinateKey = `${school.id}:${filteredRentals.map((rental) => `${rental.id}:${rental.latitude}:${rental.longitude}`).join('|')}`;
    if (fittedCoordinates.current === coordinateKey) return;
    fittedCoordinates.current = coordinateKey;
    const bounds = boundsForLocations(school, filteredRentals) as [[number, number], [number, number]];
    if (bounds[0][0] === bounds[1][0] && bounds[0][1] === bounds[1][1]) return;
    map.fitBounds(bounds, { padding: { top: 90, right: 90, bottom: 90, left: 90 }, maxZoom: 15.2, duration: 700 });
  }, [filteredRentals, loading, mapReady, school]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map) return;
    let active = true;
    import('maplibre-gl').then((maplibregl) => {
      if (!active) return;
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      const campusElement = document.createElement('div');
      campusElement.className = 'campus-marker';
      const campusLabel = document.createElement('span');
      campusLabel.textContent = school.shortName;
      campusElement.appendChild(campusLabel);
      markers.current.push(new maplibregl.Marker({ element: campusElement, anchor: 'center', subpixelPositioning: true })
        .setLngLat(absoluteLngLat(school.latitude, school.longitude)).addTo(map));

      filteredRentals.forEach((rental) => {
        if (rental.latitude === null || rental.longitude === null) return;
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'rent-marker';
        element.dataset.rentalId = rental.id;
        element.setAttribute('aria-label', `${rental.address}，平均租金 ${rentLabel(rental)}，平均評分 ${ratingLabel(rental)}`);
        const price = document.createElement('span');
        price.className = 'rent-marker-price';
        price.textContent = rentLabel(rental);
        const rating = document.createElement('span');
        rating.className = 'rent-marker-rating';
        rating.textContent = ratingLabel(rental);
        element.append(price, rating);
        element.addEventListener('click', () => {
          setSelectedId(rental.id);
          setComments([]);
          setCommentsLoading(true);
          setCommentError('');
          setDetailOpen(true);
          setMobilePanel(false);
        });
        markers.current.push(new maplibregl.Marker({ element, anchor: 'bottom', subpixelPositioning: true })
          .setLngLat(absoluteLngLat(rental.latitude, rental.longitude)).addTo(map));
      });

      if (addOpen) {
        const element = document.createElement('div');
        element.className = `draft-marker${locationConfirmed ? ' is-confirmed' : ''}`;
        element.textContent = locationConfirmed ? '新地點' : '點地圖定位';
        markers.current.push(new maplibregl.Marker({ element, anchor: 'bottom', subpixelPositioning: true })
          .setLngLat(absoluteLngLat(draftLatitude, draftLongitude)).addTo(map));
      }
    });
    return () => { active = false; };
  }, [addOpen, draftLatitude, draftLongitude, filteredRentals, locationConfirmed, mapReady, school]);

  useEffect(() => {
    mapNode.current?.querySelectorAll<HTMLElement>('.rent-marker').forEach((element) => {
      element.classList.toggle('is-selected', element.dataset.rentalId === selectedId);
    });
  }, [filteredRentals, selectedId]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map || !addOpen) return;
    const handleClick = (event: MapMouseEvent) => {
      setDraftLatitude(event.lngLat.lat);
      setDraftLongitude(event.lngLat.lng);
      setLocationConfirmed(true);
      setFormError('');
    };
    map.getCanvas().style.cursor = 'crosshair';
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
      map.getCanvas().style.cursor = '';
    };
  }, [addOpen, mapReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function chooseSchool(id: string) {
    const next = universities.find((item) => item.id === id) ?? universities[0];
    setSchoolId(next.id);
    setLoading(true);
    setRentals([]);
    setSelectedId('');
    setDetailOpen(false);
    setDraftLatitude(next.latitude);
    setDraftLongitude(next.longitude);
    setLocationConfirmed(false);
  }

  function startAdd() {
    if (!auth.user) {
      window.location.assign(`/api/auth/google/start?returnTo=${encodeURIComponent('/?add=1')}`);
      return;
    }
    setFormError('');
    setAddOpen(true);
    setDetailOpen(false);
  }

  async function submitLocation(event: FormEvent) {
    event.preventDefault();
    if (!locationConfirmed) return setFormError('請先在地圖上點選並確認位置。');
    setSubmitting(true);
    setFormError('');
    try {
      const response = await fetch('/api/rentals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId: schoolId, address: draftAddress, latitude: draftLatitude, longitude: draftLongitude }),
      });
      const data = await response.json() as { rental?: Rental; deduplicated?: boolean; error?: string };
      if (!response.ok || !data.rental) throw new Error(data.error || '新增失敗');
      setAddOpen(false);
      setDraftAddress('');
      setLocationConfirmed(false);
      setSelectedId(data.rental.id);
      setComments([]);
      setCommentsLoading(true);
      setCommentError('');
      setLoading(true);
      setReloadVersion((current) => current + 1);
      setDetailOpen(true);
      setToast(data.deduplicated ? '已找到既有地點，沒有重複建立' : '租屋地點已新增');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '新增失敗');
    } finally { setSubmitting(false); }
  }

  async function submitReport(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    if (!auth.user) {
      window.location.assign(`/api/auth/google/start?returnTo=${encodeURIComponent('/')}`);
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const response = await fetch(`/api/rentals/${encodeURIComponent(selected.id)}/report`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyRent: Number(monthlyRent), overallRating }),
      });
      const data = await response.json() as { rental?: Rental; excludedAsOutlier?: boolean; error?: string };
      if (!response.ok || !data.rental) throw new Error(data.error || '回報失敗');
      setRentals((current) => current.map((item) => item.id === data.rental!.id ? data.rental! : item));
      setMonthlyRent('');
      setToast(data.excludedAsOutlier ? '已保存；系統判定為異常值，暫不納入統計' : '使用者回報已更新');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '回報失敗');
    } finally { setSubmitting(false); }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (!auth.user) {
      window.location.assign(`/api/auth/google/start?returnTo=${encodeURIComponent('/')}`);
      return;
    }
    setCommentSubmitting(true);
    setCommentError('');
    try {
      const response = await fetch(`/api/rentals/${encodeURIComponent(selected.id)}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: commentBody }),
      });
      const data = await response.json() as { comment?: RentalComment; error?: string };
      if (!response.ok || !data.comment) throw new Error(data.error || '評論送出失敗');
      setComments((current) => [data.comment!, ...current]);
      setCommentBody('');
      setToast('評論已公開');
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : '評論送出失敗');
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuth((current) => ({ ...current, user: null }));
    setToast('已登出');
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="WZUNAA 首頁"><span className="brand-mark"><MapPin size={19} /></span><span>WZUNAA</span></Link>
        <label className="school-search"><MapPin size={14} /><select value={schoolId} onChange={(event) => chooseSchool(event.target.value)} aria-label="選擇學校">
          {universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select><ChevronDown size={14} /></label>
        <nav className="top-actions">
          <Link className="professor-nav-button" href="/professors"><Star size={15} fill="currentColor" />教授評分</Link>
          {!authLoading && (auth.user ? <button className="ghost-button" onClick={() => void logout()}><LogOut size={14} />登出</button> :
            <a className="ghost-button" href="/api/auth/google/start?returnTo=%2F"><LogIn size={14} />Google 登入</a>)}
          <button className="publish-button" onClick={startAdd}><Plus size={15} />新增地點</button>
        </nav>
      </header>

      <section className="workspace">
        <aside className={`listing-panel${mobilePanel ? ' is-open' : ''}`}>
          <button className="mobile-sheet-close" onClick={() => setMobilePanel(false)} aria-label="關閉列表"><X size={16} /></button>
          <div className="panel-heading"><div className="heading-row"><span><h1>{school.shortName}周邊租屋</h1><p>{loading ? '載入中…' : `${rentals.length} 個租屋位置`}</p></span></div></div>
          <div className="quick-filters">
            {([['all', '全部'], ['rated', '有評分'], ['under10', '月租萬元內']] as const).map(([id, label]) =>
              <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}
          </div>
          <p className="trust-note"><ShieldCheck size={15} />查看附近租金與住戶評分</p>
          <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_MAP_SLOT ?? ''} />
          <div className="cards">
            {loading && <div className="empty-state"><span className="loading-dot" /><strong>載入中…</strong></div>}
            {!loading && filteredRentals.length === 0 && <div className="empty-state"><MapPin size={24} /><strong>此篩選尚無地點</strong><span>可登入後從地圖新增。</span></div>}
            {filteredRentals.map((rental) => <button type="button" key={rental.id} className={`rental-location-card${rental.id === selectedId ? ' is-selected' : ''}`} onClick={() => { setSelectedId(rental.id); setComments([]); setCommentsLoading(true); setCommentError(''); setDetailOpen(true); setMobilePanel(false); }}>
              <strong>{rental.address}</strong>
              <span className="rental-card-stats">
                <span><small>平均月租</small><b>{rental.averageRent === null ? '尚無資料' : `NT$${money.format(rental.averageRent)}`}</b></span>
                <span><small>住戶評分</small><b>{rental.averageRating === null ? '—' : `★ ${rental.averageRating.toFixed(1)}`}</b></span>
              </span>
              {rental.latitude === null && <span className="coordinate-warning">尚未標記位置</span>}
            </button>)}
          </div>
        </aside>

        <div className="map-panel">
          <div ref={mapNode} className="map-canvas" />
          {!mapReady && !mapError && <div className="map-status" role="status"><span className="loading-dot" />載入中…</div>}
          {mapError && <div className="map-status is-error" role="alert"><MapPin size={17} />{mapError}</div>}
          <div className="map-school-card"><span className="map-school-icon"><MapPin size={17} /></span><span><strong>{school.name}</strong><small>{school.address}</small></span></div>
          {addOpen && <div className="map-pick-hint"><MapPin size={14} />點地圖選擇租屋地點位置</div>}
          <button className="locate-button" aria-label="回到學校" onClick={() => mapInstance.current?.flyTo({ center: absoluteLngLat(school.latitude, school.longitude), zoom: 14.6 })}><LocateFixed size={16} /></button>
          <button className="show-results" onClick={() => setMobilePanel(true)}>查看 {filteredRentals.length} 個地點</button>

          {detailOpen && selected && <aside className="rental-detail-drawer">
            <div className="drawer-head"><span><p>租屋資訊</p><h2>{selected.address}</h2></span><button onClick={() => { setDetailOpen(false); setFormError(''); setCommentError(''); }} aria-label="關閉"><X size={15} /></button></div>
            <div className="rental-detail-content">
              <div className="metric-grid">
                <article><CircleDollarSign size={17} /><small>平均月租</small><strong>{selected.averageRent === null ? '尚無資料' : `NT$${money.format(selected.averageRent)} / 月`}</strong></article>
                <article><BarChart3 size={17} /><small>租金回報</small><strong>{selected.priceSourceCount} 筆</strong></article>
                <article><Star size={17} /><small>住戶評分</small><strong>{selected.averageRating === null ? '尚無評分' : `${selected.averageRating.toFixed(1)} / 5`}</strong></article>
                <article><ShieldCheck size={17} /><small>評分人數</small><strong>{selected.ratingCount} 人</strong></article>
              </div>
              <section className="rental-comments" aria-label="公開評論">
                <div className="rental-comments-heading"><span><MessageSquare size={16} /><strong>公開評論</strong></span><small>{comments.length} 則</small></div>
                {commentsLoading && <p className="comment-status">載入中…</p>}
                {!commentsLoading && comments.length === 0 && <p className="comment-status">還沒有人評論，來分享第一則吧。</p>}
                {!commentsLoading && <div className="rental-comment-list">
                  {comments.map((comment) => <article className="rental-comment" key={comment.id}>
                    <header><span className="avatar">{comment.authorName.slice(0, 1)}</span><span><strong>{comment.authorName}</strong><small>{date.format(new Date(comment.createdAt))}</small></span></header>
                    <p>{comment.content}</p>
                  </article>)}
                </div>}
                <form className="rental-comment-form" onSubmit={submitComment}>
                  <textarea required minLength={4} maxLength={500} rows={3} value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="分享實際居住感受" />
                  {commentError && <p className="form-error">{commentError}</p>}
                  <button disabled={commentSubmitting}>{auth.user ? (commentSubmitting ? '送出中…' : '公開評論') : '使用 Google 登入後評論'}</button>
                </form>
              </section>
              <form className="rental-report-form" onSubmit={submitReport}>
                <h3>分享租金與評分</h3>
                <label>每月租金<input type="number" min="1000" max="200000" step="1" required value={monthlyRent} onChange={(event) => setMonthlyRent(event.target.value)} placeholder="例如 8500" /></label>
                <fieldset><legend>整體評分</legend><div className="score-picker">{[1, 2, 3, 4, 5].map((score) => <button type="button" key={score} className={overallRating === score ? 'active' : ''} onClick={() => setOverallRating(score)}>{score}</button>)}</div></fieldset>
                {formError && <p className="form-error">{formError}</p>}
                <button className="submit-review" disabled={submitting}>{auth.user ? (submitting ? '儲存中…' : '送出') : '使用 Google 登入後評分'}</button>
              </form>
            </div>
          </aside>}

          {addOpen && <aside className="publish-drawer"><div className="drawer-head"><span><p>新增地點</p><h2>標記租屋位置</h2></span><button onClick={() => setAddOpen(false)} aria-label="關閉"><X size={15} /></button></div>
            <form className="publish-form" onSubmit={submitLocation}>
              <label className="field-wide"><span>完整地址</span><input required minLength={6} maxLength={120} value={draftAddress} onChange={(event) => setDraftAddress(event.target.value)} placeholder="縣市＋區鄉鎮＋路街＋門牌" /></label>
              <div className={`location-status field-wide${locationConfirmed ? ' is-confirmed' : ''}`}><MapPin size={14} />{locationConfirmed ? `已選位置：${draftLatitude.toFixed(5)}, ${draftLongitude.toFixed(5)}` : '請在地圖點選位置'}</div>
              {formError && <p className="form-error field-wide">{formError}</p>}
              <button className="submit-listing field-wide" disabled={submitting}>{submitting ? '送出中…' : '送出'}</button>
            </form>
          </aside>}
        </div>
      </section>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
