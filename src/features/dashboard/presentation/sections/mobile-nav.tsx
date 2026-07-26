'use client';

import Link from 'next/link';
import { Icon, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import type { DashboardTab } from '@/features/dashboard/domain/dashboard.types';

interface MobileNavProps {
  activeHref: string;
}

const ITEMS: { id: DashboardTab; label: string; icon: IconName; href: string }[] = [
  { id: 'home', label: 'خانه', icon: 'home-m', href: '/home' },
  { id: 'social', label: 'انجمن', icon: 'community', href: '/social' },
  { id: 'courses', label: 'تالار دانش', icon: 'social', href: '/courses' },
  { id: 'profile', label: 'پروفایل', icon: 'profile', href: '/profile' },
];

export function MobileNav({ activeHref }: MobileNavProps) {
  return (
    <nav className="border-hair fixed inset-x-0 bottom-0 z-50 flex h-19 items-start border-t pt-2.5 [backdrop-filter:blur(22px)] [background:rgba(8,5,2,.94)] lg:hidden">
      {ITEMS.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1.25 text-[10.5px] font-bold transition-colors',
              isActive ? 'text-gold' : 'text-ink-3',
            )}
          >
            <Icon
              name={item.icon}
              size={24}
              className={cn(
                'ease-back transition-transform duration-300',
                isActive && '-translate-y-0.5 scale-110',
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
