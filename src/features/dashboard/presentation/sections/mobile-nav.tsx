'use client';

import { Icon, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import type { DashboardTab } from '@/features/dashboard/domain/dashboard.types';

interface MobileNavProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const ITEMS: { id: DashboardTab; label: string; icon: IconName; iconActive: IconName }[] = [
  { id: 'home', label: 'خانه', icon: 'home', iconActive: 'home-f' },
  { id: 'lb', label: 'میدان رقابت', icon: 'trophy-line', iconActive: 'trophy' },
  { id: 'social', label: 'انجمن', icon: 'users', iconActive: 'users-f' },
  { id: 'courses', label: 'کورس‌ها', icon: 'book', iconActive: 'book-f' },
  { id: 'profile', label: 'پروفایل', icon: 'user', iconActive: 'user-f' },
];

export function MobileNav({ active, onChange }: MobileNavProps) {
  return (
    <nav className="border-hair fixed inset-x-0 bottom-0 z-50 flex h-19 items-start border-t pt-2.5 [backdrop-filter:blur(22px)] [background:rgba(8,5,2,.94)] lg:hidden">
      {ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1.25 text-[10.5px] font-bold transition-colors',
              isActive ? 'text-gold' : 'text-ink-3',
            )}
          >
            <Icon
              name={isActive ? item.iconActive : item.icon}
              size={24}
              className={cn(
                'ease-back transition-transform duration-300',
                isActive && '-translate-y-0.5 scale-110',
              )}
            />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
