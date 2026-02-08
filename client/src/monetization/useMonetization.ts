import { useState, useEffect, useCallback } from "react";
import {
  getState,
  subscribe,
  canClaimReward,
  getRemainingRewards,
  type MonetizationState,
} from "./monetizationStore";
import {
  showRewardedForSkillPoints,
  showRewardedForCoins,
  initializeAds,
} from "./adService";
import {
  purchaseRemoveAds,
  purchaseSupportPack,
  restoreAllPurchases,
} from "./iapService";
import { REWARDED_SKILL_POINTS, REWARDED_COINS, PRODUCT_DETAILS, REMOVE_ADS_SKU, SUPPORT_PACK_SMALL_SKU } from "./products";

export function useMonetization() {
  const [state, setState] = useState<MonetizationState>(getState());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    initializeAds();
    const unsub = subscribe(() => setState({ ...getState() }));
    return unsub;
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const rewardCheck = canClaimReward();
  const remainingRewards = getRemainingRewards();

  const watchAdForSkillPoints = useCallback(async () => {
    setLoading(true);
    const result = await showRewardedForSkillPoints();
    setLoading(false);
    if (result.success) {
      setMessage(`+${REWARDED_SKILL_POINTS} skill points earned!`);
    } else {
      setMessage(result.reason);
    }
    return result;
  }, []);

  const watchAdForCoins = useCallback(async () => {
    setLoading(true);
    const result = await showRewardedForCoins();
    setLoading(false);
    if (result.success) {
      setMessage(`+${REWARDED_COINS} coins earned!`);
    } else {
      setMessage(result.reason);
    }
    return result;
  }, []);

  const buyRemoveAds = useCallback(async () => {
    setLoading(true);
    const result = await purchaseRemoveAds();
    setLoading(false);
    if (result.success) {
      setMessage("Ads removed successfully!");
    } else {
      setMessage(result.reason);
    }
    return result;
  }, []);

  const buySupportPack = useCallback(async () => {
    setLoading(true);
    const result = await purchaseSupportPack();
    setLoading(false);
    if (result.success) {
      setMessage("Support Pack purchased! +500 coins");
    } else {
      setMessage(result.reason);
    }
    return result;
  }, []);

  const restore = useCallback(async () => {
    setLoading(true);
    const result = await restoreAllPurchases();
    setLoading(false);
    setMessage(result.message);
    return result;
  }, []);

  return {
    state,
    loading,
    message,
    rewardCheck,
    remainingRewards,
    watchAdForSkillPoints,
    watchAdForCoins,
    buyRemoveAds,
    buySupportPack,
    restore,
    productDetails: PRODUCT_DETAILS,
    removeAdsSku: REMOVE_ADS_SKU,
    supportPackSku: SUPPORT_PACK_SMALL_SKU,
    rewardedSkillPoints: REWARDED_SKILL_POINTS,
    rewardedCoins: REWARDED_COINS,
  };
}
