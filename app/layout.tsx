import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// next/font: loads Inter from Google Fonts at build time,
// zero layout shift, self-hosted, no runtime network request.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NexoraCapi — Connect · Automate · Grow',
  description: 'NexoraCapi managed trading platform — M, Q and Y investment plans.',
  robots: { index: false, follow: false },
};

// viewport must be a separate export in Next.js 14+
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020610',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
