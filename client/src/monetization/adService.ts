import { Capacitor } from "@capacitor/core";
import { getAdUnitIds, ADMOB_CONFIG } from "./products";
import {
  canClaimReward,
  markRewardClaimed,
  getState,
} from "./monetizationStore";

let admobModule: any = null;
let initialized = false;

async function getAdMob() {
  if (admobModule) return admobModule;
  try {
    const mod = await import("@capacitor-community/admob");
    admobModule = mod.AdMob;
    return admobModule;
  } catch {
    return null;
  }
}

export async function initializeAds() {
  if (!Capacitor.isNativePlatform() || initialized) return;

  try {
    const AdMob = await getAdMob();
    if (!AdMob) return;

    await AdMob.initialize({
      initializeForTesting: ADMOB_CONFIG.useTestIds,
    });
    initialized = true;
  } catch (e) {
    console.warn("AdMob init failed:", e);
  }
}

export type RewardResult =
  | { success: true; type: "skillPoints" | "coins" }
  | { success: false; reason: string };

export async function showRewardedForSkillPoints(): Promise<RewardResult> {
  return showRewardedAd("skillPoints");
}

export async function showRewardedForCoins(): Promise<RewardResult> {
  return showRewardedAd("coins");
}

async function showRewardedAd(
  type: "skillPoints" | "coins"
): Promise<RewardResult> {
  const check = canClaimReward();
  if (!check.ok) {
    return { success: false, reason: check.reason! };
  }

  if (!Capacitor.isNativePlatform()) {
    return { success: false, reason: "Ads only available on mobile" };
  }

  const AdMob = await getAdMob();
  if (!AdMob) {
    return { success: false, reason: "Ad service not available" };
  }

  const adUnitIds = getAdUnitIds();

  try {
    const options = {
      adId: adUnitIds.rewarded,
      isTesting: ADMOB_CONFIG.useTestIds,
    };

    await AdMob.prepareRewardVideoAd(options);

    const result = await new Promise<boolean>((resolve) => {
      let rewarded = false;

      const rewardListener = AdMob.addListener(
        "onRewardedVideoAdReward",
        () => {
          rewarded = true;
        }
      );

      const dismissListener = AdMob.addListener(
        "onRewardedVideoAdDismissed",
        () => {
          rewardListener.remove();
          dismissListener.remove();
          failListener.remove();
          resolve(rewarded);
        }
      );

      const failListener = AdMob.addListener(
        "onRewardedVideoAdFailedToShow",
        () => {
          rewardListener.remove();
          dismissListener.remove();
          failListener.remove();
          resolve(false);
        }
      );

      AdMob.showRewardVideoAd();
    });

    if (result) {
      markRewardClaimed();
      return { success: true, type };
    }

    return { success: false, reason: "Ad was closed before completion" };
  } catch (e) {
    console.warn("Rewarded ad error:", e);
    return { success: false, reason: "Failed to load ad. Try again later." };
  }
}

export async function showInterstitialBetweenSessions(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (getState().hasRemoveAds) return;

  const AdMob = await getAdMob();
  if (!AdMob) return;

  const adUnitIds = getAdUnitIds();

  try {
    await AdMob.prepareInterstitial({
      adId: adUnitIds.interstitial,
      isTesting: ADMOB_CONFIG.useTestIds,
    });
    await AdMob.showInterstitial();
  } catch (e) {
    console.warn("Interstitial ad error:", e);
  }
}
