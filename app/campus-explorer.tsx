'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Footprints, Heart, Home, LocateFixed, MapPin, Menu, MessageCircle, Search, Send, ShieldCheck, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react';
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';
import type { Protocol } from 'pmtiles';
import { AdSenseSlot } from './adsense';
import { createCampusMapStyle, DEFAULT_PMTILES_URL } from './campus-map-style.mjs';
import type { Listing } from './data';
import { previewListings, universities } from './data';

type Review = { id: number; authorName: string; rating: number; content: string; createdAt: string };
type Filter = 'all' | 'studio' | 'under10' | 'cook';

const price = new Intl.NumberFormat('zh-TW');
const date = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
const pmtilesUrl = process.env.NEXT_PUBLIC_PMTILES_URL?.trim() || DEFAULT_PMTILES_URL;

let pmtilesProtocol: Protocol | null = null;

function Rating({ value, count }: { value: number; count: number }) {
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
  const [listingId, setListingId] = useState('ntu-01');
  const [listings, setListings] = useState<Listing[]>(previewListings.filter((item) => item.universityId === 'ntu'));
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

  const school = universities.find((item) => item.id === schoolId) ?? universities[0];
  const selectedListing = listings.find((item) => item.id === listingId) ?? listings[0];
  const filteredListings = useMemo(() => listings.filter((listing) => {
    if (filter === 'studio') return listing.roomType.includes('套房');
    if (filter === 'under10') return listing.monthlyRent < 10000;
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
    // Map setup runs once; selection updates are handled below.
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
        if (!active || data.listings.length === 0) return;
        setListings(data.listings);
        setListingId((current) => data.listings.some((item) => item.id === current) ? current : data.listings[0].id);
      })
      .catch(() => { /* Keep the bundled preview data available offline. */ });
    return () => { active = false; };
  }, [schoolId]);

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
        .setLngLat([school.longitude, school.latitude])
        .addTo(map));

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
          .setLngLat([listing.longitude, listing.latitude])
          .addTo(map));
      });
    });
    return () => { active = false; };
  }, [filteredListings, listingId, mapReady, school]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function chooseSchool(nextId: string) {
    setSchoolId(nextId);
    setReviewOpen(false);
    setFilter('all');
    const fallback = previewListings.filter((item) => item.universityId === nextId);
    setListings(fallback);
    const first = fallback[0];
    if (first) setListingId(first.id);
  }

  function toggleSaved(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function openReviews(listing: Listing) {
    setListingId(listing.id);
    setReviewOpen(true);
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
        <a className="brand" href="#top" aria-label="校邊首頁"><span className="brand-mark"><Home size={20} strokeWidth={2.4} /></span><span>校邊</span><small>Campus Nest</small></a>
        <label className="school-search">
          <Search size={17} aria-hidden="true" /><span className="sr-only">選擇學校</span>
          <select value={schoolId} onChange={(event) => chooseSchool(event.target.value)}>{universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <ChevronDown size={16} aria-hidden="true" />
        </label>
        <nav className="top-actions" aria-label="主要選單">
          <button className="ghost-button" type="button" onClick={() => setToast(saved.length ? `已收藏 ${saved.length} 間租屋` : '還沒有收藏的租屋')}><Heart size={17} />收藏{saved.length > 0 && <span className="saved-count">{saved.length}</span>}</button>
          <button className="publish-button" type="button" onClick={() => setToast('刊登功能將在下一階段開放')}><Sparkles size={16} />刊登租屋</button>
          <button className="icon-button menu-button" type="button" aria-label="開啟選單"><Menu size={20} /></button>
        </nav>
      </header>

      <section className="workspace" id="top">
        <aside className={`listing-panel ${mobilePanel ? 'is-open' : ''}`} aria-label={`${school.shortName}周邊租屋`}>
          <button className="mobile-sheet-close" type="button" onClick={() => setMobilePanel(false)} aria-label="收起租屋資訊"><X size={18} /></button>
          <div className="panel-heading">
            <p className="eyebrow"><MapPin size={13} /> {school.city} · {school.district}</p>
            <div className="heading-row"><div><h1>{school.shortName}周邊租屋</h1><p>{filteredListings.length} 間符合 · 步行 15 分鐘內</p></div><span className="filter-label"><SlidersHorizontal size={16} />篩選</span></div>
          </div>
          <div className="quick-filters" aria-label="快速篩選">
            {([['all', '全部'], ['studio', '套房'], ['under10', '$10K 以下'], ['cook', '可開伙']] as [Filter, string][]).map(([value, label]) => <button className={filter === value ? 'active' : ''} type="button" key={value} onClick={() => setFilter(value)}>{label}</button>)}
          </div>
          <div className="trust-note"><ShieldCheck size={17} /><span><strong>學生真實回饋</strong>　評分與留言都會公開呈現</span></div>
          <AdSenseSlot />
          <div className="cards" aria-live="polite">
            {filteredListings.length === 0 && <div className="empty-state"><Search size={22} /><strong>這個條件還沒有房源</strong><button type="button" onClick={() => setFilter('all')}>清除篩選</button></div>}
            {filteredListings.map((listing) => (
              <article className={`listing-card ${listing.id === listingId ? 'is-selected' : ''}`} key={listing.id} onClick={() => setListingId(listing.id)}>
                <div className="card-accent" aria-hidden="true"><span>{listing.featured ? '本週熱門' : '學生推薦'}</span></div>
                <div className="card-body">
                  <div className="card-topline"><div><p className="card-location"><MapPin size={12} />{listing.address}</p><h2>{listing.title}</h2></div><button className={`save-button ${saved.includes(listing.id) ? 'is-saved' : ''}`} type="button" onClick={(event) => { event.stopPropagation(); toggleSaved(listing.id); }} aria-label={saved.includes(listing.id) ? '取消收藏' : '收藏'}><Heart size={18} fill={saved.includes(listing.id) ? 'currentColor' : 'none'} /></button></div>
                  <div className="price-row"><p><strong>${price.format(listing.monthlyRent)}</strong><span>/ 月</span></p><Rating value={listing.rating} count={listing.reviewCount} /></div>
                  <div className="facts"><span>{listing.roomType}</span><span>{listing.areaPing} 坪</span><span><Footprints size={13} />步行 {listing.walkMinutes} 分</span></div>
                  <div className="card-bottom"><div className="tags">{listing.highlights.map((tag) => <span key={tag}>{tag}</span>)}</div><button type="button" className="review-link" onClick={(event) => { event.stopPropagation(); void openReviews(listing); }}><MessageCircle size={13} />看留言</button></div>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className="map-panel" aria-label="校園周邊互動地圖">
          <div ref={mapNode} className="map-canvas" />
          <div className="map-school-card"><span className="map-school-icon"><MapPin size={18} /></span><span><strong>{school.name}</strong><small>{school.address}</small></span></div>
          <button className="locate-button" type="button" onClick={() => mapInstance.current?.flyTo({ center: [school.longitude, school.latitude], zoom: 15, duration: 700, essential: true })} aria-label="回到校園位置"><LocateFixed size={19} /></button>
          {!mobilePanel && <button className="show-results" type="button" onClick={() => setMobilePanel(true)}>查看 {filteredListings.length} 間租屋</button>}
          <div className="map-legend"><span><i className="legend-campus" />校園</span><span><i className="legend-rent" />租屋</span></div>

          {reviewOpen && selectedListing && (
            <section className="review-drawer" aria-label={`${selectedListing.title}的留言與評分`}>
              <div className="drawer-head">
                <div><p>住過的人怎麼說</p><h2>{selectedListing.title}</h2><Rating value={selectedListing.rating} count={selectedListing.reviewCount} /></div>
                <button type="button" onClick={() => setReviewOpen(false)} aria-label="關閉留言"><X size={19} /></button>
              </div>
              <div className="review-list">
                {reviewsLoading && <p className="review-status">正在載入留言…</p>}
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
