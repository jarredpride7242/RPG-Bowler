import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BallVisual } from "./BallVisual";
import type { BowlingBall, BallRarity } from "@shared/schema";
import { DollarSign, Check, ArrowRight, ArrowLeft, Scale } from "lucide-react";

interface BallDetailModalProps {
  ball: BowlingBall | null;
  compareBall?: BowlingBall | null;
  onClose: () => void;
  onBuy?: () => void;
  isOwned?: boolean;
  canAfford?: boolean;
}

const RARITY_COLORS: Record<BallRarity, string> = {
  common: "bg-zinc-600 text-zinc-100",
  rare: "bg-blue-600 text-blue-100",
  epic: "bg-purple-600 text-purple-100",
  legendary: "bg-amber-500 text-amber-100",
};

const STAT_LABELS: Record<string, string> = {
  hookPotential: "Hook Potential",
  control: "Control",
  backendReaction: "Backend Reaction",
  oilHandling: "Oil Handling",
  forgiveness: "Forgiveness",
};

function StatBar({ 
  label, 
  value, 
  compareValue,
  maxValue = 10 
}: { 
  label: string; 
  value: number; 
  compareValue?: number;
  maxValue?: number;
}) {
  const diff = compareValue !== undefined ? value - compareValue : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          {compareValue !== undefined && diff !== 0 && (
            <span className={`text-xs ${diff > 0 ? "text-green-500" : "text-red-500"}`}>
              {diff > 0 ? "+" : ""}{diff}
            </span>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
          style={{ width: `${(value / maxValue) * 100}%` }}
        />
        {compareValue !== undefined && (
          <div
            className="absolute inset-y-0 left-0 border-r-2 border-yellow-400"
            style={{ width: `${(compareValue / maxValue) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}

function CompareView({ ball, compareBall }: { ball: BowlingBall; compareBall: BowlingBall }) {
  const stats = ["hookPotential", "control", "backendReaction", "oilHandling", "forgiveness"] as const;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <BallVisual ball={ball} size="lg" className="mx-auto mb-2" />
          <p className="font-medium text-sm">{ball.name}</p>
          <Badge className={RARITY_COLORS[ball.rarity || "common"]} variant="secondary">
            {(ball.rarity || "common").charAt(0).toUpperCase() + (ball.rarity || "common").slice(1)}
          </Badge>
        </div>
        <div className="text-center">
          <BallVisual ball={compareBall} size="lg" className="mx-auto mb-2" />
          <p className="font-medium text-sm">{compareBall.name}</p>
          <Badge variant="secondary">Current</Badge>
        </div>
      </div>
      
      <div className="space-y-3 pt-2 border-t border-border">
        {stats.map((stat) => {
          const newVal = ball[stat];
          const oldVal = compareBall[stat];
          const diff = newVal - oldVal;
          
          return (
            <div key={stat} className="grid grid-cols-5 gap-2 items-center text-xs">
              <span className="text-muted-foreground">{STAT_LABELS[stat]}</span>
              <div className="text-center font-medium">{oldVal}</div>
              <div className="text-center">
                {diff !== 0 && (
                  <span className={diff > 0 ? "text-green-500" : "text-red-500"}>
                    {diff > 0 ? <ArrowRight className="w-3 h-3 inline" /> : <ArrowLeft className="w-3 h-3 inline" />}
                    {Math.abs(diff)}
                  </span>
                )}
                {diff === 0 && <span className="text-muted-foreground">=</span>}
              </div>
              <div className="text-center font-medium">{newVal}</div>
              <div className="w-full">
                <Progress value={(newVal / 10) * 100} className="h-1.5" />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border text-xs">
        <div>
          <p className="text-muted-foreground">Price</p>
          <p className="font-medium">${ball.price}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Equipped Value</p>
          <p className="font-medium">${compareBall.price}</p>
        </div>
      </div>
    </div>
  );
}

export function BallDetailModal({ 
  ball, 
  compareBall, 
  onClose, 
  onBuy, 
  isOwned = false, 
  canAfford = true 
}: BallDetailModalProps) {
  if (!ball) return null;
  
  const stats = ["hookPotential", "control", "backendReaction", "oilHandling", "forgiveness"] as const;
  const rarity = ball.rarity || "common";
  
  return (
    <Dialog open={!!ball} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <BallVisual ball={ball} size="md" showRarity={false} />
            <div>
              <span>{ball.name}</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={RARITY_COLORS[rarity]} variant="secondary">
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </Badge>
                {ball.series && (
                  <span className="text-xs text-muted-foreground">{ball.series}</span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" data-testid="tab-ball-details">Details</TabsTrigger>
            <TabsTrigger 
              value="compare" 
              disabled={!compareBall}
              data-testid="tab-ball-compare"
            >
              <Scale className="w-3 h-3 mr-1" />
              Compare
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            {ball.tagline && (
              <p className="text-sm text-muted-foreground italic">"{ball.tagline}"</p>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Type</span>
                <p className="font-medium capitalize">{ball.type.replace("-", " ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Core</span>
                <p className="font-medium capitalize">{ball.coreType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">RG</span>
                <p className="font-medium">{ball.rg?.toFixed(3) || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Differential</span>
                <p className="font-medium">{ball.differential?.toFixed(3) || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Best For</span>
                <p className="font-medium capitalize">{ball.recommendedCondition || "Medium"} Oil</p>
              </div>
              <div>
                <span className="text-muted-foreground">Price</span>
                <p className="font-medium text-primary">${ball.price}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-border">
              <h4 className="text-sm font-medium">Performance Stats</h4>
              {stats.map((stat) => (
                <StatBar
                  key={stat}
                  label={STAT_LABELS[stat]}
                  value={ball[stat]}
                  compareValue={compareBall ? compareBall[stat] : undefined}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="compare" className="mt-4">
            {compareBall ? (
              <CompareView ball={ball} compareBall={compareBall} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No active ball equipped to compare with.</p>
                <p className="text-xs mt-1">Equip a ball from your inventory first.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
            Close
          </Button>
          {onBuy && !isOwned && (
            <Button 
              onClick={onBuy} 
              disabled={!canAfford}
              data-testid="button-buy-ball"
            >
              {canAfford ? (
                <>
                  <DollarSign className="w-4 h-4 mr-1" />
                  Buy for ${ball.price}
                </>
              ) : (
                "Can't Afford"
              )}
            </Button>
          )}
          {isOwned && (
            <Button disabled variant="secondary">
              <Check className="w-4 h-4 mr-1" />
              Owned
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
