import { Container, Icon, type IconName } from '@/shared/ui';
import { BrandMark } from '../components/brand-mark';

const COLUMNS: { title: string; links: string[] }[] = [
  { title: 'محصول', links: ['امکانات', 'نقشه راه‌ها', 'لیدربورد', 'اپلیکیشن'] },
  { title: 'منابع', links: ['وبلاگ', 'راهنمای شروع', 'سؤالات پرتکرار', 'محفل'] },
  { title: 'قبیله', links: ['درباره ما', 'تماس با ما', 'قوانین', 'حریم خصوصی'] },
];

const SOCIALS: { icon: IconName; label: string }[] = [
  { icon: 'ig', label: 'اینستاگرام' },
  { icon: 'tg', label: 'تلگرام' },
  { icon: 'x', label: 'ایکس' },
  { icon: 'yt', label: 'یوتیوب' },
];

export function SiteFooter() {
  return (
    <footer className="border-hair mt-20 border-t py-14">
      <Container>
        <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="md:col-span-2 lg:col-span-1">
            <BrandMark />
            <p className="text-ink-2 mt-4 max-w-[320px] text-sm leading-[1.85]">
              اکوسیستم یادگیریِ گیمیفای‌شده برای رشد فردی، توسعه‌ی مهارت و تحول واقعی. از خاکستر،
              برخیز.
            </p>
            <div className="mt-5 flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="border-hair text-ink-2 hover:text-gold hover:border-hair-2 grid size-10 place-items-center rounded-[11px] border transition-[color,border-color,transform] [background:var(--glass-2)] hover:-translate-y-0.5"
                >
                  <Icon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-bold">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-ink-2 hover:text-ink text-sm transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-hair text-ink-3 mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-[13px] sm:flex-row">
          <span>© ۱۴۰۵ قبیله ققنوس — تمامی حقوق محفوظ است.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-ink transition-colors">
              شرایط استفاده
            </a>
            <a href="#" className="hover:text-ink transition-colors">
              حریم خصوصی
            </a>
            <a href="#" className="hover:text-ink transition-colors">
              پشتیبانی
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
