import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Footprints,
  Hand,
  Shirt,
  Circle,
  Palette,
  Lock,
  Check,
  Sparkles,
  DollarSign,
  Star,
  Trophy,
  Crown
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { CosmeticItem, CosmeticCategory } from "@shared/schema";

const CATEGORY_ICONS: Record<CosmeticCategory, typeof Footprints> = {
  "shoes": Footprints,
  "gloves": Hand,
  "outfit": Shirt,
  "ball-skin": Circle,
  "ui-theme": Palette,
};

const CATEGORY_LABELS: Record<CosmeticCategory, string> = {
  "shoes": "Shoes",
  "gloves": "Gloves",
  "outfit": "Outfit",
  "ball-skin": "Ball Skin",
  "ui-theme": "UI Theme",
};

const RARITY_COLORS: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-green-500/20 text-green-400 border-green-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const UNLOCK_METHOD_ICONS: Record<string, typeof DollarSign> = {
  purchase: DollarSign,
  reputation: Star,
  achievement: Trophy,
  challenge: Sparkles,
  legacy: Crown,
};

export function CosmeticsTab() {
  const { 
    currentProfile,
    getAvailableCosmetics, 
    getUnlockedCosmetics, 
    getEquippedCosmetics,
    canUnlockCosmetic,
    unlockCosmetic,
    equipCosmetic
  } = useGame();
  
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>("shoes");
  
  if (!currentProfile) return null;
  
  const allCosmetics = getAvailableCosmetics();
  const unlocked = getUnlockedCosmetics();
  const equipped = getEquippedCosmetics();
  
  const categoryCosmetics = allCosmetics.filter(c => c.category === activeCategory);
  
  const getCategoryKey = (category: CosmeticCategory): keyof typeof equipped => {
    if (category === "ball-skin") return "ballSkin";
    if (category === "ui-theme") return "uiTheme";
    return category as keyof typeof equipped;
  };
  
  const isEquipped = (cosmeticId: string) => {
    const key = getCategoryKey(activeCategory);
    return equipped[key] === cosmeticId;
  };
  
  const isUnlocked = (cosmeticId: string) => unlocked.includes(cosmeticId);
  
  const getUnlockDescription = (cosmetic: CosmeticItem): string => {
    const { unlockMethod, unlockRequirement } = cosmetic;
    switch (unlockMethod) {
      case "purchase":
        return `$${unlockRequirement.price?.toLocaleString()}`;
      case "reputation":
        return `${unlockRequirement.reputationRequired} Rep`;
      case "achievement":
        return "Achievement";
      case "challenge":
        return "1 Token";
      case "legacy":
        return `${unlockRequirement.legacyPointsCost} LP`;
      default:
        return "";
    }
  };
  
  const handleUnlock = (cosmeticId: string) => {
    unlockCosmetic(cosmeticId);
  };
  
  const handleEquip = (cosmeticId: string | null) => {
    equipCosmetic(cosmeticId, activeCategory);
  };

  const equippedCount = Object.values(equipped).filter(Boolean).length;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Cosmetics
            </div>
            <Badge variant="secondary" className="text-xs">
              {unlocked.length} Unlocked
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {equippedCount > 0 ? (
              Object.entries(equipped).map(([key, id]) => {
                if (!id) return null;
                const cosmetic = allCosmetics.find(c => c.id === id);
                if (!cosmetic) return null;
                const Icon = CATEGORY_ICONS[cosmetic.category];
                return (
                  <Badge key={key} variant="outline" className="text-xs">
                    <Icon className="w-3 h-3 mr-1" />
                    {cosmetic.name}
                  </Badge>
                );
              })
            ) : (
              <span className="text-sm text-muted-foreground">No cosmetics equipped</span>
            )}
          </div>
          
          {(currentProfile.cosmeticTokens ?? 0) > 0 && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-primary/10 rounded-md">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {currentProfile.cosmeticTokens} Cosmetic Token{(currentProfile.cosmeticTokens ?? 0) > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as CosmeticCategory)}>
        <TabsList className="grid w-full grid-cols-5">
          {(Object.keys(CATEGORY_ICONS) as CosmeticCategory[]).map(category => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <TabsTrigger key={category} value={category} className="px-1">
                <Icon className="w-4 h-4" />
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {(Object.keys(CATEGORY_ICONS) as CosmeticCategory[]).map(category => (
          <TabsContent key={category} value={category} className="mt-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">{CATEGORY_LABELS[category]}</h3>
              {equipped[getCategoryKey(category)] && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEquip(null)}
                  data-testid={`button-unequip-${category}`}
                >
                  Unequip
                </Button>
              )}
            </div>
            
            {categoryCosmetics.map(cosmetic => {
              const isOwned = isUnlocked(cosmetic.id);
              const isWorn = isEquipped(cosmetic.id);
              const canUnlock = canUnlockCosmetic(cosmetic.id);
              const UnlockIcon = UNLOCK_METHOD_ICONS[cosmetic.unlockMethod];
              
              return (
                <Card 
                  key={cosmetic.id}
                  className={`${isWorn ? "border-primary" : ""}`}
                  data-testid={`cosmetic-${cosmetic.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center ${RARITY_COLORS[cosmetic.rarity]}`}>
                        {CATEGORY_ICONS[cosmetic.category] && (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{cosmetic.name}</span>
                          <Badge variant="outline" className={`text-xs capitalize ${RARITY_COLORS[cosmetic.rarity]}`}>
                            {cosmetic.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cosmetic.description}
                        </p>
                        
                        {!isOwned && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <UnlockIcon className="w-3 h-3" />
                            <span>{getUnlockDescription(cosmetic)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="shrink-0">
                        {isOwned ? (
                          isWorn ? (
                            <Badge variant="default" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Equipped
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEquip(cosmetic.id)}
                              data-testid={`button-equip-${cosmetic.id}`}
                            >
                              Equip
                            </Button>
                          )
                        ) : canUnlock ? (
                          <Button 
                            size="sm"
                            onClick={() => handleUnlock(cosmetic.id)}
                            data-testid={`button-unlock-${cosmetic.id}`}
                          >
                            Unlock
                          </Button>
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
