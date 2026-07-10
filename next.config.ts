import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  // 🛡️ 資訊安全防禦：配置嚴格的 HTTP Security Headers
  async headers() {
    return [
      {
        source: '/(.*)', // 應用於全站所有路徑
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // 禁止被其他網站使用 iframe 嵌入 (防點擊劫持)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // 禁止瀏覽器猜測 MIME type (防 MIME 嗅探攻擊)
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // 保護跳轉時的來源隱私
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains', // 強制使用 HTTPS (一年)
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
