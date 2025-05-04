import type { NextConfig } from 'next';
import withMDX from '@next/mdx';
import withBundleAnalyzer from '@next/bundle-analyzer';

const mdxConfig = withMDX({
  extension: /\.mdx$/,
  options: {
    providerImportSource: '@mdx-js/react',
  },
});

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default bundleAnalyzer(mdxConfig(nextConfig));
