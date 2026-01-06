import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGame } from "@/lib/gameContext";
import { AlertTriangle, Sparkles, DollarSign, Zap, TrendingUp, TrendingDown } from "lucide-react";

export function WeeklyEventModal() {
  const { getPendingEvent, resolveEvent, dismissEvent, currentProfile } = useGame();
  const event = getPendingEvent();
  
  if (!event || event.resolved) return null;
  
  const getCategoryIcon = () => {
    switch (event.category) {
      case "performance": return <TrendingUp className="w-5 h-5" />;
      case "money": return <DollarSign className="w-5 h-5" />;
      case "equipment": return <Sparkles className="w-5 h-5" />;
      case "bowling": return <Zap className="w-5 h-5" />;
      case "social": return <AlertTriangle className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };
  
  const getCategoryColor = () => {
    switch (event.category) {
      case "performance": return "bg-blue-500/20 text-blue-400";
      case "money": return "bg-green-500/20 text-green-400";
      case "equipment": return "bg-purple-500/20 text-purple-400";
      case "bowling": return "bg-orange-500/20 text-orange-400";
      case "social": return "bg-pink-500/20 text-pink-400";
      default: return "bg-muted text-muted-foreground";
    }
  };
  
  const handleChoice = (choiceId: string) => {
    resolveEvent(choiceId);
  };
  
  const canAffordChoice = (choice: typeof event.choices[0]) => {
    if (!currentProfile) return false;
    if (choice.cost?.money && currentProfile.money < choice.cost.money) return false;
    if (choice.cost?.energy && currentProfile.energy < choice.cost.energy) return false;
    return true;
  };
  
  return (
    <Dialog open={true} onOpenChange={() => dismissEvent()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getCategoryColor()}>
              {getCategoryIcon()}
              <span className="ml-1 capitalize">{event.category}</span>
            </Badge>
            {event.isMajorEvent && (
              <Badge variant="destructive">Major Event</Badge>
            )}
          </div>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription className="text-base">{event.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {event.choices.map((choice) => {
            const affordable = canAffordChoice(choice);
            
            return (
              <Card 
                key={choice.id} 
                className={`${affordable ? "hover-elevate cursor-pointer" : "opacity-50"}`}
                onClick={() => affordable && handleChoice(choice.id)}
                data-testid={`card-event-choice-${choice.id}`}
              >
                <CardContent className="p-4">
                  <p className="font-medium mb-2">{choice.label}</p>
                  
                  <div className="flex flex-wrap gap-2 text-sm">
                    {choice.cost?.money && (
                      <Badge variant="outline" className="text-destructive">
                        -${choice.cost.money}
                      </Badge>
                    )}
                    {choice.cost?.energy && (
                      <Badge variant="outline" className="text-destructive">
                        -{choice.cost.energy} Energy
                      </Badge>
                    )}
                    
                    {choice.outcome.money && choice.outcome.money > 0 && (
                      <Badge variant="outline" className="text-green-500">
                        +${choice.outcome.money}
                      </Badge>
                    )}
                    {choice.outcome.energy && choice.outcome.energy > 0 && (
                      <Badge variant="outline" className="text-blue-500">
                        +{choice.outcome.energy} Energy
                      </Badge>
                    )}
                    {choice.outcome.reputation && (
                      <Badge variant="outline" className={choice.outcome.reputation > 0 ? "text-purple-500" : "text-destructive"}>
                        {choice.outcome.reputation > 0 ? "+" : ""}{choice.outcome.reputation} Rep
                      </Badge>
                    )}
                    
                    {choice.outcome.statBonus && (
                      <Badge variant="outline" className="text-green-500">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{choice.outcome.statBonus.amount} {choice.outcome.statBonus.stat} ({choice.outcome.statBonus.weeks}w)
                      </Badge>
                    )}
                    {choice.outcome.statPenalty && (
                      <Badge variant="outline" className="text-destructive">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -{choice.outcome.statPenalty.amount} {choice.outcome.statPenalty.stat} ({choice.outcome.statPenalty.weeks}w)
                      </Badge>
                    )}
                  </div>
                  
                  {!affordable && (
                    <p className="text-sm text-destructive mt-2">Cannot afford this option</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-4">
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => dismissEvent()}
            data-testid="button-dismiss-event"
          >
            Ignore Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ActiveEffectsPanel() {
  const { getActiveEventEffects } = useGame();
  const effects = getActiveEventEffects();
  
  if (effects.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Active Effects</h4>
      <div className="flex flex-wrap gap-2">
        {effects.map((effect) => (
          <Badge 
            key={effect.id}
            variant={effect.effectType === "buff" ? "default" : "destructive"}
            className="text-xs"
          >
            {effect.effectType === "buff" ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {effect.description} ({effect.weeksRemaining}w)
          </Badge>
        ))}
      </div>
    </div>
  );
}
