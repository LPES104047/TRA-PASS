'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // 您可以在這裡將錯誤發送給 Sentry 或其他監控系統，目前先印在 Console 供您除錯
    console.error("全域錯誤攔截：", error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      backgroundColor: '#0B132B',
      color: '#E0E1DD',
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center',
      zIndex: 99999,
      position: 'relative'
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#FFFFFF' }}>⚠️ 糟糕！發生了非預期的錯誤</h2>
      <p style={{ color: '#9CA3AF', marginBottom: '30px', lineHeight: '1.6' }}>
        可能是網路瞬間不穩或瀏覽器相容性問題。<br />請點擊下方按鈕重新連線。
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '12px 24px',
          backgroundColor: '#4FACFE',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        重新嘗試連線
      </button>
    </div>
  );
}
