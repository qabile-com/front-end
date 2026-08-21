import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'قبیله ققنوس',
    short_name: 'قبیله',
    description: 'اکوسیستم رشد، یادگیری، نقشه راه، دوره‌ها و محفل قبیله ققنوس.',
    start_url: '/home',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'fa',
    background_color: '#050302',
    theme_color: '#050302',
    categories: ['education', 'productivity', 'social'],
    icons: [
      {
        src: '/icons/icon.png',
        sizes: '151x151',
        type: 'image/png',
      },
      {
        src: '/icons/icon.png',
        sizes: '151x151',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
