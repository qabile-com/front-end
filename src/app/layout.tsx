import type { Metadata } from 'next';
import '@fontsource-variable/vazirmatn/index.css';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';

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
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
