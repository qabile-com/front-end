'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { resolveAuthEntryTarget } from '@/core/auth/resolve-auth-entry';

interface AuthEntryLinkProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function AuthEntryLink({ children, className, ariaLabel }: AuthEntryLinkProps) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);

  const handleClick = async () => {
    if (isResolving) return;
    setIsResolving(true);
    try {
      const target = await resolveAuthEntryTarget();
      router.push(target);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <span
      role="link"
      tabIndex={0}
      className={className}
      aria-label={ariaLabel}
      aria-busy={isResolving}
      data-resolving={isResolving ? 'true' : 'false'}
      onClick={() => void handleClick()}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        void handleClick();
      }}
    >
      {children}
    </span>
  );
}
