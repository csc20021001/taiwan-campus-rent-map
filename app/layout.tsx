import type { Metadata } from 'next';
import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google';
import Script from 'next/script';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';

const notoSans = Noto_Sans_TC({ variable: '--font-noto-sans-tc', subsets: ['latin'], display: 'swap' });
const notoSerif = Noto_Serif_TC({ variable: '--font-noto-serif-tc', subsets: ['latin'], display: 'swap' });
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';
const hasAdsenseClient = /^ca-pub-\d+$/.test(adsenseClient);

export const metadata: Metadata = {
  metadataBase: new URL('https://map.scmwcscr.com'),
  title: 'WZUNAA｜校園租屋與課程評分',
  description: '查詢臺灣國立大學周邊租屋資訊與課程四項評分。',
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://map.scmwcscr.com',
    siteName: 'WZUNAA',
    title: 'WZUNAA｜校園租屋與課程評分',
    description: '查詢臺灣國立大學周邊租屋資訊與課程四項評分。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'WZUNAA 大學周邊租屋地圖' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WZUNAA｜校園租屋與課程評分',
    description: '查詢臺灣國立大學周邊租屋資訊與課程四項評分。',
    images: ['/og.png'],
  },
  ...(hasAdsenseClient ? { other: { 'google-adsense-account': adsenseClient } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body className={`${notoSans.variable} ${notoSerif.variable}`}>
        {hasAdsenseClient && (
          <Script
            id="google-adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        )}
        {children}
      </body>
    </html>
  );
}
