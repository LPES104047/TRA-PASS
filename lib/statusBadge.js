// TRA PASS: Connection Status Badge Presentation Logic
// Module: lib/statusBadge.js

import { formatCountdown } from "./timeUtils.js";

/**
 * 依據連線狀態產生頂部狀態按鈕的外觀與動畫設定
 * @param {object} params
 * @param {boolean} params.isLiveConnected 是否已啟動即時連線
 * @param {'idle' | 'syncing' | 'live' | 'nodata' | 'error'} params.connStatus 連線狀態
 * @param {number | null} params.refreshCountdown 下次刷新倒數秒數
 * @param {number} params.connectionTimeLeft 5分鐘連線時效剩餘秒數
 * @returns {object} badge 樣式物件
 */
export function getStatusBadgeConfig({
  isLiveConnected,
  connStatus,
  refreshCountdown,
  connectionTimeLeft
}) {
  if (!isLiveConnected || connStatus === 'idle') {
    return {
      color: '#BDC3C7',
      bg: 'rgba(127, 140, 141, 0.2)',
      border: '1px solid rgba(127, 140, 141, 0.3)',
      dotColor: '#7F8C8D',
      shadow: 'none',
      text: '離線模式 (點擊連線)',
      pulseAnim: 'none'
    };
  }

  if (connStatus === 'syncing' || refreshCountdown === null) {
    return {
      color: '#FFD700',
      bg: 'rgba(241, 196, 15, 0.18)',
      border: '1px solid rgba(241, 196, 15, 0.4)',
      dotColor: '#FFD700',
      shadow: '0 0 10px rgba(241, 196, 15, 0.3)',
      text: '資料同步中...',
      pulseAnim: 'statusPulse 0.9s ease-in-out infinite'
    };
  }

  if (connStatus === 'error') {
    const cdText = refreshCountdown ? `${refreshCountdown}s` : '60s';
    return {
      color: '#E74C3C',
      bg: 'rgba(231, 76, 60, 0.18)',
      border: '1px solid rgba(231, 76, 60, 0.4)',
      dotColor: '#E74C3C',
      shadow: '0 0 10px rgba(231, 76, 60, 0.3)',
      text: `連線異常 (${cdText})`,
      pulseAnim: 'statusPulse 0.8s ease-in-out infinite'
    };
  }

  if (connStatus === 'nodata') {
    return {
      color: '#E67E22',
      bg: 'rgba(230, 126, 34, 0.18)',
      border: '1px solid rgba(230, 126, 34, 0.4)',
      dotColor: '#E67E22',
      shadow: '0 0 10px rgba(230, 126, 34, 0.3)',
      text: `連線中 (暫無即時誤點) | ${refreshCountdown}s ✕`,
      pulseAnim: 'statusPulse 1.5s ease-in-out infinite'
    };
  }

  // 正常連線中
  const timeLeftStr = formatCountdown(connectionTimeLeft);
  return {
    color: '#2ECC71',
    bg: 'rgba(46, 204, 113, 0.15)',
    border: '1px solid rgba(46, 204, 113, 0.4)',
    dotColor: '#2ECC71',
    shadow: '0 0 10px rgba(46, 204, 113, 0.2)',
    text: `連線中 (${timeLeftStr}) | ${refreshCountdown}s ✕`,
    pulseAnim: 'statusPulse 2s ease-in-out infinite'
  };
}
