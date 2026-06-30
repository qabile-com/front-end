'use client';

import { cn } from '@/core/lib/cn';

interface AuthTabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}

export function AuthTabs<T extends string>({ tabs, active, onChange }: AuthTabsProps<T>) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === active),
  );

  return (
    <div className="border-hair relative my-5 mb-6 grid grid-cols-2 rounded-[11px] border p-1 [background:var(--glass-2)]">
      <span
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg shadow-[0_4px_16px_-6px_var(--glow),inset_0_1px_0_rgba(255,255,255,.36)] transition-transform duration-300 ease-[var(--ease-out-soft)] [background:var(--fire-grad)]"
        style={{
          insetInlineStart: '4px',
          transform: `translateX(${activeIndex === 0 ? '0' : 'calc(-100% - 0px)'})`,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative z-[1] rounded-lg px-1.5 py-2.5 text-[13.5px] font-bold transition-colors duration-300',
            tab.id === active ? 'text-[#1a0a00]' : 'text-ink-2',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
