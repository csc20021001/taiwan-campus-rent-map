'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Record<string, never>[];
  }
}

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';
const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? '';
const isConfigured = /^ca-pub-\d+$/.test(client) && /^\d+$/.test(slot);

export function AdSenseSlot() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!isConfigured || initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      initialized.current = false;
    }
  }, []);

  if (!isConfigured) {
    return (
      <aside className="ad-slot ad-placeholder" aria-label="廣告版位">
        <span>廣告</span>
      </aside>
    );
  }

  return (
    <aside className="ad-slot" aria-label="廣告">
      <span>廣告</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
