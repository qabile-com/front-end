import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/vazirmatn/index.css';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { PwaProvider } from '@/providers/pwa-provider';
import { GlassToaster } from '@/shared/lib/toast';
import { RootLayoutClient } from './root-layout-client';
import { NotificationProvider } from '@/features/notifications/presentation/notification-provider';
import { RouteTransition } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'قبیله ققنوس | اکوسیستم رشد و یادگیری گیمیفای‌شده',
  description:
    'قبیله ققنوس؛ پلتفرم یادگیری گیمیفای‌شده با نقشه راه‌های ساختاریافته، منتور هوش مصنوعی، رقابتِ سالم و دستاوردهای واقعی.',
  manifest: '/manifest.webmanifest',
  applicationName: 'قبیله ققنوس',
  appleWebApp: {
    capable: true,
    title: 'قبیله',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon.png',
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#050302',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <RootLayoutClient>
          <AuthProvider>
            <QueryProvider>
              <PwaProvider />
              <NotificationProvider />
              <RouteTransition>{children}</RouteTransition>
              <GlassToaster />
            </QueryProvider>
          </AuthProvider>
        </RootLayoutClient>
      </body>
    </html>
  );
}
