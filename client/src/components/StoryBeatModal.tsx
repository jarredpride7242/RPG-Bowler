import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { 
  BookOpen, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Trophy,
  Flame,
  ArrowUp,
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { StoryBeat, StoryBeatChoice } from "@shared/schema";

const BEAT_ICONS: Record<string, typeof BookOpen> = {
  "pre-season": Star,
  "mid-season": BookOpen,
  "post-season": Trophy,
  "tier-unlock": ArrowUp,
  "rival-encounter": Flame,
  "breakout": TrendingUp,
  "comeback": Flame,
  "headline-win": Trophy,
};

const BEAT_COLORS: Record<string, string> = {
  "pre-season": "text-blue-400",
  "mid-season": "text-amber-400",
  "post-season": "text-chart-3",
  "tier-unlock": "text-primary",
  "rival-encounter": "text-destructive",
  "breakout": "text-chart-3",
  "comeback": "text-orange-400",
  "headline-win": "text-amber-400",
};

function ChoiceEffectPreview({ choice }: { choice: StoryBeatChoice }) {
  const effects: string[] = [];
  if (choice.effect.energy) {
    effects.push(`${choice.effect.energy > 0 ? "+" : ""}${choice.effect.energy} Energy`);
  }
  if (choice.effect.money) {
    effects.push(`${choice.effect.money > 0 ? "+" : ""}$${choice.effect.money}`);
  }
  if (choice.effect.statBoost && choice.effect.statAmount) {
    effects.push(`+${choice.effect.statAmount} ${choice.effect.statBoost}`);
  }
  if (choice.effect.sponsorRep) {
    effects.push(`+${choice.effect.sponsorRep} Sponsor Rep`);
  }
  return (
    <span className="text-xs text-muted-foreground">
      {effects.join(" | ")}
    </span>
  );
}

export function StoryBeatModal() {
  const { getPendingStoryBeat, resolveStoryBeat, dismissStoryBeat } = useGame();
  
  const beat = getPendingStoryBeat();
  
  if (!beat || beat.resolved) return null;
  
  const Icon = BEAT_ICONS[beat.type] || BookOpen;
  const color = BEAT_COLORS[beat.type] || "text-primary";
  
  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            {beat.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{beat.description}</p>
            
            {beat.choices && beat.choices.length > 0 && (
              <div className="space-y-2 pt-2">
                {beat.choices.map(choice => (
                  <Button
                    key={choice.id}
                    variant="outline"
                    data-testid={`story-choice-${choice.id}`}
                    onClick={() => resolveStoryBeat(choice.id)}
                    className="w-full h-auto p-3 flex flex-col items-start text-left"
                  >
                    <p className="text-sm font-medium">{choice.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{choice.description}</p>
                    <div className="mt-1">
                      <ChoiceEffectPreview choice={choice} />
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {(!beat.choices || beat.choices.length === 0) && (
            <AlertDialogAction onClick={dismissStoryBeat} data-testid="button-dismiss-story">
              Continue
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}