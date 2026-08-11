export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: Required<ImageCompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  maxSizeBytes: 2 * 1024 * 1024,
  mimeType: 'image/jpeg',
};

export async function compressImage(file: File, options: ImageCompressOptions = {}): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const image = await fileToImage(file);
  const orientation = await readExifOrientation(file).catch(() => 1);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return file;
  }

  let { width, height } = image;

  if (width > opts.maxWidth || height > opts.maxHeight) {
    const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const swapsDimensions = orientation >= 5 && orientation <= 8;
  canvas.width = swapsDimensions ? height : width;
  canvas.height = swapsDimensions ? width : height;
  applyOrientationTransform(ctx, orientation, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  let blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, opts.mimeType, opts.quality);
  });

  if (!blob || blob.size <= opts.maxSizeBytes) {
    const result = new File([blob ?? file], file.name, { type: opts.mimeType });
    URL.revokeObjectURL(image.src);
    return result;
  }

  let quality = opts.quality;
  let iterations = 0;

  while (blob.size > opts.maxSizeBytes && quality > 0.3 && iterations < 6) {
    quality = Math.round((quality - 0.1) * 100) / 100;
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, opts.mimeType, quality);
    });
    iterations++;
  }

  const result = new File([blob ?? file], file.name, { type: opts.mimeType });
  URL.revokeObjectURL(image.src);
  return result;
}

const HEIC_MIME_TYPES = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']);

function isHeicFile(file: File): boolean {
  if (HEIC_MIME_TYPES.has(file.type.toLowerCase())) return true;
  const name = file.name.toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          isHeicFile(file)
            ? 'این مرورگر از فرمت HEIC پشتیبانی نمی‌کند. از تنظیمات دوربین، فرمت عکس را روی «سازگارترین» (Most Compatible) بگذار یا عکس را با فرمت JPG انتخاب کن.'
            : 'تصویر انتخاب شده قابل خواندن نیست.',
        ),
      );
    };
    image.src = url;
  });
}

// Reads the EXIF orientation tag (0x0112) straight out of the JPEG's APP1 segment so
// canvas re-encoding doesn't silently strip it and leave phone photos sideways/upside-down.
async function readExifOrientation(file: File): Promise<number> {
  if (file.type !== 'image/jpeg') return 1;

  const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
  const view = new DataView(buffer);

  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return 1;

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;

    if (marker === 0xffe1) {
      if (offset + 6 > view.byteLength || view.getUint32(offset + 2, false) !== 0x45786966) return 1;

      const tiffOffset = offset + 8;
      if (tiffOffset + 8 > view.byteLength) return 1;

      const little = view.getUint16(tiffOffset, false) === 0x4949;
      const firstIfdOffset = view.getUint32(tiffOffset + 4, little);
      const dirOffset = tiffOffset + firstIfdOffset;
      if (dirOffset + 2 > view.byteLength) return 1;

      const entries = view.getUint16(dirOffset, little);
      for (let i = 0; i < entries; i++) {
        const entryOffset = dirOffset + 2 + i * 12;
        if (entryOffset + 10 > view.byteLength) break;
        if (view.getUint16(entryOffset, little) === 0x0112) {
          return view.getUint16(entryOffset + 8, little);
        }
      }
      return 1;
    }

    if ((marker & 0xff00) !== 0xff00) break;
    if (offset + 2 > view.byteLength) break;
    offset += view.getUint16(offset, false);
  }

  return 1;
}

// Standard EXIF-orientation-to-canvas-transform table (values 2-8; 1 is identity/no-op).
function applyOrientationTransform(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number,
) {
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
    default:
      break;
  }
}
