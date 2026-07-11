import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  turbopack: {
    root: __dirname,
  },
  // 🛡️ 資訊安全防禦：配置嚴格的 HTTP Security Headers
  async headers() {
    return [
      {
        source: '/(.*)', // 應用於全站所有路徑
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // 🛡️ 增強：加上 preload 支援 HSTS 預載名單
          },
          {
            key: 'Content-Security-Policy',
            // 漏洞修復：徹底拔除 'unsafe-eval'，阻絕惡意腳本執行空間！
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
