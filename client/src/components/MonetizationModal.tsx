import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Coins,
  ShieldCheck,
  Gift,
  RefreshCw,
  Film,
  Loader2,
  Check,
} from "lucide-react";
import { useMonetization } from "@/monetization/useMonetization";
import { useGame } from "@/lib/gameContext";
import type { PlayerStats } from "@shared/schema";

interface MonetizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MonetizationModal({ open, onOpenChange }: MonetizationModalProps) {
  const {
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
    productDetails,
    removeAdsSku,
    supportPackSku,
    rewardedSkillPoints,
    rewardedCoins,
  } = useMonetization();

  const { addMoney, updateStats, currentProfile } = useGame();
  const [rewardType, setRewardType] = useState<"skillPoints" | "coins">("skillPoints");

  const handleWatchAd = async () => {
    if (rewardType === "skillPoints") {
      const result = await watchAdForSkillPoints();
      if (result.success && currentProfile) {
        const randomStat = getRandomTrainableStat();
        if (randomStat) {
          const currentVal = currentProfile.stats[randomStat] ?? 20;
          updateStats({ [randomStat]: currentVal + rewardedSkillPoints });
        }
      }
    } else {
      const result = await watchAdForCoins();
      if (result.success) {
        addMoney(rewardedCoins);
      }
    }
  };

  const handleBuySupportPack = async () => {
    const result = await buySupportPack();
    if (result.success) {
      addMoney(500);
    }
  };

  const removeAdsInfo = productDetails[removeAdsSku as keyof typeof productDetails];
  const supportInfo = productDetails[supportPackSku as keyof typeof productDetails];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Rewards & Store
          </AlertDialogTitle>
          <AlertDialogDescription>
            Earn rewards or support the game
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          {message && (
            <div className="bg-primary/10 text-sm p-2 rounded-md text-center" data-testid="text-monetization-message">
              {message}
            </div>
          )}

          <Card>
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Watch Ad for Reward</span>
                </div>
                <Badge variant="secondary">{remainingRewards} left today</Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={rewardType === "skillPoints" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRewardType("skillPoints")}
                  data-testid="button-reward-type-skill"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  +{rewardedSkillPoints} Skill
                </Button>
                <Button
                  variant={rewardType === "coins" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRewardType("coins")}
                  data-testid="button-reward-type-coins"
                >
                  <Coins className="w-3 h-3 mr-1" />
                  +{rewardedCoins} Coins
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleWatchAd}
                disabled={loading || !rewardCheck.ok}
                data-testid="button-watch-ad"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Film className="w-4 h-4 mr-2" />
                )}
                {rewardCheck.ok
                  ? `Watch Ad: +${rewardType === "skillPoints" ? `${rewardedSkillPoints} Skill Points` : `${rewardedCoins} Coins`}`
                  : rewardCheck.reason}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Premium</span>
              </div>

              <div className="space-y-2">
                <Button
                  variant={state.hasRemoveAds ? "secondary" : "default"}
                  className="w-full justify-between"
                  onClick={buyRemoveAds}
                  disabled={loading || state.hasRemoveAds}
                  data-testid="button-buy-remove-ads"
                >
                  <span className="flex items-center gap-2">
                    {state.hasRemoveAds ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    {state.hasRemoveAds ? "Ads Removed" : removeAdsInfo.name}
                  </span>
                  {!state.hasRemoveAds && (
                    <span className="text-xs opacity-80">{removeAdsInfo.price}</span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={handleBuySupportPack}
                  disabled={loading}
                  data-testid="button-buy-support-pack"
                >
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    {supportInfo.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{supportInfo.price}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={restore}
            disabled={loading}
            data-testid="button-restore-purchases"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Restore Purchases
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-close-monetization">Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getRandomTrainableStat(): keyof PlayerStats {
  const stats: (keyof PlayerStats)[] = [
    "throwPower",
    "accuracy",
    "hookControl",
    "spareShooting",
    "consistency",
    "mentalToughness",
    "stamina",
    "laneReading",
    "revRate",
    "speedControl",
    "equipmentKnowledge",
  ];
  return stats[Math.floor(Math.random() * stats.length)];
}
