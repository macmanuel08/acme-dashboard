import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  expiremental: {
    ppr: 'incremental'
  }
};

export default nextConfig;
