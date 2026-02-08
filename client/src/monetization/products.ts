export const REMOVE_ADS_SKU = "remove_ads";
export const SUPPORT_PACK_SMALL_SKU = "support_pack_small";

export const REWARDED_SKILL_POINTS = 5;
export const REWARDED_COINS = 50;

export const REWARDED_COOLDOWN_MINUTES = 5;
export const REWARDED_DAILY_CAP = 10;

export const ADMOB_CONFIG = {
  testAppId: "ca-app-pub-3940256099942544~3347511713",
  rewardedTestAdUnitId: "ca-app-pub-3940256099942544/5224354917",
  interstitialTestAdUnitId: "ca-app-pub-3940256099942544/1033173712",

  productionAppId: "YOUR_ADMOB_APP_ID_HERE",
  rewardedProductionAdUnitId: "YOUR_REWARDED_AD_UNIT_ID_HERE",
  interstitialProductionAdUnitId: "YOUR_INTERSTITIAL_AD_UNIT_ID_HERE",

  useTestIds: true,
};

export function getAdUnitIds() {
  if (ADMOB_CONFIG.useTestIds) {
    return {
      rewarded: ADMOB_CONFIG.rewardedTestAdUnitId,
      interstitial: ADMOB_CONFIG.interstitialTestAdUnitId,
    };
  }
  return {
    rewarded: ADMOB_CONFIG.rewardedProductionAdUnitId,
    interstitial: ADMOB_CONFIG.interstitialProductionAdUnitId,
  };
}

export type ProductSku = typeof REMOVE_ADS_SKU | typeof SUPPORT_PACK_SMALL_SKU;

export const PRODUCT_DETAILS: Record<ProductSku, {
  name: string;
  description: string;
  price: string;
  type: "non-consumable" | "consumable";
  coinsGranted?: number;
}> = {
  [REMOVE_ADS_SKU]: {
    name: "Remove Ads",
    description: "Remove all non-rewarded ads permanently",
    price: "$4.99",
    type: "non-consumable" as const,
  },
  [SUPPORT_PACK_SMALL_SKU]: {
    name: "Support Pack",
    description: "Support the developer and get 500 coins",
    price: "$2.99",
    coinsGranted: 500,
    type: "consumable" as const,
  },
};
