import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side specific configuration
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
        path: false,
        util: false,
        url: false,
        assert: false,
        'https-proxy-agent': false,
      };

      // Exclude problematic dependencies from client bundle
      config.module = {
        ...config.module,
        exprContextCritical: false,
        rules: [
          ...config.module.rules,
          {
            test: /node_modules[\\/](https-proxy-agent|agent-base)[\\/].+/,
            use: 'null-loader',
          },
        ],
      };
    }
    return config;
  },
  devIndicators: false,
};

export default nextConfig;
