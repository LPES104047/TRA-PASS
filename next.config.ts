// TRA PASS: Next.js Configuration (Hardened Security Baseline)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🛡️ 隱匿技術棧特徵：移除 X-Powered-By: Next.js 標頭
  poweredByHeader: false,
  devIndicators: {
    position: 'bottom-right',
  },
  // 🛡️ 資訊安全防禦：配置現代化嚴格 HTTP Security Headers
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    // 🛡️ 最小權限動態 CSP：
    // - 配合 R2 字體解耦，徹底移除外部 Google Fonts 域名
    // - 增強 object-src 'none', base-uri 'self', form-action 'self', frame-ancestors 'none'
    const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";
    const upgradeInsecure = isDev ? "" : "upgrade-insecure-requests";

    const cspValue = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      upgradeInsecure
    ].filter(Boolean).join('; ');

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
            value: 'max-age=63072000; includeSubDomains; preload', // 🛡️ HSTS 預載防護 (2年)
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
