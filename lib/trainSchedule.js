// TRA PASS: Train Schedule, Overnight Detection & Filtering Module
// Module: lib/trainSchedule.js
// Optimized & Verified Overnight Logic (Fix for 38 overnight extinction defect)

import { formatDateYMD, timeToMinutes } from "./timeUtils.js";

/**
 * 判定乘車方向 (順行/逆行 - Northbound / Southbound)
 * @param {object} data 靜態時刻表資料
 * @param {string} origin 出發站
 * @param {string} dest 抵達站
 * @returns {{ dir: "Northbound" | "Southbound", oIdx: number, dIdx: number, dirKey: string, isNorth: boolean } | null}
 */
export function resolveDirection(data, origin, dest) {
  if (!data || !origin || !dest) return null;

  if (data.Northbound?.stations) {
    const nO = data.Northbound.stations.indexOf(origin);
    const nD = data.Northbound.stations.indexOf(dest);
    if (nO !== -1 && nD !== -1 && nO < nD) {
      return { dir: "Northbound", oIdx: nO, dIdx: nD, dirKey: "Northbound", isNorth: true };
    }
  }

  if (data.Southbound?.stations) {
    const sO = data.Southbound.stations.indexOf(origin);
    const sD = data.Southbound.stations.indexOf(dest);
    if (sO !== -1 && sD !== -1 && sO < sD) {
      return { dir: "Southbound", oIdx: sO, dIdx: sD, dirKey: "Southbound", isNorth: false };
    }
  }

  return null;
}

/**
 * 根據起訖站判定過場列車動畫行進方向
 * @param {object} data
 * @param {string} from
 * @param {string} to
 * @returns {'ltr' | 'rtl'}
 */
export function getAnimationDirection(data, from, to) {
  if (!data?.Northbound?.stations) return 'ltr';
  const nO = data.Northbound.stations.indexOf(from);
  const nD = data.Northbound.stations.indexOf(to);
  if (nO !== -1 && nD !== -1 && nO < nD) return 'ltr';
  return 'rtl';
}

/**
 * 判定列車在本站是否已跨午夜 (以本站發車時間與列車首站發車時間比對)
 * @param {string} stationDepTime 本站出發時間 "HH:mm"
 * @param {string} firstStationTime 首站出發時間 "HH:mm"
 * @returns {boolean}
 */
export function isTrainOvernight(stationDepTime, firstStationTime) {
  if (!stationDepTime || !firstStationTime) return false;
  return timeToMinutes(stationDepTime) < timeToMinutes(firstStationTime);
}

/**
 * 處理、校正與過濾有效車次清單
 * 核心解決方案：
 * 1. 每日時刻表在各車站於 calendar day 均有對應班次：
 *    - 今日出發之班次預設以 todayStr 為表定出發日。
 *    - 今日深夜出發且在行駛中跨越午夜之車次 (isCrossMidnight === true)，其於午夜後各站之表定日為 tomorrowStr。
 * 2. 針對「今日班次」：
 *    - 同時納入「今日曆日班次」與「今日夜間接續之跨午夜延伸班次 (tomorrowStr)」。
 *    - 過濾只保留發車時間 >= twTime 之車次。
 *    - 設置上限防呆 (waitMins <= 960)，確保清晨查詢時不混入 24 小時後次夜班次。
 *    - 以車次編號進行唯一去重，確保每班車僅顯示最接近之班次。
 * 3. 針對「明日班次」：
 *    - 顯示明日曆日 (tomorrowStr) 之完整全日班次，延誤歸零。
 *
 * @param {object} params
 * @param {object} params.data 完整靜態時刻表
 * @param {object} params.dirInfo 方向資訊 { dir, oIdx, dIdx }
 * @param {object} [params.liveData={}] 即時誤點字典 { [trainNo]: delayMinutes }
 * @param {boolean} [params.isTomorrow=false] 是否檢視明日班次
 * @param {Date} params.twTime 台灣當前基準時間 Date
 * @returns {Array} 有效排序列車清單
 */
export function processTrainSchedules({
  data,
  dirInfo,
  liveData = {},
  isTomorrow = false,
  twTime
}) {
  if (!data || !dirInfo || !data[dirInfo.dir]?.trains) return [];

  const todayStr = formatDateYMD(twTime);

  const tomorrowTime = new Date(twTime);
  tomorrowTime.setDate(tomorrowTime.getDate() + 1);
  const tomorrowStr = formatDateYMD(tomorrowTime);

  const candidates = [];

  data[dirInfo.dir].trains.forEach((t) => {
    const oTime = t.times[dirInfo.oIdx];
    const dTime = t.times[dirInfo.dIdx];
    if (!oTime || !dTime) return;

    const depMinutes = timeToMinutes(oTime);

    // 尋找首站發車時間以判斷是否跨夜
    const firstTimeStr = t.times.find((time) => time !== "");
    const isCrossMidnight = firstTimeStr ? isTrainOvernight(oTime, firstTimeStr) : false;

    // 🛡️ 資安防護：強制數值轉換與範圍箝位 (Storage Poisoning 防禦，[0, 720])
    const rawDelay = liveData[t.number];
    const parsedDelay = typeof rawDelay === 'number' ? rawDelay : Number(rawDelay);
    const delay = Math.max(0, Math.min(Number.isFinite(parsedDelay) ? parsedDelay : 0, 720));
    const actualDepMins = depMinutes + (isTomorrow ? 0 : delay);

    if (!isTomorrow) {
      // 1. 今日曆日出發之班次 (表定在 todayStr 發車)
      candidates.push({
        ...t,
        TrainDate: todayStr,
        DepartureTime: oTime,
        depTime: oTime,
        arrTime: dTime,
        depMins: depMinutes,
        actualDepMins,
        delay,
        isNextDayOvernight: false
      });

      // 2. 今日夜間接續之跨午夜班次 (表定在 tomorrowStr 凌晨發車，屬於今日出發車次之延伸)
      if (isCrossMidnight) {
        candidates.push({
          ...t,
          TrainDate: tomorrowStr,
          DepartureTime: oTime,
          depTime: oTime,
          arrTime: dTime,
          depMins: depMinutes,
          actualDepMins,
          delay,
          isNextDayOvernight: true
        });
      }
    } else {
      // 明日班次：明日曆日出發之完整班次 (表定在 tomorrowStr 發車，明日無延誤)
      candidates.push({
        ...t,
        TrainDate: tomorrowStr,
        DepartureTime: oTime,
        depTime: oTime,
        arrTime: dTime,
        depMins: depMinutes,
        actualDepMins: depMinutes,
        delay: 0,
        isNextDayOvernight: false
      });
    }
  });

  // 計算每個候選車次的真實等待時間 (分鐘)
  candidates.forEach((t) => {
    const trainDateTime = new Date(`${t.TrainDate}T${t.depTime}`);
    if (t.delay > 0) {
      trainDateTime.setMinutes(trainDateTime.getMinutes() + t.delay);
    }
    const diffMs = trainDateTime.getTime() - twTime.getTime();
    t.waitMins = Math.floor(diffMs / 60000);
  });

  // 依照真實等待時間由近到遠排序
  candidates.sort((a, b) => a.waitMins - b.waitMins);

  let validTrains;
  if (!isTomorrow) {
    // 今日班次：過濾出未來車次
    validTrains = candidates.filter((train) => {
      const trainDateTime = new Date(`${train.TrainDate}T${train.DepartureTime}`);
      if (train.delay > 0) {
        trainDateTime.setMinutes(trainDateTime.getMinutes() + train.delay);
      }
      if (trainDateTime < twTime) return false;

      // 若為次日跨午夜延伸班次，排除過遠 (超過 16 小時 / 960 分鐘) 的班次，防止清晨時重複納入 24 小時後的班次
      if (train.isNextDayOvernight && train.waitMins > 960) {
        return false;
      }

      return true;
    });

    // 車次去重：同一個車次編號保留最接近的班次
    const seen = new Set();
    validTrains = validTrains.filter((train) => {
      if (seen.has(train.number)) return false;
      seen.add(train.number);
      return true;
    });
  } else {
    // 明日班次：全數顯示 (去重保證單一車次不重複)
    const seen = new Set();
    validTrains = candidates.filter((train) => {
      if (seen.has(train.number)) return false;
      seen.add(train.number);
      return true;
    });
  }

  // 車程合理性防呆 (排除異常假資料，行車時間需 <= 12小時)
  return validTrains.filter((t) => {
    const depM = timeToMinutes(t.depTime);
    const arrM = timeToMinutes(t.arrTime);
    let diff = arrM - depM;
    if (diff < 0) diff += 24 * 60;
    return diff <= 12 * 60;
  });
}

// Interface contract alias
export const filterSchedules = (trains, oIdx, dIdx, twTime, isToday = true) => {
  const dirInfo = { dir: "Northbound", oIdx, dIdx };
  return processTrainSchedules({
    data: { Northbound: { trains } },
    dirInfo,
    liveData: {},
    isTomorrow: !isToday,
    twTime
  });
};
