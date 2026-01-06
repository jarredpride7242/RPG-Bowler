import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layers,
  Lightbulb,
  Armchair,
  Image,
  Grid3X3,
  Sparkles,
  Lock,
  Check,
  DollarSign,
  Star,
  Trophy,
  Crown,
  Edit2,
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { 
  ALLEY_ENVIRONMENT_ITEMS, 
  type AlleyEnvironmentItem,
  type AlleyEnvironment 
} from "@shared/schema";

const CATEGORY_ICONS: Record<string, typeof Layers> = {
  lane: Layers,
  lighting: Lightbulb,
  seating: Armchair,
  decoration: Image,
  floor: Grid3X3,
  ambient: Sparkles,
};

const CATEGORY_LABELS: Record<string, string> = {
  lane: "Lanes",
  lighting: "Lighting",
  seating: "Seating",
  decoration: "Decor",
  floor: "Floor",
  ambient: "Effects",
};

const RARITY_COLORS: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-green-500/20 text-green-400 dark:text-green-300",
  rare: "bg-blue-500/20 text-blue-400 dark:text-blue-300",
  legendary: "bg-amber-500/20 text-amber-400 dark:text-amber-300",
};

function getDefaultAlleyEnvironment(): AlleyEnvironment {
  return {
    laneStyle: "lane-classic-wood",
    lightingStyle: "light-standard",
    seatingStyle: "seat-basic-bench",
    decoration: "deco-none",
    floorStyle: "floor-carpet-standard",
    ambientEffect: "ambient-none",
    unlockedItems: [
      "lane-classic-wood",
      "light-standard",
      "seat-basic-bench",
      "deco-none",
      "floor-carpet-standard",
      "ambient-none",
    ],
    alleyName: "My Bowling Alley",
  };
}

export function AlleyTab() {
  const { currentProfile, updateProfile, getLegacyData } = useGame();
  const [activeCategory, setActiveCategory] = useState("lane");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  
  if (!currentProfile) return null;
  
  const alleyEnv = currentProfile.alleyEnvironment ?? getDefaultAlleyEnvironment();
  const legacyData = getLegacyData();
  const legacyPoints = legacyData?.legacyPoints ?? 0;
  
  const getCategoryEquipped = (category: string): string => {
    switch (category) {
      case "lane": return alleyEnv.laneStyle;
      case "lighting": return alleyEnv.lightingStyle;
      case "seating": return alleyEnv.seatingStyle;
      case "decoration": return alleyEnv.decoration;
      case "floor": return alleyEnv.floorStyle;
      case "ambient": return alleyEnv.ambientEffect;
      default: return "";
    }
  };
  
  const isItemUnlocked = (item: AlleyEnvironmentItem): boolean => {
    if (item.unlockMethod === "default") return true;
    if (alleyEnv.unlockedItems.includes(item.id)) return true;
    
    if (item.unlockMethod === "reputation") {
      return currentProfile.stats.reputation >= (item.unlockRequirement.reputationRequired ?? 0);
    }
    if (item.unlockMethod === "pro-status") {
      return currentProfile.isProfessional;
    }
    if (item.unlockMethod === "achievement") {
      return currentProfile.achievements.includes(item.unlockRequirement.achievementId ?? "");
    }
    
    return false;
  };
  
  const canPurchaseItem = (item: AlleyEnvironmentItem): boolean => {
    if (isItemUnlocked(item)) return false;
    
    if (item.unlockMethod === "purchase") {
      return currentProfile.money >= (item.unlockRequirement.price ?? 0);
    }
    if (item.unlockMethod === "legacy") {
      return legacyPoints >= (item.unlockRequirement.legacyPointsCost ?? 0);
    }
    
    return false;
  };
  
  const getUnlockStatusText = (item: AlleyEnvironmentItem): string => {
    if (isItemUnlocked(item)) return "Unlocked";
    
    switch (item.unlockMethod) {
      case "purchase":
        return `$${(item.unlockRequirement.price ?? 0).toLocaleString()}`;
      case "reputation":
        return `${item.unlockRequirement.reputationRequired} Rep`;
      case "achievement":
        return "Achievement";
      case "legacy":
        return `${item.unlockRequirement.legacyPointsCost} LP`;
      case "pro-status":
        return "Pro Only";
      default:
        return "";
    }
  };
  
  const handlePurchase = (item: AlleyEnvironmentItem) => {
    if (!canPurchaseItem(item)) return;
    
    const newUnlockedItems = [...alleyEnv.unlockedItems, item.id];
    let newMoney = currentProfile.money;
    
    if (item.unlockMethod === "purchase") {
      newMoney = currentProfile.money - (item.unlockRequirement.price ?? 0);
    }
    
    updateProfile({
      money: newMoney,
      alleyEnvironment: {
        ...alleyEnv,
        unlockedItems: newUnlockedItems,
      },
    });
  };
  
  const handleEquip = (item: AlleyEnvironmentItem) => {
    if (!isItemUnlocked(item)) return;
    
    const newEnv = { ...alleyEnv };
    
    switch (item.category) {
      case "lane":
        newEnv.laneStyle = item.id;
        break;
      case "lighting":
        newEnv.lightingStyle = item.id;
        break;
      case "seating":
        newEnv.seatingStyle = item.id;
        break;
      case "decoration":
        newEnv.decoration = item.id;
        break;
      case "floor":
        newEnv.floorStyle = item.id;
        break;
      case "ambient":
        newEnv.ambientEffect = item.id;
        break;
    }
    
    updateProfile({
      alleyEnvironment: newEnv,
    });
  };
  
  const handleSaveName = () => {
    if (tempName.trim()) {
      updateProfile({
        alleyEnvironment: {
          ...alleyEnv,
          alleyName: tempName.trim(),
        },
      });
    }
    setIsEditingName(false);
  };
  
  const categoryItems = ALLEY_ENVIRONMENT_ITEMS.filter(
    (item) => item.category === activeCategory
  );
  
  const equippedId = getCategoryEquipped(activeCategory);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Your Bowling Alley
            </div>
            <Badge variant="secondary" className="text-xs">
              {alleyEnv.unlockedItems.length} / {ALLEY_ENVIRONMENT_ITEMS.length} Items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter alley name"
                  className="flex-1"
                  maxLength={30}
                  data-testid="input-alley-name"
                />
                <Button size="sm" onClick={handleSaveName} data-testid="button-save-alley-name">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg font-semibold" data-testid="text-alley-name">
                  {alleyEnv.alleyName}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setTempName(alleyEnv.alleyName);
                    setIsEditingName(true);
                  }}
                  data-testid="button-edit-alley-name"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted rounded-md">
              <p className="text-muted-foreground">Lane</p>
              <p className="font-medium truncate">
                {ALLEY_ENVIRONMENT_ITEMS.find(i => i.id === alleyEnv.laneStyle)?.name ?? "Classic Wood"}
              </p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <p className="text-muted-foreground">Lighting</p>
              <p className="font-medium truncate">
                {ALLEY_ENVIRONMENT_ITEMS.find(i => i.id === alleyEnv.lightingStyle)?.name ?? "Standard"}
              </p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <p className="text-muted-foreground">Seating</p>
              <p className="font-medium truncate">
                {ALLEY_ENVIRONMENT_ITEMS.find(i => i.id === alleyEnv.seatingStyle)?.name ?? "Basic Bench"}
              </p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <p className="text-muted-foreground">Floor</p>
              <p className="font-medium truncate">
                {ALLEY_ENVIRONMENT_ITEMS.find(i => i.id === alleyEnv.floorStyle)?.name ?? "Standard Carpet"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-1">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const Icon = CATEGORY_ICONS[key];
                const isActive = activeCategory === key;
                return (
                  <Button
                    key={key}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveCategory(key)}
                    className="shrink-0"
                    data-testid={`button-category-${key}`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {label}
                  </Button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          <div className="mt-4 space-y-2">
            {categoryItems.map((item) => {
              const isUnlocked = isItemUnlocked(item);
              const isEquipped = equippedId === item.id;
              const canBuy = canPurchaseItem(item);
              const Icon = CATEGORY_ICONS[item.category];
              
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-md border ${
                    isEquipped 
                      ? "border-primary bg-primary/10" 
                      : isUnlocked 
                        ? "border-border" 
                        : "border-border/50 opacity-75"
                  }`}
                  data-testid={`item-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                        isUnlocked ? "bg-muted" : "bg-muted/50"
                      }`}>
                        {isUnlocked ? (
                          <Icon className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{item.name}</p>
                          <Badge className={`text-xs ${RARITY_COLORS[item.rarity]}`}>
                            {item.rarity}
                          </Badge>
                          {isEquipped && (
                            <Badge variant="outline" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Equipped
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      {isUnlocked ? (
                        !isEquipped && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEquip(item)}
                            data-testid={`button-equip-${item.id}`}
                          >
                            Equip
                          </Button>
                        )
                      ) : canBuy ? (
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(item)}
                          data-testid={`button-buy-${item.id}`}
                        >
                          {item.unlockMethod === "purchase" ? (
                            <>
                              <DollarSign className="w-3 h-3 mr-1" />
                              {(item.unlockRequirement.price ?? 0).toLocaleString()}
                            </>
                          ) : (
                            <>
                              <Crown className="w-3 h-3 mr-1" />
                              {item.unlockRequirement.legacyPointsCost} LP
                            </>
                          )}
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {item.unlockMethod === "reputation" && <Star className="w-3 h-3 mr-1" />}
                          {item.unlockMethod === "achievement" && <Trophy className="w-3 h-3 mr-1" />}
                          {item.unlockMethod === "pro-status" && <Crown className="w-3 h-3 mr-1" />}
                          {item.unlockMethod === "legacy" && <Crown className="w-3 h-3 mr-1" />}
                          {getUnlockStatusText(item)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
