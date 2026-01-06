import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useGame } from "@/lib/gameContext";
import { AVAILABLE_COACHES, type Coach } from "@shared/schema";
import { User, DollarSign, Target, Brain, Zap, Eye, Dumbbell, Check, X } from "lucide-react";

const coachIcons: Record<string, typeof User> = {
  power: Zap,
  accuracy: Target,
  spare: Check,
  mental: Brain,
  "lane-reading": Eye,
  conditioning: Dumbbell,
};

export function CoachesTab() {
  const { currentProfile, getActiveCoach, hireCoach, fireCoach, canHireCoach } = useGame();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  
  if (!currentProfile) return null;
  
  const activeCoach = getActiveCoach();
  
  const formatEffects = (coach: Coach) => {
    const effects: string[] = [];
    if (coach.effects.statBonus) {
      Object.entries(coach.effects.statBonus).forEach(([stat, value]) => {
        effects.push(`+${value} ${stat.replace(/([A-Z])/g, ' $1').trim()}`);
      });
    }
    if (coach.effects.trainingEnergyCostReduction) {
      effects.push(`-${coach.effects.trainingEnergyCostReduction} training energy cost`);
    }
    if (coach.effects.spareConversionBoost) {
      effects.push(`+${coach.effects.spareConversionBoost}% spare conversion`);
    }
    if (coach.effects.strikeBoost) {
      effects.push(`+${coach.effects.strikeBoost}% strike chance`);
    }
    if (coach.effects.mentalBoost) {
      effects.push(`+${coach.effects.mentalBoost}% mental focus`);
    }
    return effects;
  };
  
  const getUnlockStatus = (coach: Coach): { unlocked: boolean; reason?: string } => {
    const { reputation, bowlingAverage } = coach.unlockRequirement;
    if (reputation && currentProfile.stats.reputation < reputation) {
      return { unlocked: false, reason: `Requires ${reputation} reputation` };
    }
    if (bowlingAverage && currentProfile.bowlingAverage < bowlingAverage) {
      return { unlocked: false, reason: `Requires ${bowlingAverage} average` };
    }
    return { unlocked: true };
  };
  
  const handleHire = (coach: Coach) => {
    hireCoach(coach.id);
    setSelectedCoach(null);
  };
  
  return (
    <div className="space-y-4">
      {activeCoach && (
        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Current Coach</CardTitle>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                {(() => {
                  const Icon = coachIcons[activeCoach.type] || User;
                  return <Icon className="h-8 w-8 text-primary" />;
                })()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" data-testid="text-active-coach-name">{activeCoach.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{activeCoach.type.replace("-", " ")} Coach</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {formatEffects(activeCoach).map((effect, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{effect}</Badge>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />${activeCoach.weeklyCost}/week
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full mt-3" data-testid="button-fire-coach">
                  Fire Coach
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fire {activeCoach.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will lose all coach bonuses immediately. You can hire a new coach at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => fireCoach()} data-testid="button-confirm-fire">
                    Fire Coach
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-3">
        <h3 className="font-semibold text-lg">Available Coaches</h3>
        {AVAILABLE_COACHES.map(coach => {
          const Icon = coachIcons[coach.type] || User;
          const status = getUnlockStatus(coach);
          const isActive = activeCoach?.id === coach.id;
          const canAfford = currentProfile.money >= coach.weeklyCost;
          
          return (
            <Card 
              key={coach.id} 
              className={`${!status.unlocked ? "opacity-60" : ""} ${isActive ? "border-primary/50" : ""}`}
              data-testid={`card-coach-${coach.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md ${status.unlocked ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`h-6 w-6 ${status.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="font-medium">{coach.name}</h4>
                      <span className="text-sm text-muted-foreground">${coach.weeklyCost}/week</span>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{coach.type.replace("-", " ")} Specialist</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formatEffects(coach).map((effect, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{effect}</Badge>
                      ))}
                    </div>
                    {!status.unlocked && (
                      <p className="mt-2 text-xs text-destructive">{status.reason}</p>
                    )}
                  </div>
                </div>
                {status.unlocked && !isActive && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="w-full mt-3" 
                        disabled={!canAfford || !!activeCoach}
                        data-testid={`button-hire-${coach.id}`}
                      >
                        {activeCoach ? "Fire current coach first" : canAfford ? "Hire Coach" : "Cannot Afford"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hire {coach.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be charged ${coach.weeklyCost} per week. Benefits start immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleHire(coach)} data-testid="button-confirm-hire">
                          Hire Coach
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
