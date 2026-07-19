import type { Metadata } from 'next';
// @ts-ignore
import '@fontsource-variable/vazirmatn';
import './globals.css';
import { DevAuthInitializer } from '@/core/auth/dev-auth-initializer';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'قبیله ققنوس | اکوسیستم رشد و یادگیری گیمیفای‌شده',
  description:
    'قبیله ققنوس؛ پلتفرم یادگیری گیمیفای‌شده با نقشه راه‌های ساختاریافته، منتور هوش مصنوعی، رقابتِ سالم و دستاوردهای واقعی.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <DevAuthInitializer />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
