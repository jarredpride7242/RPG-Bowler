import {
  REWARDED_COOLDOWN_MINUTES,
  REWARDED_DAILY_CAP,
} from "./products";

const STORAGE_KEY = "strike-force-monetization";

export interface MonetizationState {
  hasRemoveAds: boolean;
  lastRewardAt: number;
  rewardCountToday: number;
  rewardDayStamp: string;
  supportPackPurchased: boolean;
}

function getDefaultState(): MonetizationState {
  return {
    hasRemoveAds: false,
    lastRewardAt: 0,
    rewardCountToday: 0,
    rewardDayStamp: "",
    supportPackPurchased: false,
  };
}

let state: MonetizationState = getDefaultState();
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((fn) => fn !== listener);
  };
}

export function getState(): MonetizationState {
  return state;
}

function getTodayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...getDefaultState(), ...parsed };
    }
  } catch {
    state = getDefaultState();
  }
}

export function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function canClaimReward(): { ok: boolean; reason?: string } {
  const now = Date.now();
  const today = getTodayStamp();

  if (state.rewardDayStamp !== today) {
    state.rewardCountToday = 0;
    state.rewardDayStamp = today;
  }

  if (state.rewardCountToday >= REWARDED_DAILY_CAP) {
    return { ok: false, reason: `Daily limit reached (${REWARDED_DAILY_CAP} per day)` };
  }

  const cooldownMs = REWARDED_COOLDOWN_MINUTES * 60 * 1000;
  const elapsed = now - state.lastRewardAt;
  if (elapsed < cooldownMs) {
    const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000);
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    return {
      ok: false,
      reason: `Cooldown: ${mins}m ${secs}s remaining`,
    };
  }

  return { ok: true };
}

export function markRewardClaimed() {
  const today = getTodayStamp();
  if (state.rewardDayStamp !== today) {
    state.rewardCountToday = 0;
    state.rewardDayStamp = today;
  }
  state.rewardCountToday++;
  state.lastRewardAt = Date.now();
  saveToStorage();
  notify();
}

export function setRemoveAdsOwned(owned: boolean) {
  state.hasRemoveAds = owned;
  saveToStorage();
  notify();
}

export function setSupportPackPurchased(purchased: boolean) {
  state.supportPackPurchased = purchased;
  saveToStorage();
  notify();
}

export function getRemainingRewards(): number {
  const today = getTodayStamp();
  if (state.rewardDayStamp !== today) {
    return REWARDED_DAILY_CAP;
  }
  return Math.max(0, REWARDED_DAILY_CAP - state.rewardCountToday);
}

export function restorePurchases() {
  loadFromStorage();
  notify();
}

loadFromStorage();
