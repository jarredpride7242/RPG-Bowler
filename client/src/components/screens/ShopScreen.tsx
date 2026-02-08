import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ShoppingBag,
  Check,
  Coins,
  CircleDot,
  Briefcase,
  Zap,
  Home,
  Heart,
  Sparkles,
  Battery,
  DollarSign,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Star
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { BowlingBall, Job, Property, PurchaseId, BallRarity } from "@shared/schema";
import { IAP_PRODUCTS, GAME_CONSTANTS } from "@shared/schema";
import { BallVisual } from "@/components/BallVisual";
import { BallDetailModal } from "@/components/BallDetailModal";
import { MonetizationModal } from "@/components/MonetizationModal";
import { RemoveAdsBanner } from "@/components/RemoveAdsBanner";
import { 
  generateShopInventory, 
  getFeaturedBalls, 
  getWeekSeed,
  sortBalls,
  filterBallsByType,
  filterBallsByRarity,
  type SortOption
} from "@/lib/ballGenerator";
import { DatingTab } from "@/components/DatingTab";

const RARITY_COLORS: Record<BallRarity, string> = {
  common: "bg-zinc-600 text-zinc-100",
  rare: "bg-blue-600 text-blue-100",
  epic: "bg-purple-600 text-purple-100",
  legendary: "bg-amber-500 text-amber-100",
};

const AVAILABLE_JOBS: Job[] = [
  {
    id: "dog-sitting",
    title: "Dog Sitting",
    weeklyPay: 330,
    energyCost: 13,
    contractWeeks: 4,
  },
  {
    id: "retail",
    title: "Retail Associate",
    weeklyPay: 450,
    energyCost: 20,
    contractWeeks: 8,
  },
  {
    id: "bowling-alley",
    title: "Bowling Alley Staff",
    weeklyPay: 400,
    energyCost: 15,
    contractWeeks: 12,
    requirements: { consistency: 40 },
  },
  {
    id: "pro-shop",
    title: "Pro Shop Assistant",
    weeklyPay: 550,
    energyCost: 18,
    contractWeeks: 16,
    requirements: { reputation: 20, charisma: 35 },
  },
  {
    id: "coaching",
    title: "Youth Bowling Coach",
    weeklyPay: 700,
    energyCost: 22,
    contractWeeks: 20,
    requirements: { reputation: 40, charisma: 45, consistency: 55 },
  },
];

const AVAILABLE_PROPERTIES: Property[] = [
  {
    id: "basic-apt",
    name: "Studio Apartment",
    type: "rent",
    monthlyCost: 800,
    energyBonus: 5,
    trainingBonus: 0,
  },
  {
    id: "one-bed",
    name: "1-Bedroom Apartment",
    type: "rent",
    monthlyCost: 1200,
    energyBonus: 10,
    trainingBonus: 5,
  },
  {
    id: "two-bed",
    name: "2-Bedroom Condo",
    type: "rent",
    monthlyCost: 1800,
    energyBonus: 15,
    trainingBonus: 10,
  },
  {
    id: "house",
    name: "Suburban House",
    type: "own",
    monthlyCost: 2500,
    energyBonus: 20,
    trainingBonus: 15,
  },
];


export function ShopScreen() {
  const { 
    currentProfile, 
    addBowlingBall, 
    setActiveBall, 
    spendMoney, 
    useEnergy, 
    setCurrentJob, 
    updateProfile,
    makePurchase,
    hasPurchased,
    restorePurchases,
    getMaxEnergy
  } = useGame();
  const [selectedBall, setSelectedBall] = useState<BowlingBall | null>(null);
  const [detailBall, setDetailBall] = useState<BowlingBall | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseId | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("price-low");
  const [showMonetization, setShowMonetization] = useState(false);
  
  if (!currentProfile) return null;
  
  const ownedBallIds = currentProfile.ownedBalls.map(b => b.id);
  
  const weekSeed = getWeekSeed(currentProfile.currentWeek);
  
  const shopBalls = useMemo(() => {
    const allBalls = generateShopInventory(weekSeed, 45);
    let filtered = filterBallsByType(allBalls, typeFilter);
    filtered = filterBallsByRarity(filtered, rarityFilter);
    return sortBalls(filtered, sortOption);
  }, [weekSeed, typeFilter, rarityFilter, sortOption]);
  
  const featuredBalls = useMemo(() => getFeaturedBalls(weekSeed), [weekSeed]);
  
  const activeBall = currentProfile.ownedBalls.find(b => b.id === currentProfile.activeBallId) || null;
  
  const handleBuyBall = () => {
    if (!selectedBall) return;
    if (!spendMoney(selectedBall.price)) return;
    addBowlingBall(selectedBall);
    setSelectedBall(null);
  };
  
  const meetsJobRequirements = (job: Job) => {
    if (!job.requirements) return true;
    const { reputation, charisma, consistency } = job.requirements;
    if (reputation && currentProfile.stats.reputation < reputation) return false;
    if (charisma && currentProfile.stats.charisma < charisma) return false;
    if (consistency && currentProfile.stats.consistency < consistency) return false;
    return true;
  };
  
  const handleApplyJob = () => {
    if (!selectedJob) return;
    if (!useEnergy(5)) return;
    setCurrentJob({ ...selectedJob, weeksRemaining: selectedJob.contractWeeks });
    setSelectedJob(null);
  };
  
  const handleRentProperty = () => {
    if (!selectedProperty) return;
    if (!spendMoney(selectedProperty.monthlyCost)) return;
    updateProfile({ currentProperty: selectedProperty });
    setSelectedProperty(null);
  };
  
    
  const renderStatBar = (label: string, value: number) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <Progress value={value * 10} className="h-1.5 flex-1" />
      <span className="text-xs font-medium w-4 text-right">{value}</span>
    </div>
  );
  
  const getBallTypeColor = (type: BowlingBall["type"]) => {
    switch (type) {
      case "plastic": return "bg-slate-500";
      case "urethane": return "bg-amber-500";
      case "reactive-solid": return "bg-red-500";
      case "reactive-pearl": return "bg-blue-500";
      case "reactive-hybrid": return "bg-purple-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Shop</h1>
        <Badge variant="outline" className="flex items-center gap-1">
          <Coins className="w-3.5 h-3.5" />
          ${currentProfile.money.toLocaleString()}
        </Badge>
      </div>
      
      <Tabs defaultValue="balls" className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="balls" className="text-xs px-1">
            <CircleDot className="w-3.5 h-3.5 mr-0.5" />
            Balls
          </TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs px-1">
            <Briefcase className="w-3.5 h-3.5 mr-0.5" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="property" className="text-xs px-1">
            <Home className="w-3.5 h-3.5 mr-0.5" />
            Home
          </TabsTrigger>
          <TabsTrigger value="dating" className="text-xs px-1">
            <Heart className="w-3.5 h-3.5 mr-0.5" />
            Dating
          </TabsTrigger>
          <TabsTrigger value="premium" className="text-xs px-1">
            <Sparkles className="w-3.5 h-3.5 mr-0.5" />
            Store
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="balls" className="space-y-4 mt-4">
          {currentProfile.ownedBalls.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Your Balls ({currentProfile.ownedBalls.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentProfile.ownedBalls.map((ball) => (
                  <div 
                    key={ball.id}
                    className={`flex items-center justify-between p-3 rounded-md border hover-elevate cursor-pointer ${ball.id === currentProfile.activeBallId ? "border-primary bg-primary/5" : "border-border"}`}
                    onClick={() => setDetailBall(ball)}
                    data-testid={`owned-ball-${ball.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <BallVisual ball={ball} size="sm" showRarity={!!ball.rarity} />
                      <div>
                        <p className="font-medium text-sm">{ball.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {ball.type.replace("-", " ")} | {ball.coreType}
                        </p>
                      </div>
                    </div>
                    {ball.id === currentProfile.activeBallId ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setActiveBall(ball.id); }}
                        data-testid={`button-equip-${ball.id}`}
                      >
                        Equip
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {featuredBalls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-medium">Featured Balls</h2>
              </div>
              <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex gap-3">
                  {featuredBalls.map((ball) => {
                    const isOwned = ownedBallIds.includes(ball.id);
                    return (
                      <Card 
                        key={ball.id} 
                        className={`w-36 shrink-0 hover-elevate cursor-pointer ${isOwned ? "opacity-60" : ""}`}
                        onClick={() => setDetailBall(ball)}
                        data-testid={`featured-ball-${ball.id}`}
                      >
                        <CardContent className="p-3 flex flex-col items-center">
                          <BallVisual ball={ball} size="lg" />
                          <p className="font-medium text-xs mt-2 text-center truncate w-full">{ball.name}</p>
                          <Badge className={`mt-1 ${RARITY_COLORS[ball.rarity || "common"]}`} variant="secondary">
                            {(ball.rarity || "common").charAt(0).toUpperCase() + (ball.rarity || "common").slice(1)}
                          </Badge>
                          <p className="text-sm font-semibold text-primary mt-1">${ball.price}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">Pro Shop ({shopBalls.length})</h2>
              <span className="text-xs text-muted-foreground">Refreshes weekly</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 h-8 text-xs" data-testid="select-type-filter">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="plastic">Plastic</SelectItem>
                  <SelectItem value="urethane">Urethane</SelectItem>
                  <SelectItem value="reactive-solid">Reactive Solid</SelectItem>
                  <SelectItem value="reactive-pearl">Reactive Pearl</SelectItem>
                  <SelectItem value="reactive-hybrid">Reactive Hybrid</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={rarityFilter} onValueChange={setRarityFilter}>
                <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-rarity-filter">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <SelectTrigger className="w-32 h-8 text-xs" data-testid="select-sort">
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low</SelectItem>
                  <SelectItem value="price-high">Price: High</SelectItem>
                  <SelectItem value="hook-high">Hook: High</SelectItem>
                  <SelectItem value="hook-low">Hook: Low</SelectItem>
                  <SelectItem value="control-high">Control: High</SelectItem>
                  <SelectItem value="oil-high">Oil: High</SelectItem>
                  <SelectItem value="recommended">Recommended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {shopBalls.map((ball) => {
              const isOwned = ownedBallIds.includes(ball.id);
              const canAfford = currentProfile.money >= ball.price;
              
              return (
                <Card 
                  key={ball.id} 
                  className={`hover-elevate cursor-pointer ${isOwned ? "opacity-60" : ""}`}
                  onClick={() => setDetailBall(ball)}
                  data-testid={`shop-ball-${ball.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <BallVisual ball={ball} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{ball.name}</p>
                        <Badge className={`text-[10px] ${RARITY_COLORS[ball.rarity || "common"]}`} variant="secondary">
                          {(ball.rarity || "common").charAt(0).toUpperCase() + (ball.rarity || "common").slice(1)}
                        </Badge>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {ball.type.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-0.5">
                      {renderStatBar("Hook", ball.hookPotential)}
                      {renderStatBar("Oil", ball.oilHandling)}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      {isOwned ? (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Owned
                        </Badge>
                      ) : (
                        <>
                          <span className={`font-semibold text-sm ${canAfford ? "text-primary" : "text-muted-foreground"}`}>
                            ${ball.price}
                          </span>
                          <Button 
                            size="sm"
                            disabled={!canAfford}
                            onClick={(e) => { e.stopPropagation(); setSelectedBall(ball); }}
                            data-testid={`button-buy-${ball.id}`}
                          >
                            Buy
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {shopBalls.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No balls match your filters.</p>
              <Button variant="ghost" onClick={() => { setTypeFilter("all"); setRarityFilter("all"); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4 mt-4">
          {currentProfile.currentJob && (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Current Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentProfile.currentJob.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${currentProfile.currentJob.weeklyPay}/week • -{currentProfile.currentJob.energyCost} energy
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge>{currentProfile.currentJob.weeksRemaining} weeks left</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3 text-destructive"
                  onClick={() => setCurrentJob(null)}
                  data-testid="button-quit-job"
                >
                  Quit Job
                </Button>
              </CardContent>
            </Card>
          )}
          
          <h2 className="text-sm font-medium text-muted-foreground">Available Jobs</h2>
          {AVAILABLE_JOBS.map((job) => {
            const meetsReqs = meetsJobRequirements(job);
            const hasJob = currentProfile.currentJob !== null;
            
            return (
              <Card key={job.id} className={hasJob || !meetsReqs ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-chart-3 font-semibold">${job.weeklyPay}/week</p>
                      <p className="text-xs text-muted-foreground">
                        {job.contractWeeks} week contract
                      </p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      -{job.energyCost}/week
                    </Badge>
                  </div>
                  
                  {job.requirements && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.reputation && (
                          <Badge variant={currentProfile.stats.reputation >= job.requirements.reputation ? "secondary" : "outline"} className="text-xs">
                            Rep {job.requirements.reputation}+
                          </Badge>
                        )}
                        {job.requirements.charisma && (
                          <Badge variant={currentProfile.stats.charisma >= job.requirements.charisma ? "secondary" : "outline"} className="text-xs">
                            Cha {job.requirements.charisma}+
                          </Badge>
                        )}
                        {job.requirements.consistency && (
                          <Badge variant={currentProfile.stats.consistency >= job.requirements.consistency ? "secondary" : "outline"} className="text-xs">
                            Con {job.requirements.consistency}+
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-3"
                    disabled={hasJob || !meetsReqs}
                    onClick={() => setSelectedJob(job)}
                    data-testid={`button-apply-${job.id}`}
                  >
                    Apply (5 Energy)
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="property" className="space-y-4 mt-4">
          {currentProfile.currentProperty && (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Current Home
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{currentProfile.currentProperty.name}</p>
                <p className="text-sm text-muted-foreground">
                  +{currentProfile.currentProperty.energyBonus} energy recovery
                  {currentProfile.currentProperty.trainingBonus > 0 && ` • +${currentProfile.currentProperty.trainingBonus}% training`}
                </p>
              </CardContent>
            </Card>
          )}
          
          <h2 className="text-sm font-medium text-muted-foreground">Available Properties</h2>
          {AVAILABLE_PROPERTIES.map((property) => {
            const isCurrentHome = currentProfile.currentProperty?.id === property.id;
            const canAfford = currentProfile.money >= property.monthlyCost;
            
            return (
              <Card key={property.id} className={isCurrentHome ? "border-primary/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{property.name}</p>
                      <p className="text-sm text-chart-3 font-semibold">
                        ${property.monthlyCost}/month
                      </p>
                    </div>
                    <Badge variant={property.type === "own" ? "default" : "outline"} className="capitalize">
                      {property.type}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      +{property.energyBonus} energy
                    </span>
                    {property.trainingBonus > 0 && (
                      <span>+{property.trainingBonus}% training</span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full mt-3"
                    disabled={isCurrentHome || !canAfford}
                    variant={isCurrentHome ? "secondary" : "default"}
                    onClick={() => setSelectedProperty(property)}
                    data-testid={`button-rent-${property.id}`}
                  >
                    {isCurrentHome ? "Current Home" : `Move In`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="dating" className="space-y-4 mt-4">
          <DatingTab />
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-4 mt-4">
          <RemoveAdsBanner onOpenStore={() => setShowMonetization(true)} />
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowMonetization(true)}
            data-testid="button-open-rewards-store"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Rewards & Ad Store
          </Button>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Battery className="w-4 h-4" />
                Current Energy Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Base Max Energy</span>
                <span className="font-bold">{getMaxEnergy()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Energy refills each week. Purchase boosts below to permanently increase your capacity.
              </p>
            </CardContent>
          </Card>
          
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Energy Boosts (Permanent)
          </h2>
          
          {(["energy_boost_10", "energy_boost_20"] as PurchaseId[]).map((purchaseId) => {
            const product = IAP_PRODUCTS[purchaseId];
            const owned = hasPurchased(purchaseId);
            
            return (
              <Card key={purchaseId} className={owned ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">One-time permanent upgrade</Badge>
                      </div>
                    </div>
                    {owned ? (
                      <Badge variant="secondary">
                        <Check className="w-3 h-3 mr-1" />
                        Owned
                      </Badge>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => setSelectedPurchase(purchaseId)}
                        data-testid={`button-buy-${purchaseId}`}
                      >
                        {product.price}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-4">
            <DollarSign className="w-4 h-4" />
            Cash Packs (One-Time)
          </h2>
          
          {(["cash_pack_small", "cash_pack_medium", "cash_pack_large"] as PurchaseId[]).map((purchaseId) => {
            const product = IAP_PRODUCTS[purchaseId];
            
            return (
              <Card key={purchaseId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                        <Coins className="w-5 h-5 text-chart-3" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">One-time consumable</Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setSelectedPurchase(purchaseId)}
                      data-testid={`button-buy-${purchaseId}`}
                    >
                      {product.price}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={restorePurchases}
              data-testid="button-restore-purchases"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Restore Purchases
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              If you've made purchases on another device, tap to restore them.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={selectedBall !== null} onOpenChange={() => setSelectedBall(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purchase {selectedBall?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cost ${selectedBall?.price}. You currently have ${currentProfile.money}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBuyBall}>
              Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={selectedJob !== null} onOpenChange={() => setSelectedJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply for {selectedJob?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This {selectedJob?.contractWeeks}-week contract pays ${selectedJob?.weeklyPay}/week 
              but costs {selectedJob?.energyCost} energy per week.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyJob}>
              Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={selectedProperty !== null} onOpenChange={() => setSelectedProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to {selectedProperty?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cost ${selectedProperty?.monthlyCost} now for the first month.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRentProperty}>
              Move In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={selectedPurchase !== null} onOpenChange={() => setSelectedPurchase(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedPurchase ? IAP_PRODUCTS[selectedPurchase].name : ""}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>{selectedPurchase ? IAP_PRODUCTS[selectedPurchase].description : ""}</p>
                <p className="mt-2 font-medium">
                  Price: {selectedPurchase ? IAP_PRODUCTS[selectedPurchase].price : ""}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedPurchase && IAP_PRODUCTS[selectedPurchase].type === "permanent" 
                    ? "This is a one-time permanent upgrade that will persist across all sessions."
                    : "This is a one-time consumable purchase."}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (selectedPurchase) {
                makePurchase(selectedPurchase);
                setSelectedPurchase(null);
              }
            }}>
              Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BallDetailModal
        ball={detailBall}
        compareBall={activeBall}
        onClose={() => setDetailBall(null)}
        onBuy={() => {
          if (detailBall) {
            setSelectedBall(detailBall);
            setDetailBall(null);
          }
        }}
        isOwned={detailBall ? ownedBallIds.includes(detailBall.id) : false}
        canAfford={detailBall ? currentProfile.money >= detailBall.price : false}
      />
      
      <MonetizationModal
        open={showMonetization}
        onOpenChange={setShowMonetization}
      />
    </div>
  );
}
