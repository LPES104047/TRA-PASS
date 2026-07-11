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
    // 🌟 智慧動態 CSP：開發環境允許 eval 進行除錯；正式上線 (Production) 則徹底封殺惡意腳本後門！
    const isDev = process.env.NODE_ENV !== 'production';
    const cspValue = isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:;"
      : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:;";

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
            value: 'max-age=31536000; includeSubDomains; preload', // 🛡️ HSTS 預載防護
          },
          {
            key: 'Content-Security-Policy',
            value: cspValue, // 套用動態 CSP 變數
          },
        ],
      },
    ];
  },
};

export default nextConfig;
