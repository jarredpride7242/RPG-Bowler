import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Check } from "lucide-react";
import { useMonetization } from "@/monetization/useMonetization";

interface RemoveAdsBannerProps {
  onOpenStore: () => void;
}

export function RemoveAdsBanner({ onOpenStore }: RemoveAdsBannerProps) {
  const { state, productDetails, removeAdsSku } = useMonetization();
  const removeAdsInfo = productDetails[removeAdsSku as keyof typeof productDetails];

  if (state.hasRemoveAds) {
    return (
      <Card>
        <CardContent className="p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Ads Removed</span>
          </div>
          <Badge variant="secondary">Premium</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{removeAdsInfo.name}</p>
            <p className="text-xs text-muted-foreground">{removeAdsInfo.description}</p>
          </div>
        </div>
        <Button size="sm" onClick={onOpenStore} data-testid="button-open-store-from-banner">
          {removeAdsInfo.price}
        </Button>
      </CardContent>
    </Card>
  );
}
