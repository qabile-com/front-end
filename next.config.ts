import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/assets/achievements/azad-kardan-zehn.webp',
        destination: '/assets/achievements/new/azadkardane-zehn.webp',
        permanent: false,
      },
      {
        source: '/assets/achievements/bidari-avalie.webp',
        destination: '/assets/achievements/new/bidari-avalie.webp',
        permanent: false,
      },
      {
        source: '/assets/achievements/donbal-konande-khargoosh-sefid.webp',
        destination: '/assets/achievements/new/donbalkonande-khargoshe-sefid.webp',
        permanent: false,
      },
      {
        source: '/assets/achievements/dooshhaye-yakhi.webp',
        destination: '/assets/achievements/new/dooshhaye-yakhi.webp',
        permanent: false,
      },
      {
        source: '/assets/achievements/ghors-ghermez.webp',
        destination: '/assets/achievements/new/ghors-ghermez.webp',
        permanent: false,
      },
      {
        source: '/assets/achievements/hich-ghasogh.webp',
        destination: '/assets/achievements/new/hich-ghasogh.webp',
        permanent: false,
      },
      {
        source: '/assets/achievements/jangjoo-sahar-khiz.webp',
        destination: '/assets/achievements/new/jangjoye-sobh.webp',
        permanent: false,
      },
      {
        source: '/assets/achievements/jarghe-nokhostin.webp',
        destination: '/assets/achievements/new/jaraghe-nokhostin.webp',
        permanent: false,
      },
      {
        source: '/assets/achievements/jornal-nevis.webp',
        destination: '/assets/achievements/new/jornal-nevis.webp',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
