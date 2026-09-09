import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: 'images.unsplash.com' },
    ],
  },
  // Cloudflare Workers（@opennextjs/cloudflare）需要标准的服务端构建产物。
  // 注意：不要使用 output: 'export'，纯静态导出与 OpenNext 不兼容。
  outputFileTracingRoot: process.cwd(),
};

export default withNextIntl(nextConfig);
