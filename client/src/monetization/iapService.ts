import { Capacitor } from "@capacitor/core";
import {
  REMOVE_ADS_SKU,
  SUPPORT_PACK_SMALL_SKU,
  PRODUCT_DETAILS,
  ADMOB_CONFIG,
} from "./products";
import {
  setRemoveAdsOwned,
  setSupportPackPurchased,
  getState,
  loadFromStorage,
} from "./monetizationStore";

export type PurchaseResult =
  | { success: true; productId: string }
  | { success: false; reason: string };

let billingPlugin: any = null;
let billingReady = false;

async function getBillingPlugin() {
  if (billingPlugin) return billingPlugin;
  if (!Capacitor.isNativePlatform()) return null;

  const pluginNames = [
    "@capgo/capacitor-purchases",
    "cordova-plugin-purchase",
    "@nicolo-ribaudo/capacitor-purchases",
  ];

  for (const name of pluginNames) {
    try {
      const mod = await Function(`return import("${name}")`)();
      billingPlugin = mod.Purchases || mod.InAppPurchase2 || mod.default;
      if (billingPlugin) return billingPlugin;
    } catch {
      continue;
    }
  }

  try {
    const w = window as any;
    if (w.Capacitor?.Plugins?.Purchases) {
      billingPlugin = w.Capacitor.Plugins.Purchases;
      return billingPlugin;
    }
    if (w.store) {
      billingPlugin = w.store;
      return billingPlugin;
    }
  } catch {
    /* no global billing plugin */
  }

  return null;
}

export async function initializeBilling() {
  if (!Capacitor.isNativePlatform() || billingReady) return;

  try {
    const Purchases = await getBillingPlugin();
    if (!Purchases) {
      console.warn("Billing plugin not available, using localStorage fallback");
      return;
    }

    billingReady = true;
  } catch (e) {
    console.warn("Billing init failed:", e);
  }
}

export async function purchaseRemoveAds(): Promise<PurchaseResult> {
  if (!Capacitor.isNativePlatform()) {
    return simulatePurchase(REMOVE_ADS_SKU);
  }

  try {
    const result = await triggerNativePurchase(REMOVE_ADS_SKU);
    if (result.success) {
      setRemoveAdsOwned(true);
    }
    return result;
  } catch (e) {
    return { success: false, reason: "Purchase failed. Please try again." };
  }
}

export async function purchaseSupportPack(): Promise<PurchaseResult> {
  if (!Capacitor.isNativePlatform()) {
    return simulatePurchase(SUPPORT_PACK_SMALL_SKU);
  }

  try {
    const result = await triggerNativePurchase(SUPPORT_PACK_SMALL_SKU);
    if (result.success) {
      setSupportPackPurchased(true);
    }
    return result;
  } catch (e) {
    return { success: false, reason: "Purchase failed. Please try again." };
  }
}

export async function restoreAllPurchases(): Promise<{
  restored: string[];
  message: string;
}> {
  loadFromStorage();

  if (Capacitor.isNativePlatform()) {
    try {
      const nativeResult = await restoreFromPlayStore();
      if (nativeResult.restored.length > 0) {
        return nativeResult;
      }
    } catch (e) {
      console.warn("Native restore failed, falling back to local:", e);
    }
  }

  const state = getState();
  const restored: string[] = [];
  if (state.hasRemoveAds) restored.push(REMOVE_ADS_SKU);
  if (state.supportPackPurchased) restored.push(SUPPORT_PACK_SMALL_SKU);

  return {
    restored,
    message:
      restored.length > 0
        ? `Restored ${restored.length} purchase(s)`
        : "No purchases to restore",
  };
}

async function restoreFromPlayStore(): Promise<{
  restored: string[];
  message: string;
}> {
  const Purchases = await getBillingPlugin();
  if (!Purchases) {
    return { restored: [], message: "Billing service not available" };
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const restored: string[] = [];

    const activeEntitlements = customerInfo?.entitlements?.active || {};

    if (activeEntitlements["remove_ads"] || activeEntitlements[REMOVE_ADS_SKU]) {
      setRemoveAdsOwned(true);
      restored.push(REMOVE_ADS_SKU);
    }

    return {
      restored,
      message:
        restored.length > 0
          ? `Restored ${restored.length} purchase(s) from Play Store`
          : "No purchases found on Play Store",
    };
  } catch (e) {
    console.warn("Play Store restore error:", e);
    return { restored: [], message: "Could not connect to Play Store" };
  }
}

async function triggerNativePurchase(sku: string): Promise<PurchaseResult> {
  const Purchases = await getBillingPlugin();

  if (!Purchases) {
    return {
      success: false,
      reason: ADMOB_CONFIG.useTestIds
        ? "Billing plugin not installed. Build with Android Studio for full IAP support."
        : "Billing service unavailable. Please try again later.",
    };
  }

  try {
    const { products } = await Purchases.getProducts({
      productIdentifiers: [sku],
    });

    if (!products || products.length === 0) {
      return {
        success: false,
        reason: "Product not found in store. Please try again later.",
      };
    }

    const product = products[0];
    const { customerInfo } = await Purchases.purchaseProduct({
      productIdentifier: product.identifier,
    });

    if (customerInfo) {
      return { success: true, productId: sku };
    }

    return { success: false, reason: "Purchase was cancelled" };
  } catch (e: any) {
    if (e?.code === "1" || e?.userCancelled) {
      return { success: false, reason: "Purchase cancelled" };
    }
    console.warn("Native purchase error:", e);
    return {
      success: false,
      reason: "Purchase failed. Please check your payment method and try again.",
    };
  }
}

function simulatePurchase(sku: string): PurchaseResult {
  const product = PRODUCT_DETAILS[sku as keyof typeof PRODUCT_DETAILS];
  if (!product) {
    return { success: false, reason: "Unknown product" };
  }

  if (sku === REMOVE_ADS_SKU) {
    if (getState().hasRemoveAds) {
      return { success: false, reason: "You already own Remove Ads" };
    }
    setRemoveAdsOwned(true);
    return { success: true, productId: sku };
  }

  if (sku === SUPPORT_PACK_SMALL_SKU) {
    setSupportPackPurchased(true);
    return { success: true, productId: sku };
  }

  return { success: false, reason: "Unknown product" };
}

export function getProductInfo(sku: string) {
  return PRODUCT_DETAILS[sku as keyof typeof PRODUCT_DETAILS] ?? null;
}
