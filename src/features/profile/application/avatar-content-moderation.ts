'use client';

type NsfwClassName = 'Drawing' | 'Hentai' | 'Neutral' | 'Porn' | 'Sexy';

interface NsfwPrediction {
  className: NsfwClassName | string;
  probability: number;
}

interface NsfwModel {
  classify: (image: HTMLImageElement) => Promise<NsfwPrediction[]>;
}

interface AvatarModerationResult {
  allowed: boolean;
  message?: string;
  predictions?: NsfwPrediction[];
}

const BLOCK_MESSAGES: Partial<Record<NsfwClassName, string>> = {
  Porn: 'این تصویر محتوای نامناسب دارد و نمی‌تواند به عنوان عکس پروفایل استفاده شود.',
  Hentai: 'این تصویر محتوای نامناسب یا تصویرسازی بزرگسالانه دارد و قابل استفاده نیست.',
  Sexy: 'این تصویر بیش از حد نامناسب تشخیص داده شد. لطفاً عکس واضح‌تر و مناسب‌تری انتخاب کنید.',
};

let nsfwLoadPromise: Promise<NsfwGlobal | null> | null = null;

interface NsfwGlobal {
  load: (modelOrUrl?: string, options?: { size?: number }) => Promise<NsfwModel>;
}

async function loadNsfwjs(): Promise<NsfwGlobal | null> {
  if (typeof window === 'undefined') return null;
  if ((window as any).nsfwjs) return (window as any).nsfwjs as NsfwGlobal;

  if (!nsfwLoadPromise) {
    nsfwLoadPromise = new Promise<NsfwGlobal | null>((resolve) => {
      const script = document.createElement('script');
      script.src = '/nsfwjs.min.js';
      script.async = true;
      script.onload = () => resolve((window as any).nsfwjs ?? null);
      script.onerror = () => {
        nsfwLoadPromise = null;
        resolve(null);
      };
      document.head.appendChild(script);
    });
  }

  return nsfwLoadPromise;
}

export async function moderateAvatarImage(file: File): Promise<AvatarModerationResult> {
  if (!file.type.startsWith('image/')) {
    return { allowed: false, message: 'فقط فایل تصویر قابل قبول است.' };
  }

  const nsfw = await loadNsfwjs();
  if (!nsfw) {
    return { allowed: true };
  }

  const image = await fileToImage(file);
  const model = await nsfw.load();
  const predictions = await model.classify(image);
  const byClass = new Map(predictions.map((item) => [item.className, item.probability]));
  const porn = byClass.get('Porn') ?? 0;
  const hentai = byClass.get('Hentai') ?? 0;
  const sexy = byClass.get('Sexy') ?? 0;

  const blockedClass =
    porn >= 0.45 || porn + hentai >= 0.6
      ? 'Porn'
      : hentai >= 0.45
        ? 'Hentai'
        : sexy >= 0.75
          ? 'Sexy'
          : null;

  if (blockedClass) {
    return {
      allowed: false,
      message: BLOCK_MESSAGES[blockedClass],
      predictions,
    };
  }

  return { allowed: true, predictions };
}

function fileToImage(file: File) {
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
