'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown, Footprints, Heart, Home, LocateFixed, LogIn, LogOut, MapPin,
  Menu, MessageCircle, MousePointer2, Search, Send, ShieldCheck,
  SlidersHorizontal, Sparkles, Star, X,
} from 'lucide-react';
import type { Map as MapLibreMap, MapMouseEvent, Marker as MapLibreMarker } from 'maplibre-gl';
import type { Protocol } from 'pmtiles';
import { AdSenseSlot } from './adsense';
import { createCampusMapStyle, DEFAULT_PMTILES_URL } from './campus-map-style.mjs';
import type { Listing, University } from './data';
import { universities } from './data';

type Review = { id: number; authorName: string; rating: number; content: string; createdAt: string };
type Filter = 'all' | 'studio' | 'under10' | 'cook';
type AuthUser = { id: string; email: string; name: string; avatarUrl: string | null };
type AuthState = { user: AuthUser | null; googleConfigured: boolean };
type PublishDraft = {
  title: string;
  address: string;
  description: string;
  monthlyRent: string;
  roomType: string;
  areaPing: string;
  walkMinutes: string;
  latitude: number;
  longitude: number;
  highlights: string;
  contactMethod: string;
  contactValue: string;
};

const price = new Intl.NumberFormat('zh-TW');
const date = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
const pmtilesUrl = process.env.NEXT_PUBLIC_PMTILES_URL?.trim() || DEFAULT_PMTILES_URL;

let pmtilesProtocol: Protocol | null = null;

function newDraft(school: University): PublishDraft {
  return {
    title: '', address: '', description: '', monthlyRent: '', roomType: '獨立套房',
    areaPing: '', walkMinutes: '', latitude: school.latitude, longitude: school.longitude,
    highlights: '', contactMethod: 'LINE', contactValue: '',
  };
}

function Rating({ value, count }: { value: number; count: number }) {
  if (count === 0) return <span className="rating-empty">尚無評分</span>;
  return (
    <span className="rating-line" aria-label={`${value} 分，共 ${count} 則評價`}>
      <Star size={14} fill="currentColor" aria-hidden="true" />
      <strong>{value.toFixed(1)}</strong>
      <span>({count})</span>
    </span>
  );
}

export function CampusExplorer() {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const markers = useRef<MapLibreMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [schoolId, setSchoolId] = useState('ntu');
  const [listingId, setListingId] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [mobilePanel, setMobilePanel] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [auth, setAuth] = useState<AuthState>({ user: null, googleConfigured: false });
  const [authLoading, setAuthLoading] = useState(true);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishDraft, setPublishDraft] = useState(() => newDraft(universities[0]));
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishing, setPublishing] = useState(false);

  const school = universities.find((item) => item.id === schoolId) ?? universities[0];
  const selectedListing = listings.find((item) => item.id === listingId) ?? listings[0];
  const filteredListings = useMemo(() => listings.filter((listing) => {
    if (filter === 'studio') return listing.roomType.includes('套房');
    if (filter === 'under10') return listing.monthlyRent > 0 && listing.monthlyRent < 10000;
    if (filter === 'cook') return listing.highlights.includes('可開伙') || listing.highlights.includes('公共廚房');
    return true;
  }), [filter, listings]);

  useEffect(() => {
    if (!mapNode.current || mapInstance.current) return;
    let active = true;
    Promise.all([import('maplibre-gl'), import('pmtiles')]).then(([maplibregl, pmtiles]) => {
      if (!active || !mapNode.current || mapInstance.current) return;
      if (!pmtilesProtocol) {
        pmtilesProtocol = new pmtiles.Protocol();
        maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);
      }
      const map = new maplibregl.Map({
        container: mapNode.current,
        style: createCampusMapStyle(pmtilesUrl),
        center: [school.longitude, school.latitude],
        zoom: 15,
        maxZoom: 18,
        attributionControl: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      mapInstance.current = map;
      setMapReady(true);
      requestAnimationFrame(() => map.resize());
    });
    return () => {
      active = false;
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/listings?school=${encodeURIComponent(schoolId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('資料載入失敗');
        return response.json() as Promise<{ listings: Listing[] }>;
      })
      .then((data) => {
        if (!active) return;
        setListings(data.listings);
        setListingId((current) => data.listings.some((item) => item.id === current) ? current : (data.listings[0]?.id ?? ''));
      })
      .catch(() => { if (active) setListings([]); })
      .finally(() => { if (active) setListingsLoading(false); });
    return () => { active = false; };
  }, [schoolId]);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => response.json() as Promise<AuthState>)
      .then((data) => {
        if (!active) return;
        setAuth(data);
        const params = new URLSearchParams(window.location.search);
        const authError = params.get('authError');
        if (authError === 'not-configured') setToast('Google 登入尚未設定完成');
        else if (authError) setToast('Google 登入失敗，請稍後再試');
        if (data.user && params.get('publish') === '1') setPublishOpen(true);
        if (authError || params.has('publish')) {
          window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
        }
      })
      .catch(() => { /* Anonymous mode remains available. */ })
      .finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map) return;
    let active = true;
    import('maplibre-gl').then((maplibregl) => {
      if (!active) return;
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.flyTo({ center: [school.longitude, school.latitude], zoom: 15, duration: 900, essential: true });

      const campusElement = document.createElement('div');
      campusElement.className = 'campus-marker';
      campusElement.setAttribute('role', 'img');
      campusElement.setAttribute('aria-label', school.name);
      const campusLabel = document.createElement('span');
      campusLabel.textContent = school.shortName;
      campusElement.appendChild(campusLabel);
      markers.current.push(new maplibregl.Marker({ element: campusElement, anchor: 'center' })
        .setLngLat([school.longitude, school.latitude]).addTo(map));

      filteredListings.forEach((listing) => {
        const selected = listing.id === listingId;
        const rentElement = document.createElement('button');
        rentElement.type = 'button';
        rentElement.className = `rent-marker${selected ? ' is-selected' : ''}`;
        rentElement.setAttribute('aria-label', `${listing.title}，月租 ${listing.monthlyRent} 元`);
        const rentLabel = document.createElement('span');
        rentLabel.textContent = `$${Math.round(listing.monthlyRent / 100) / 10}k`;
        rentElement.appendChild(rentLabel);
        rentElement.addEventListener('click', () => {
          setListingId(listing.id);
          setMobilePanel(true);
        });
        markers.current.push(new maplibregl.Marker({ element: rentElement, anchor: 'bottom' })
          .setLngLat([listing.longitude, listing.latitude]).addTo(map));
      });

      if (publishOpen) {
        const draftElement = document.createElement('div');
        draftElement.className = `draft-marker${locationConfirmed ? ' is-confirmed' : ''}`;
        draftElement.textContent = locationConfirmed ? '新房源' : '點地圖定位';
        markers.current.push(new maplibregl.Marker({ element: draftElement, anchor: 'bottom' })
          .setLngLat([publishDraft.longitude, publishDraft.latitude]).addTo(map));
      }
    });
    return () => { active = false; };
  }, [filteredListings, listingId, locationConfirmed, mapReady, publishDraft.latitude, publishDraft.longitude, publishOpen, school]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map || !publishOpen) return;
    const canvas = map.getCanvas();
    const previousCursor = canvas.style.cursor;
    canvas.style.cursor = 'crosshair';
    const handleClick = (event: MapMouseEvent) => {
      setPublishDraft((current) => ({ ...current, latitude: event.lngLat.lat, longitude: event.lngLat.lng }));
      setLocationConfirmed(true);
      setPublishError('');
    };
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
      canvas.style.cursor = previousCursor;
    };
  }, [mapReady, publishOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function chooseSchool(nextId: string) {
    const nextSchool = universities.find((item) => item.id === nextId) ?? universities[0];
    setSchoolId(nextId);
    setReviewOpen(false);
    setFilter('all');
    setListings([]);
    setListingsLoading(true);
    setListingId('');
    setPublishDraft(newDraft(nextSchool));
    setLocationConfirmed(false);
  }

  function beginLogin() {
    if (!auth.googleConfigured) {
      setToast('Google 登入尚待設定 Client ID 與 Secret');
      return;
    }
    window.location.assign('/api/auth/google/start?returnTo=%2F%3Fpublish%3D1');
  }

  function openPublish() {
    if (!auth.user) {
      beginLogin();
      return;
    }
    setPublishDraft(newDraft(school));
    setLocationConfirmed(false);
    setPublishError('');
    setPublishOpen(true);
    setReviewOpen(false);
    setMobilePanel(false);
  }

  async function logout() {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) return setToast('暫時無法登出');
    setAuth((current) => ({ ...current, user: null }));
    setPublishOpen(false);
    setToast('已安全登出');
  }

  function toggleSaved(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function publishListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.user || !locationConfirmed) {
      setPublishError(!auth.user ? '請先登入。' : '請先在地圖上點選房源位置。');
      return;
    }
    setPublishing(true);
    setPublishError('');
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId: school.id,
          ...publishDraft,
          monthlyRent: Number(publishDraft.monthlyRent),
          areaPing: Number(publishDraft.areaPing),
          walkMinutes: Number(publishDraft.walkMinutes),
          highlights: publishDraft.highlights.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
        }),
      });
      const data = await response.json() as { listing?: Listing; error?: string };
      if (!response.ok || !data.listing) throw new Error(data.error ?? '刊登失敗');
      setListings((current) => [data.listing!, ...current]);
      setListingId(data.listing.id);
      setPublishOpen(false);
      setMobilePanel(true);
      setToast('房源已公開刊登');
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : '刊登失敗');
    } finally {
      setPublishing(false);
    }
  }

  async function openReviews(listing: Listing) {
    setListingId(listing.id);
    setReviewOpen(true);
    setPublishOpen(false);
    setReviewsLoading(true);
    setSubmitError('');
    try {
      const response = await fetch(`/api/reviews?listingId=${encodeURIComponent(listing.id)}`);
      if (!response.ok) throw new Error('留言載入失敗');
      const data = await response.json() as { reviews: Review[] };
      setReviews(data.reviews);
    } catch {
      setSubmitError('暫時無法載入留言，請稍後再試。');
    } finally {
      setReviewsLoading(false);
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedListing) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: selectedListing.id, authorName, rating, content: comment }),
      });
      const data = await response.json() as { review?: Review; error?: string };
      if (!response.ok || !data.review) throw new Error(data.error ?? '留言送出失敗');
      setReviews((current) => [data.review!, ...current]);
      setListings((current) => current.map((item) => item.id === selectedListing.id ? {
        ...item,
        rating: Math.round(((item.rating * item.reviewCount + rating) / (item.reviewCount + 1)) * 10) / 10,
        reviewCount: item.reviewCount + 1,
      } : item));
      setAuthorName('');
      setComment('');
      setRating(5);
      setToast('謝謝你！留言已公開');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '留言送出失敗');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="WZUNAA 首頁"><span className="brand-mark"><Home size={20} strokeWidth={2.4} /></span><span>WZUNAA</span></a>
        <label className="school-search">
          <Search size={17} aria-hidden="true" /><span className="sr-only">選擇學校</span>
          <select value={schoolId} onChange={(event) => chooseSchool(event.target.value)}>{universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <ChevronDown size={16} aria-hidden="true" />
        </label>
        <nav className="top-actions" aria-label="主要選單">
          <a className="ghost-button legal-button" href="/privacy">隱私權</a>
          {!authLoading && !auth.user && <button className="ghost-button login-button" type="button" onClick={beginLogin}><LogIn size={17} />Google 登入</button>}
          {auth.user && <button className="ghost-button account-button" type="button" onClick={() => void logout()} title={`${auth.user.email}・點擊登出`}><span className="account-avatar">{auth.user.name.slice(0, 1)}</span><span>{auth.user.name}</span><LogOut size={15} /></button>}
          <button className="publish-button" type="button" onClick={openPublish}><Sparkles size={16} />刊登租屋</button>
          <button className="icon-button menu-button" type="button" aria-label="開啟選單"><Menu size={20} /></button>
        </nav>
      </header>

      <section className="workspace" id="top">
        <aside className={`listing-panel ${mobilePanel ? 'is-open' : ''}`} aria-label={`${school.shortName}周邊租屋`}>
          <button className="mobile-sheet-close" type="button" onClick={() => setMobilePanel(false)} aria-label="收起租屋資訊"><X size={18} /></button>
          <div className="panel-heading">
            <p className="eyebrow"><MapPin size={13} /> {school.city} · {school.district}</p>
            <div className="heading-row"><div><h1>{school.shortName}周邊租屋</h1><p>{filteredListings.length} 間公開房源</p></div><span className="filter-label"><SlidersHorizontal size={16} />篩選</span></div>
          </div>
          <div className="quick-filters" aria-label="快速篩選">
            {([['all', '全部'], ['studio', '套房'], ['under10', '$10K 以下'], ['cook', '可開伙']] as [Filter, string][]).map(([value, label]) => <button className={filter === value ? 'active' : ''} type="button" key={value} onClick={() => setFilter(value)}>{label}</button>)}
          </div>
          <div className="trust-note"><ShieldCheck size={17} /><span><strong>零示範資料</strong>　只顯示實際提供的刊登資訊</span></div>
          <AdSenseSlot />
          <div className="cards" aria-live="polite">
            {listingsLoading && <div className="empty-state"><span className="loading-dot" /><strong>正在讀取正式房源</strong></div>}
            {!listingsLoading && filteredListings.length === 0 && <div className="empty-state"><MapPin size={24} /><strong>這所學校還沒有公開房源</strong><span>登入後刊登第一筆真實租屋資訊</span><button type="button" onClick={openPublish}>開始刊登</button></div>}
            {filteredListings.map((listing) => (
              <article className={`listing-card ${listing.id === listingId ? 'is-selected' : ''}`} key={listing.id} onClick={() => setListingId(listing.id)}>
                <div className="card-accent" aria-hidden="true"><span>{listing.id.startsWith('manual-') ? '站方代登' : '會員刊登'}</span></div>
                <div className="card-body">
                  <div className="card-topline"><div><p className="card-location"><MapPin size={12} />{listing.address}</p><h2>{listing.title}</h2></div><button className={`save-button ${saved.includes(listing.id) ? 'is-saved' : ''}`} type="button" onClick={(event) => { event.stopPropagation(); toggleSaved(listing.id); }} aria-label={saved.includes(listing.id) ? '取消收藏' : '收藏'}><Heart size={18} fill={saved.includes(listing.id) ? 'currentColor' : 'none'} /></button></div>
                  <div className="price-row"><p>{listing.monthlyRent > 0 ? <><strong>${price.format(listing.monthlyRent)}</strong><span>/ 月</span></> : <strong>租金洽詢</strong>}</p><Rating value={listing.rating} count={listing.reviewCount} /></div>
                  <div className="facts"><span>{listing.roomType}</span><span>{listing.areaPing > 0 ? `${listing.areaPing} 坪` : '坪數洽詢'}</span><span><Footprints size={13} />{listing.walkMinutes > 0 ? `步行 ${listing.walkMinutes} 分` : '時間洽詢'}</span></div>
                  <div className="contact-line">{listing.contactMethod}：{listing.contactMethod === '電話' ? <a href={`tel:${listing.contactValue}`}>{listing.contactValue}</a> : listing.contactValue}</div>
                  <div className="card-bottom"><div className="tags">{listing.highlights.map((tag) => <span key={tag}>{tag}</span>)}</div><button type="button" className="review-link" onClick={(event) => { event.stopPropagation(); void openReviews(listing); }}><MessageCircle size={13} />看留言</button></div>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className="map-panel" aria-label="校園周邊互動地圖">
          <div ref={mapNode} className="map-canvas" />
          <div className="map-school-card"><span className="map-school-icon"><MapPin size={18} /></span><span><strong>{school.name}</strong><small>{school.address}</small></span></div>
          {publishOpen && <div className="map-pick-hint"><MousePointer2 size={15} />點一下地圖，標出租屋實際位置</div>}
          <button className="locate-button" type="button" onClick={() => mapInstance.current?.flyTo({ center: [school.longitude, school.latitude], zoom: 15, duration: 700, essential: true })} aria-label="回到校園位置"><LocateFixed size={19} /></button>
          {!mobilePanel && !publishOpen && <button className="show-results" type="button" onClick={() => setMobilePanel(true)}>查看 {filteredListings.length} 間租屋</button>}
          <div className="map-legend"><span><i className="legend-campus" />校園</span><span><i className="legend-rent" />租屋</span></div>

          {publishOpen && auth.user && (
            <section className="publish-drawer" aria-label="刊登租屋">
              <div className="drawer-head">
                <div><p>GOOGLE 會員刊登</p><h2>新增 {school.shortName} 周邊房源</h2><small>刊登者：{auth.user.name}</small></div>
                <button type="button" onClick={() => setPublishOpen(false)} aria-label="關閉刊登表單"><X size={19} /></button>
              </div>
              <form className="publish-form" onSubmit={publishListing}>
                <label className="field-wide"><span>刊登標題</span><input required minLength={4} maxLength={60} value={publishDraft.title} onChange={(event) => setPublishDraft((current) => ({ ...current, title: event.target.value }))} placeholder="例如：學校正門採光套房" /></label>
                <label className="field-wide"><span>地址</span><input required minLength={4} maxLength={120} value={publishDraft.address} onChange={(event) => setPublishDraft((current) => ({ ...current, address: event.target.value }))} placeholder="請填可辨識的路段或門牌" /></label>
                <label><span>月租（元）</span><input required type="number" min="1000" max="100000" step="1" value={publishDraft.monthlyRent} onChange={(event) => setPublishDraft((current) => ({ ...current, monthlyRent: event.target.value }))} /></label>
                <label><span>房型</span><select value={publishDraft.roomType} onChange={(event) => setPublishDraft((current) => ({ ...current, roomType: event.target.value }))}><option>獨立套房</option><option>分租雅房</option><option>合租雅房</option><option>整層住家</option></select></label>
                <label><span>坪數</span><input required type="number" min="1" max="100" step="0.1" value={publishDraft.areaPing} onChange={(event) => setPublishDraft((current) => ({ ...current, areaPing: event.target.value }))} /></label>
                <label><span>步行到學校</span><input required type="number" min="1" max="60" step="1" value={publishDraft.walkMinutes} onChange={(event) => setPublishDraft((current) => ({ ...current, walkMinutes: event.target.value }))} placeholder="分鐘" /></label>
                <label className="field-wide"><span>房源說明</span><textarea required minLength={10} maxLength={1000} rows={4} value={publishDraft.description} onChange={(event) => setPublishDraft((current) => ({ ...current, description: event.target.value }))} placeholder="設備、租期、費用與看房注意事項" /></label>
                <label className="field-wide"><span>特色（用逗號分隔，最多 6 個）</span><input maxLength={100} value={publishDraft.highlights} onChange={(event) => setPublishDraft((current) => ({ ...current, highlights: event.target.value }))} placeholder="可開伙, 獨立陽台, 垃圾代收" /></label>
                <label><span>聯絡方式</span><select value={publishDraft.contactMethod} onChange={(event) => setPublishDraft((current) => ({ ...current, contactMethod: event.target.value }))}><option>LINE</option><option>電話</option><option>Email</option></select></label>
                <label><span>聯絡資訊</span><input required minLength={2} maxLength={120} value={publishDraft.contactValue} onChange={(event) => setPublishDraft((current) => ({ ...current, contactValue: event.target.value }))} /></label>
                <div className={`location-status field-wide ${locationConfirmed ? 'is-confirmed' : ''}`}><MapPin size={16} /><span>{locationConfirmed ? `位置已設定：${publishDraft.latitude.toFixed(5)}, ${publishDraft.longitude.toFixed(5)}` : '尚未定位：請點一下左側地圖'}</span></div>
                {publishError && <p className="form-error field-wide" role="alert">{publishError}</p>}
                <button className="submit-listing field-wide" type="submit" disabled={publishing || !locationConfirmed}><Send size={15} />{publishing ? '刊登中…' : '確認並公開刊登'}</button>
              </form>
            </section>
          )}

          {reviewOpen && selectedListing && (
            <section className="review-drawer" aria-label={`${selectedListing.title}的留言與評分`}>
              <div className="drawer-head">
                <div><p>住過的人怎麼說</p><h2>{selectedListing.title}</h2><Rating value={selectedListing.rating} count={selectedListing.reviewCount} /></div>
                <button type="button" onClick={() => setReviewOpen(false)} aria-label="關閉留言"><X size={19} /></button>
              </div>
              <div className="review-list">
                {reviewsLoading && <p className="review-status">正在載入留言…</p>}
                {!reviewsLoading && reviews.length === 0 && <p className="review-status">還沒有留言，歡迎分享第一則真實心得。</p>}
                {!reviewsLoading && reviews.map((review) => <article className="review-item" key={review.id}><div className="review-meta"><span className="avatar">{review.authorName.slice(0, 1)}</span><span><strong>{review.authorName}</strong><small>{date.format(new Date(review.createdAt))}</small></span><span className="review-stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={11} fill={index < review.rating ? 'currentColor' : 'none'} />)}</span></div><p>{review.content}</p></article>)}
              </div>
              <form className="review-form" onSubmit={submitReview}>
                <div className="form-heading"><strong>留下你的真實感受</strong><div className="star-picker" aria-label="評分">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} 顆星`}><Star size={19} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}</div></div>
                <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} maxLength={24} placeholder="你的暱稱" aria-label="暱稱" required />
                <textarea value={comment} onChange={(event) => setComment(event.target.value)} minLength={4} maxLength={300} rows={3} placeholder="隔音、採光、房東回覆、周邊安全⋯⋯" aria-label="留言內容" required />
                {submitError && <p className="form-error" role="alert">{submitError}</p>}
                <button className="submit-review" type="submit" disabled={submitting}><Send size={15} />{submitting ? '送出中…' : '公開留言'}</button>
              </form>
            </section>
          )}
        </div>
      </section>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
