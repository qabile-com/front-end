import Link from 'next/link';
import { Icon } from '@/shared/ui';

export function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-md text-[#fff] shadow-[0_0_18px_-2px_var(--glow),inset_0_1px_0_rgba(255,255,255,.44)] [background:var(--fire-grad)]">
        <Icon name="flame" size={22} />
      </span>
      <span className="leading-tight">
        <span className="mb-1 block font-extrabold">قبیله ققنوس</span>
        <small className="text-ink-3 block text-[10.5px] font-medium tracking-[0.1em]">
          PHOENIX TRIBE
        </small>
      </span>
    </Link>
  );
}
