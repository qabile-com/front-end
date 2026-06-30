import type { Metadata } from 'next';

import '@fontsource-variable/vazirmatn';
import './globals.css';

export const metadata: Metadata = {
  title: 'قبیله ققنوس | اکوسیستم رشد و یادگیری گیمیفای‌شده',
  description:
    'قبیله ققنوس؛ پلتفرم یادگیری گیمیفای‌شده با نقشه‌راه‌های ساختاریافته، منتور هوش مصنوعی، رقابتِ سالم و دستاوردهای واقعی.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
