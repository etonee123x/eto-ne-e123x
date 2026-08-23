import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${process.env.SERVER_ORIGIN}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.SERVER_ORIGIN}/uploads/:path*`,
      },
      {
        source: '/content/:path*',
        destination: `${process.env.SERVER_ORIGIN}/content/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
