import type { Metadata } from 'next';
import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans_TC({ variable: '--font-noto-sans-tc', subsets: ['latin'], display: 'swap' });
const notoSerif = Noto_Serif_TC({ variable: '--font-noto-serif-tc', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://xiaobian-campus-nest.sjehd363960.chatgpt.site'),
  title: '校邊 Campus Nest｜大學周邊租屋地圖',
  description: '從地圖探索臺灣國立大學周邊租屋，查看學生的真實留言與評分。',
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://xiaobian-campus-nest.sjehd363960.chatgpt.site',
    siteName: '校邊 Campus Nest',
    title: '校邊 Campus Nest｜大學周邊租屋地圖',
    description: '從地圖探索臺灣國立大學周邊租屋，查看學生的真實留言與評分。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '校邊 Campus Nest 大學周邊租屋地圖' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '校邊 Campus Nest｜大學周邊租屋地圖',
    description: '從地圖探索臺灣國立大學周邊租屋，查看學生的真實留言與評分。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body className={`${notoSans.variable} ${notoSerif.variable}`}>{children}</body>
    </html>
  );
}
