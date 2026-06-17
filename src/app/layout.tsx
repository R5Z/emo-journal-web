import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import MobileFrame from '@/components/MobileFrame';
import BottomTabBar from '@/components/BottomTabBar';
import EditorSheetMount from '@/components/EditorSheetMount';

export const metadata: Metadata = {
  title: '감정 일기 Vhue',
  description: '감정을 기록하고 시각화하는 일기 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '감정 일기 Vhue',
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
      <body className="antialiased" suppressHydrationWarning>
        <ServiceWorkerRegister />
        <MobileFrame>
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
          <BottomTabBar />
          <EditorSheetMount />
        </MobileFrame>
      </body>
    </html>
  );
}
