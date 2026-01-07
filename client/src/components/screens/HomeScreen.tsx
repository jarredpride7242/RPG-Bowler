import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  ChevronRight,
  ChevronDown,
  Zap,
  Trophy,
  Dumbbell,
  Star,
  Building2,
  Crosshair,
  Gauge,
  RotateCw,
  Timer,
  Shield,
  Brain,
  Eye,
  Wrench,
  Battery,
  Smile,
  LucideIcon
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGame } from "@/lib/gameContext";
import { GAME_CONSTANTS, BOWLING_ALLEY_CONSTANTS } from "@shared/schema";
import { WeeklyEventModal, ActiveEffectsPanel } from "@/components/WeeklyEventModal";

interface HomeScreenProps {
  onNavigate: (tab: "bowl" | "career" | "shop" | "profile") => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { currentProfile, advanceWeek, updateStats, useEnergy, getActiveEventEffects, getCurrentPartner, canPurchaseBowlingAlley, purchaseBowlingAlley, upgradeBowlingAlley } = useGame();
  
  if (!currentProfile) return null;
  
  const recentGames = currentProfile.recentGameScores.slice(-5);
  const avgTrend = recentGames.length >= 2 
    ? recentGames[recentGames.length - 1] - recentGames[recentGames.length - 2]
    : 0;
  
  const handleTrain = (stat: keyof typeof currentProfile.stats, energyCost: number) => {
    if (!useEnergy(energyCost)) return;
    
    const currentValue = currentProfile.stats[stat];
    const gain = Math.max(1, Math.floor((100 - currentValue) / 20));
    updateStats({ [stat]: currentValue + gain });
  };
  
  const [showAllTraining, setShowAllTraining] = useState(false);
  
  const allTrainingOptions: { stat: keyof typeof currentProfile.stats; label: string; cost: number; icon: LucideIcon }[] = [
    { stat: "throwPower", label: "Power", cost: 15, icon: Dumbbell },
    { stat: "accuracy", label: "Accuracy", cost: 15, icon: Target },
    { stat: "hookControl", label: "Hook Control", cost: 15, icon: RotateCw },
    { stat: "revRate", label: "Rev Rate", cost: 15, icon: Gauge },
    { stat: "speedControl", label: "Speed Control", cost: 15, icon: Timer },
    { stat: "consistency", label: "Consistency", cost: 15, icon: TrendingUp },
    { stat: "spareShooting", label: "Spare Shooting", cost: 15, icon: Crosshair },
    { stat: "mentalToughness", label: "Mental Toughness", cost: 20, icon: Shield },
    { stat: "laneReading", label: "Lane Reading", cost: 20, icon: Eye },
    { stat: "equipmentKnowledge", label: "Equipment Knowledge", cost: 15, icon: Wrench },
    { stat: "stamina", label: "Stamina", cost: 20, icon: Battery },
    { stat: "charisma", label: "Charisma", cost: 10, icon: Smile },
  ];
  
  const primaryTrainingOptions = allTrainingOptions.slice(0, 4);
  const additionalTrainingOptions = allTrainingOptions.slice(4);
  
  const activeEventEffects = getActiveEventEffects();
  const partner = getCurrentPartner();
  
  const [showAlleyDialog, setShowAlleyDialog] = useState(false);
  const [alleyName, setAlleyName] = useState(`${currentProfile.lastName}'s Lanes`);
  
  const handlePurchaseAlley = () => {
    if (purchaseBowlingAlley(alleyName)) {
      setShowAlleyDialog(false);
    }
  };
  
  const handleUpgradeAlley = () => {
    upgradeBowlingAlley();
  };
  
  const ownedAlley = currentProfile.ownedBowlingAlley;
  const nextUpgradeCost = ownedAlley 
    ? BOWLING_ALLEY_CONSTANTS.UPGRADE_COSTS[ownedAlley.upgradeLevel + 1]
    : 0;
  const canUpgrade = ownedAlley && 
    ownedAlley.upgradeLevel < BOWLING_ALLEY_CONSTANTS.MAX_UPGRADE_LEVEL &&
    currentProfile.money >= nextUpgradeCost;

  return (
    <>
      <WeeklyEventModal />
    <div className="space-y-4 pb-24 px-4 pt-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-player-name">
            {currentProfile.firstName} {currentProfile.lastName}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">
            {currentProfile.bowlingStyle} | {currentProfile.handedness}
          </p>
        </div>
        <Button 
          onClick={advanceWeek}
          data-testid="button-advance-week"
        >
          Next Week
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Bowling Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-4xl font-bold tabular-nums" data-testid="text-average">
                {currentProfile.bowlingAverage || "—"}
              </span>
              {avgTrend !== 0 && (
                <span className={`ml-2 text-sm ${avgTrend > 0 ? "text-green-500" : "text-red-500"}`}>
                  {avgTrend > 0 ? "+" : ""}{avgTrend}
                </span>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{currentProfile.totalGamesPlayed} games played</p>
              <p>{currentProfile.recentGameScores.length} recent games tracked</p>
            </div>
          </div>
          
          {!currentProfile.isProfessional && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Pro Eligibility</span>
                <span className="text-sm font-medium">
                  {currentProfile.bowlingAverage >= GAME_CONSTANTS.PRO_AVERAGE_THRESHOLD ? "Eligible" : `Need ${GAME_CONSTANTS.PRO_AVERAGE_THRESHOLD} avg`}
                </span>
              </div>
              <Progress 
                value={Math.min(100, (currentProfile.bowlingAverage / GAME_CONSTANTS.PRO_AVERAGE_THRESHOLD) * 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.max(0, GAME_CONSTANTS.PRO_GAMES_REQUIRED - currentProfile.recentGameScores.length)} more games needed for eligibility
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Reputation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tabular-nums" data-testid="text-reputation">
              {currentProfile.stats.reputation}
            </span>
            <Progress 
              value={currentProfile.stats.reputation} 
              className="flex-1 h-2"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentProfile.stats.reputation < 30 && "Newcomer - Build your reputation through competitions"}
            {currentProfile.stats.reputation >= 30 && currentProfile.stats.reputation < 60 && "Rising Star - Gaining recognition in the bowling community"}
            {currentProfile.stats.reputation >= 60 && currentProfile.stats.reputation < 80 && "Established Pro - Well-known among bowling circles"}
            {currentProfile.stats.reputation >= 80 && "Bowling Legend - Your name is known everywhere"}
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="hover-elevate" onClick={() => onNavigate("bowl")}>
          <CardContent className="p-4 flex flex-col items-center text-center cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <span className="font-medium">Practice</span>
            <span className="text-xs text-muted-foreground">10 Energy</span>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate" onClick={() => onNavigate("career")}>
          <CardContent className="p-4 flex flex-col items-center text-center cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-chart-2" />
            </div>
            <span className="font-medium">Compete</span>
            <span className="text-xs text-muted-foreground">Leagues & Tournaments</span>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Quick Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {primaryTrainingOptions.map((option) => {
            const Icon = option.icon;
            const canTrain = currentProfile.energy >= option.cost;
            
            return (
              <Button
                key={option.stat}
                variant="outline"
                className="w-full justify-between"
                disabled={!canTrain}
                onClick={() => handleTrain(option.stat, option.cost)}
                data-testid={`button-train-${option.stat}`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {option.label}
                  <Badge variant="secondary" className="text-xs">
                    {currentProfile.stats[option.stat]}
                  </Badge>
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="w-3.5 h-3.5" />
                  {option.cost}
                </span>
              </Button>
            );
          })}
          
          <Collapsible open={showAllTraining} onOpenChange={setShowAllTraining}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-center gap-2" data-testid="button-show-more-training">
                {showAllTraining ? "Show Less" : "Show More Stats"}
                <ChevronDown className={`w-4 h-4 transition-transform ${showAllTraining ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {additionalTrainingOptions.map((option) => {
                const Icon = option.icon;
                const canTrain = currentProfile.energy >= option.cost;
                
                return (
                  <Button
                    key={option.stat}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={!canTrain}
                    onClick={() => handleTrain(option.stat, option.cost)}
                    data-testid={`button-train-${option.stat}`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {option.label}
                      <Badge variant="secondary" className="text-xs">
                        {currentProfile.stats[option.stat]}
                      </Badge>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="w-3.5 h-3.5" />
                      {option.cost}
                    </span>
                  </Button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      
      {currentProfile.currentJob && (
        <Card>
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
                  ${currentProfile.currentJob.weeklyPay}/week
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">
                  {currentProfile.currentJob.weeksRemaining} weeks left
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Season {currentProfile.currentSeason}, Week {currentProfile.currentWeek}
          </p>
          
          <div className="bg-muted/50 rounded-md p-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Next week preview:</p>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-chart-3" />
                Energy resets to
              </span>
              <span className="font-medium tabular-nums">
                {GAME_CONSTANTS.MAX_ENERGY + (currentProfile.currentProperty?.energyBonus ?? 0)}
                {currentProfile.currentJob && (
                  <span className="text-destructive ml-1">
                    -{currentProfile.currentJob.energyCost} (job)
                  </span>
                )}
              </span>
            </div>
            {currentProfile.currentJob && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Job pay
                </span>
                <span className="font-medium text-green-600 dark:text-green-400 tabular-nums">
                  +${currentProfile.currentJob.weeklyPay}
                </span>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-sm"
            onClick={() => onNavigate("career")}
          >
            Browse competitions
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardContent>
      </Card>
      
      {partner && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm" data-testid="status-relationship">
              <Badge variant="secondary" className="text-purple-400">
                Dating {partner.match.name}
              </Badge>
              <span className="text-muted-foreground">
                {partner.relationshipLevel}% connection
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeEventEffects.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <ActiveEffectsPanel />
          </CardContent>
        </Card>
      )}
      
      {currentProfile.isProfessional && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              Bowling Alley Ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ownedAlley ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" data-testid="text-alley-name">{ownedAlley.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Level {ownedAlley.upgradeLevel + 1}/{BOWLING_ALLEY_CONSTANTS.MAX_UPGRADE_LEVEL + 1}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-green-500">
                    +${ownedAlley.weeklyProfit.toLocaleString()}/week
                  </Badge>
                </div>
                
                <div className="bg-muted/50 rounded-md p-3 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Profit Earned</span>
                    <span className="font-medium text-green-500" data-testid="text-alley-profit">
                      ${ownedAlley.totalProfitEarned.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {ownedAlley.upgradeLevel < BOWLING_ALLEY_CONSTANTS.MAX_UPGRADE_LEVEL && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    disabled={!canUpgrade}
                    onClick={handleUpgradeAlley}
                    data-testid="button-upgrade-alley"
                  >
                    Upgrade (${nextUpgradeCost.toLocaleString()})
                    <span className="text-muted-foreground ml-2">
                      +${Math.floor(BOWLING_ALLEY_CONSTANTS.BASE_WEEKLY_PROFIT * (BOWLING_ALLEY_CONSTANTS.PROFIT_MULTIPLIERS[ownedAlley.upgradeLevel + 1] - BOWLING_ALLEY_CONSTANTS.PROFIT_MULTIPLIERS[ownedAlley.upgradeLevel])).toLocaleString()}/week
                    </span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  As a professional bowler, you can invest in your own bowling alley and earn passive income each week.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Purchase Cost</span>
                  <span className="font-bold">${BOWLING_ALLEY_CONSTANTS.PURCHASE_COST.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Starting Weekly Profit</span>
                  <span className="font-medium text-green-500">+${BOWLING_ALLEY_CONSTANTS.BASE_WEEKLY_PROFIT.toLocaleString()}/week</span>
                </div>
                <Button 
                  className="w-full"
                  disabled={!canPurchaseBowlingAlley()}
                  onClick={() => setShowAlleyDialog(true)}
                  data-testid="button-buy-alley"
                >
                  {currentProfile.money >= BOWLING_ALLEY_CONSTANTS.PURCHASE_COST 
                    ? "Purchase Bowling Alley" 
                    : `Need $${(BOWLING_ALLEY_CONSTANTS.PURCHASE_COST - currentProfile.money).toLocaleString()} more`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Dialog open={showAlleyDialog} onOpenChange={setShowAlleyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your Bowling Alley</DialogTitle>
            <DialogDescription>
              You're about to invest ${BOWLING_ALLEY_CONSTANTS.PURCHASE_COST.toLocaleString()} in your very own bowling alley. Choose a name for your establishment.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={alleyName}
            onChange={(e) => setAlleyName(e.target.value)}
            placeholder="Enter alley name"
            data-testid="input-alley-name"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAlleyDialog(false)} data-testid="button-cancel-purchase">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchaseAlley}
              disabled={!alleyName.trim()}
              data-testid="button-confirm-purchase"
            >
              Purchase for ${BOWLING_ALLEY_CONSTANTS.PURCHASE_COST.toLocaleString()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
