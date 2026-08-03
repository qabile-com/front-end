'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Button, Container } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { BrandMark } from '../components/brand-mark';
import { AuthEntryLink } from '../components/auth-entry-link';

const NAV_LINKS = [
  { label: 'امکانات', href: '/#pillars' },
  { label: 'مسیر رشد', href: '/#roadmap' },
  { label: 'رقابت', href: '/#leaderboard' },
  { label: 'دیدگاه‌ها', href: '/#voices' },
  { label: 'سؤالات', href: '/#faq' },
  { label: 'دانلود اپلیکیشن', href: '/download' },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  const handleSectionClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const isLandingHash = href.startsWith('/#');
    const isSamePageHash = href.startsWith('#');

    if (!isLandingHash && !isSamePageHash) return;
    if (isLandingHash && window.location.pathname !== '/') return;

    const sectionId = href.replace('/#', '').replace('#', '');
    const section = document.getElementById(sectionId);

    if (!section) return;

    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', isLandingHash ? href : `#${sectionId}`);
    setMenuOpen(false);
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

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (navRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menuOpen]);

  return (
    <header
      ref={navRef}
      className={cn(
        'fixed inset-x-0 top-0 z-[100] transition-[background,border-color,backdrop-filter] duration-300 pt-[env(safe-area-inset-top)]',
        scrolled
          ? 'border-hair border-b backdrop-blur-[20px] [background:rgba(5,3,2,.72)]'
          : 'border-b border-transparent',
      )}
    >
      <Container className="flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="منو"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className={cn("border-hair text-ink group grid size-10 place-items-center rounded-xl border transition-[border-color,background,transform] duration-300 hover:border-[rgba(255,180,90,.42)] active:scale-95 lg:hidden", menuOpen ? "border-[rgba(255,180,90,.48)] [background:rgba(255,98,0,.16)]" : "[background:var(--glass-2)]")}
          >
            <span className="relative block size-5" aria-hidden="true">
              <span
                className={cn(
                  'bg-ink absolute start-0 top-[4px] h-0.5 w-5 origin-center rounded-full transition-transform duration-300 ease-[var(--ease-out-soft)] will-change-transform',
                  menuOpen && 'translate-y-[6px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'bg-ink absolute start-0 top-[10px] h-0.5 w-5 origin-center rounded-full transition-[opacity,transform] duration-200 ease-[var(--ease-out-soft)] will-change-transform',
                  menuOpen && 'scale-x-0 opacity-0',
                )}
              />
              <span
                className={cn(
                  'bg-ink absolute start-0 top-[16px] h-0.5 w-5 origin-center rounded-full transition-transform duration-300 ease-[var(--ease-out-soft)] will-change-transform',
                  menuOpen && '-translate-y-[6px] -rotate-45',
                )}
              />
            </span>
          </button>
          <BrandMark />
        </div>

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
          <AuthEntryLink className="hidden cursor-pointer sm:block">
            <Button variant="ghost" className="rounded-md px-[22px] py-[11px]">
              ورود
            </Button>
          </AuthEntryLink>
          <AuthEntryLink className="cursor-pointer">
            <Button variant="primary" className="rounded-md px-6 py-[11px]">
              شروع رایگان
            </Button>
          </AuthEntryLink>
        </div>
      </Container>

      <div
        className={cn(
          'grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-300 ease-[var(--ease-out-soft)] lg:hidden',
          menuOpen
            ? 'grid-rows-[1fr] translate-y-0 opacity-100'
            : 'pointer-events-none grid-rows-[0fr] -translate-y-2 opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-hair border-t [background:rgba(5,3,2,.88)] backdrop-blur-xl">
            <nav className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    handleSectionClick(link.href)(e);
                    setMenuOpen(false);
                  }}
                  className="text-ink-2 hover:text-ink rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

