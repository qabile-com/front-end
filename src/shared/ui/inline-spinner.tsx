import { cn } from '@/core/lib/cn';

interface InlineSpinnerProps {
  className?: string;
  style?: React.CSSProperties;
}

export function InlineSpinner({ className, style }: InlineSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      style={style}
    />
  );
}
