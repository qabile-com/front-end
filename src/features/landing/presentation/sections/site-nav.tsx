'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { Button, Container, Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { BrandMark } from '../components/brand-mark';

const NAV_LINKS = [
  { label: 'امکانات', href: '#pillars' },
  { label: 'مسیر رشد', href: '#roadmap' },
  { label: 'رقابت', href: '#leaderboard' },
  { label: 'دیدگاه‌ها', href: '#voices' },
  { label: 'سؤالات', href: '#faq' },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  const handleSectionClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const sectionId = href.replace('#', '');
    const section = document.getElementById(sectionId);

    if (!section) return;

    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', href);
  };

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[100] transition-[background,border-color,backdrop-filter] duration-300',
        scrolled
          ? 'border-hair border-b backdrop-blur-[20px] [background:rgba(5,3,2,.72)]'
          : 'border-b border-transparent',
      )}
    >
      <Container className="flex h-[72px] items-center justify-between">
        <BrandMark />

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleSectionClick(link.href)}
              className="text-ink-2 hover:text-ink group relative text-sm font-medium transition-colors"
            >
              {link.label}
              <span className="bg-ember absolute end-0 -bottom-1 h-[1.5px] w-0 origin-right transition-[width] duration-300 ease-[var(--ease-out-soft)] group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href="/auth" className="hidden sm:block">
            <Button variant="ghost" className="rounded-md px-[22px] py-[11px]">
              ورود
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="primary" className="rounded-md px-6 py-[11px]">
              شروع رایگان
            </Button>
          </Link>
          <button
            type="button"
            aria-label="منو"
            className="border-hair text-ink grid size-10 place-items-center rounded-xl border [background:var(--glass-2)] lg:hidden"
          >
            <Icon name="plus" size={18} />
          </button>
        </div>
      </Container>
    </header>
  );
}
