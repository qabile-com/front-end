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

  canvas.width = width;
  canvas.height = height;
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
      reject(new Error('تصویر انتخاب شده قابل خواندن نیست.'));
    };
    image.src = url;
  });
}
