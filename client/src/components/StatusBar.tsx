import { Zap, Coins, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGame } from "@/lib/gameContext";
import { GAME_CONSTANTS } from "@shared/schema";

export function StatusBar() {
  const { currentProfile } = useGame();
  
  if (!currentProfile) return null;
  
  const energyPercent = (currentProfile.energy / GAME_CONSTANTS.MAX_ENERGY) * 100;
  
  return (
    <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-card-border px-4 py-2">
      <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Zap className="w-4 h-4 text-chart-3 shrink-0" />
            <div className="flex-1 min-w-[60px]">
              <Progress 
                value={energyPercent} 
                className="h-2 bg-muted"
              />
            </div>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {currentProfile.energy}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-chart-3 shrink-0" />
          <span className="text-sm font-semibold tabular-nums">
            ${currentProfile.money.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={currentProfile.isProfessional ? "default" : "secondary"}
            className="text-xs px-2"
          >
            {currentProfile.isProfessional ? "PRO" : "Amateur"}
          </Badge>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-3.5 h-3.5" />
            <span className="text-xs font-medium tabular-nums">
              {currentProfile.stats.reputation}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-1.5 max-w-2xl mx-auto">
        <span className="text-xs text-muted-foreground">
          Season {currentProfile.currentSeason}, Week {currentProfile.currentWeek}
        </span>
        <span className="text-xs font-medium">
          Avg: <span className="text-primary tabular-nums">{currentProfile.bowlingAverage || "—"}</span>
        </span>
      </div>
    </div>
  );
}
