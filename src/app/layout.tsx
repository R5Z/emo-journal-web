import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWARegistration from '@/components/PWARegistration';

export const metadata: Metadata = {
  title: '감정 일기',
  description: '감정을 기록하고 시각화하는 일기 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '감정 일기',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
