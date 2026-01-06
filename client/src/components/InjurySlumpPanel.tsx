import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/lib/gameContext";
import { RECOVERY_ACTIONS, type ActiveEffect, type RecoveryAction } from "@shared/schema";
import { AlertTriangle, Heart, Brain, Clock, DollarSign, Zap } from "lucide-react";

export function InjurySlumpPanel() {
  const { currentProfile, getActiveEffects, applyRecoveryAction } = useGame();
  
  if (!currentProfile) return null;
  
  const activeEffects = getActiveEffects();
  
  const handleRecovery = (actionId: string, effectId: string) => {
    applyRecoveryAction(actionId, effectId);
  };
  
  const canAfford = (action: RecoveryAction) => {
    return currentProfile.money >= action.moneyCost && currentProfile.energy >= action.energyCost;
  };
  
  if (activeEffects.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Heart className="h-12 w-12 mx-auto text-green-500 mb-3" />
          <h3 className="font-semibold text-lg">Healthy and Focused</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No injuries or slumps affecting your performance.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold text-lg">Active Effects</h3>
      </div>
      
      {activeEffects.map(effect => (
        <Card key={effect.id} className="border-yellow-500/30" data-testid={`card-effect-${effect.id}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {effect.type === "injury" ? (
                  <Heart className="h-4 w-4 text-red-500" />
                ) : (
                  <Brain className="h-4 w-4 text-purple-500" />
                )}
                <CardTitle className="text-base">{effect.name}</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {effect.weeksRemaining} week{effect.weeksRemaining !== 1 ? "s" : ""} left
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{effect.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {Object.entries(effect.statPenalties).map(([stat, value]) => (
                <Badge key={stat} variant="destructive" className="text-xs">
                  {value} {stat.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Recovery Options:</p>
              {RECOVERY_ACTIONS.filter(a => a.applicableTo.includes(effect.type)).map(action => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  disabled={!canAfford(action)}
                  onClick={() => handleRecovery(action.id, effect.id)}
                  data-testid={`button-recovery-${action.id}-${effect.id}`}
                >
                  <span>{action.name}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {action.moneyCost > 0 && (
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="h-3 w-3" />{action.moneyCost}
                      </span>
                    )}
                    {action.energyCost > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Zap className="h-3 w-3" />{action.energyCost}
                      </span>
                    )}
                    <span className="text-green-600">-{action.weeksReduction}w</span>
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            Injuries and slumps can occur when you push yourself too hard. Ending a week with very low energy increases the risk. Rest or seek treatment to recover faster.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
