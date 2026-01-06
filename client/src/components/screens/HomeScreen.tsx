import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  ChevronRight,
  Zap,
  Trophy,
  Dumbbell
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { GAME_CONSTANTS } from "@shared/schema";
import { WeeklyEventModal, ActiveEffectsPanel } from "@/components/WeeklyEventModal";

interface HomeScreenProps {
  onNavigate: (tab: "bowl" | "career" | "shop" | "profile") => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { currentProfile, advanceWeek, updateStats, useEnergy, getActiveEventEffects, getCurrentPartner } = useGame();
  
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
  
  const quickTrainingOptions = [
    { stat: "accuracy" as const, label: "Accuracy", cost: 15, icon: Target },
    { stat: "consistency" as const, label: "Consistency", cost: 15, icon: TrendingUp },
    { stat: "throwPower" as const, label: "Power", cost: 20, icon: Dumbbell },
  ];
  
  const activeEventEffects = getActiveEventEffects();
  const partner = getCurrentPartner();

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
          {quickTrainingOptions.map((option) => {
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
      
      {(activeEventEffects.length > 0 || partner) && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {partner && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="text-purple-400">
                  Dating {partner.match.name}
                </Badge>
                <span className="text-muted-foreground">
                  {partner.relationshipLevel}% connection
                </span>
              </div>
            )}
            <ActiveEffectsPanel />
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
