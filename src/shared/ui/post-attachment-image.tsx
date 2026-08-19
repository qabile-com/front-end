import { cn } from '@/core/lib/cn';
import { OptionalImage } from './optional-image';

interface PostAttachmentImageProps {
  src: string;
  alt?: string;
  /** Mobile/tablet cap - image crops (object-cover) if taller than this. */
  maxHeight?: number | string;
  /** Fixed desktop box height - image shows in full (object-contain) inside it. */
  desktopHeight?: number | string;
  className?: string;
}

/**
 * A tall/vertical image cropped to a max-height reads fine on a narrow mobile
 * card, but on a wide desktop card the same crop throws away most of the
 * image. Below `lg` this just crops like before; at `lg` and up it switches
 * to a fixed-height box that shows the whole image (object-contain) with a
 * blurred, scaled copy of itself filling the space around it instead of
 * leaving bare letterbox bars.
 */
export function PostAttachmentImage({
  src,
  alt = 'تصویر پیوست پست',
  maxHeight = 420,
  desktopHeight = 420,
  className,
}: PostAttachmentImageProps) {
  return (
    <div className={cn('overflow-hidden rounded-[14px] [background:var(--glass-2)]', className)}>
      <OptionalImage
        src={src}
        alt={alt}
        fill={false}
        className="w-full object-cover lg:hidden"
        style={{ maxHeight }}
      />

      <div className="relative hidden w-full lg:block" style={{ height: desktopHeight }}>
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
          className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,.45)]"
        />
      </div>
    </div>
  );
}
