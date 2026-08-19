import { cn } from '@/core/lib/cn';
import { OptionalImage } from './optional-image';

interface PostAttachmentImageProps {
  src: string;
  alt?: string;
  /** Fixed mobile/tablet box height. */
  mobileHeight?: number | string;
  /** Fixed desktop box height. */
  desktopHeight?: number | string;
  className?: string;
}

/**
 * Always shows the whole image (object-contain) inside a fixed-height box, so
 * nothing is ever cropped or stretched regardless of how extreme the image's
 * own aspect ratio is - a very tall or very wide upload just gets letterboxed
 * within the box instead of overflowing it. A blurred, scaled copy of the
 * same image fills the space around it instead of leaving bare letterbox
 * bars. Box height is smaller on mobile/tablet and larger on desktop since
 * card width differs, but the box itself is always bounded on both.
 */
export function PostAttachmentImage({
  src,
  alt = 'تصویر پیوست پست',
  mobileHeight = 420,
  desktopHeight = 420,
  className,
}: PostAttachmentImageProps) {
  return (
    <div className={cn('overflow-hidden rounded-[14px] [background:var(--glass-2)]', className)}>
      <AttachmentBox src={src} alt={alt} height={mobileHeight} className="lg:hidden" />
      <AttachmentBox src={src} alt={alt} height={desktopHeight} className="hidden lg:block" />
    </div>
  );
}

function AttachmentBox({
  src,
  alt,
  height,
  className,
}: {
  src: string;
  alt: string;
  height: number | string;
  className?: string;
}) {
  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <OptionalImage
        src={src}
        alt=""
        aria-hidden="true"
        fill
        className="scale-110 object-cover opacity-60 blur-2xl"
      />
      <OptionalImage
        src={src}
        alt={alt}
        fill
        className="object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,.4)]"
      />
    </div>
  );
}
