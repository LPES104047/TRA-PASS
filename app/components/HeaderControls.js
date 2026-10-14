// TRA PASS: Global Header Controls (Connection Badge, Manual Refresh, Theme Selector)
// Module: app/components/HeaderControls.js

import React from "react";
import { getStatusBadgeConfig } from "../../lib/statusBadge";

export default function HeaderControls({
  isLoaded,
  isLiveConnected,
  connStatus,
  refreshCountdown,
  connectionTimeLeft,
  cooldownTimeLeft,
  toggleLiveConnection,
  handleManualRefresh,
  theme,
  setTheme
}) {
  if (!isLoaded) return null;

  const badge = getStatusBadgeConfig({
    isLiveConnected,
    connStatus,
    refreshCountdown,
    connectionTimeLeft
  });

  const isRefreshDisabled = (!isLiveConnected && cooldownTimeLeft === 0) || cooldownTimeLeft > 0;

  return (
    <div className="global-header-btn-group">
      <div className="global-header-left-group">
        {/* 連線狀態切換按鈕 */}
        <button
          onClick={toggleLiveConnection}
          className="global-conn-btn"
          style={{
            background: badge.bg,
            color: badge.color,
            border: badge.border,
            boxShadow: badge.shadow
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: badge.dotColor,
              color: badge.dotColor,
              animation: badge.pulseAnim,
              boxShadow: badge.dotColor !== '#7F8C8D' ? `0 0 8px ${badge.dotColor}` : 'none'
            }}
          />
          <span>{badge.text}</span>
        </button>

        {/* 手動刷新按鈕 (含 20 秒冷卻) */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshDisabled}
          className="global-refresh-btn"
          style={{
            background: cooldownTimeLeft > 0
              ? 'rgba(230, 126, 34, 0.15)'
              : (!isLiveConnected ? 'rgba(127, 140, 141, 0.2)' : 'rgba(52, 152, 219, 0.15)'),
            color: cooldownTimeLeft > 0
              ? '#E67E22'
              : (!isLiveConnected ? '#BDC3C7' : '#3498DB'),
            border: cooldownTimeLeft > 0
              ? '1px solid rgba(230, 126, 34, 0.4)'
              : (!isLiveConnected ? '1px solid rgba(127, 140, 141, 0.3)' : '1px solid rgba(52, 152, 219, 0.4)'),
            cursor: isRefreshDisabled ? 'not-allowed' : 'pointer',
            opacity: isLiveConnected ? 1 : 0.5,
            pointerEvents: isLiveConnected ? 'auto' : 'none'
          }}
        >
          <span>{cooldownTimeLeft > 0 ? `⏳ 鎖定中 (${cooldownTimeLeft}s)` : '立即手動更新'}</span>
        </button>
      </div>

      {/* 主題切換器 */}
      <div className="global-theme-selector">
        <button
          onClick={() => setTheme(1)}
          className="theme-select-btn"
          style={{ background: theme === 1 ? '#00F2FE' : '#333' }}
        >
          極簡風
        </button>
        <button
          onClick={() => setTheme(2)}
          className="theme-select-btn"
          style={{ background: theme === 2 ? '#1B3B6F' : '#333' }}
        >
          車票風
        </button>
        <button
          onClick={() => setTheme(3)}
          className="theme-select-btn"
          style={{ background: theme === 3 ? '#00F0FF' : '#333' }}
        >
          儀表板風
        </button>
      </div>
    </div>
  );
}
