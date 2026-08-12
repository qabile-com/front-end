'use client';

import { fileToImage } from './image-compression';

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

const MODEL_LOAD_TIMEOUT_MS = 8000;
const CLASSIFY_TIMEOUT_MS = 8000;

let modelPromise: Promise<NsfwModel | null> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('عملیات زمان‌بر شد.')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function ensureTfBackend(): Promise<void> {
  const tf = await import('@tensorflow/tfjs');
  try {
    await tf.setBackend('webgl');
    await tf.ready();
  } catch {
    try {
      await tf.setBackend('cpu');
      await tf.ready();
    } catch (error) {
      console.warn('[nsfw] failed to initialize any tfjs backend', error);
    }
  }
}

function getModel(): Promise<NsfwModel | null> {
  modelPromise ??= (async () => {
    try {
      await ensureTfBackend();
      const nsfw = await import('nsfwjs');
      const model = await withTimeout(nsfw.load(), MODEL_LOAD_TIMEOUT_MS);
      return model as NsfwModel;
    } catch (error) {
      console.warn('[nsfw] model failed to load, skipping moderation for this upload', error);
      return null;
    }
  })();

  return modelPromise.then((model) => {
    if (!model) modelPromise = null;
    return model;
  });
}

export async function moderateAvatarImage(file: File): Promise<AvatarModerationResult> {
  if (!file.type.startsWith('image/')) {
    return { allowed: false, message: 'فقط فایل تصویر قابل قبول است.' };
  }

  const image = await fileToImage(file);
  const model = await getModel();
  if (!model) {
    return { allowed: true };
  }

  let predictions: NsfwPrediction[];
  try {
    predictions = await withTimeout(model.classify(image), CLASSIFY_TIMEOUT_MS);
  } catch (error) {
    console.warn('[nsfw] classification failed, skipping moderation for this upload', error);
    return { allowed: true };
  }

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
