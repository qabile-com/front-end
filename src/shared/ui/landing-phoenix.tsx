import { OptionalImage } from './optional-image';

export function LandingPhoenix({ className }: { className?: string }) {
  return (
    <div className={className}>
      <OptionalImage src="/assets/hero-phoenix.webp" alt="ققنوس" className="object-contain" />
    </div>
  );
}
