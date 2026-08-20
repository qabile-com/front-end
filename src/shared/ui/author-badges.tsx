import { OptionalImage } from './optional-image';

interface AuthorBadgesProps {
  verified?: boolean;
  isAdam?: boolean;
  rebirthCount?: number;
  className?: string;
}

export function AuthorBadges({ verified, isAdam, rebirthCount, className }: AuthorBadgesProps) {
  const showVerifiedTick = Boolean(verified) || (rebirthCount ?? 0) >= 1;
  if (!showVerifiedTick && !isAdam) return null;

  return (
    <span className={className}>
      {showVerifiedTick && (
        <span className="relative inline-block size-4 shrink-0 align-middle">
          <OptionalImage src="/assets/verified-user.webp" alt="verified" className="object-contain" />
        </span>
      )}
      {isAdam && (
        <span className="text-gold rounded-xs border border-[rgba(255,98,0,.18)] px-1.5 py-0.5 text-[9px] font-extrabold whitespace-nowrap [background:linear-gradient(135deg,rgba(255,98,0,.16),rgba(243,186,99,.08))]">
          موسس
        </span>
      )}
    </span>
  );
}
