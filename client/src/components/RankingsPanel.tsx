import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Trophy,
  Swords,
  Crown,
  Users,
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { RankingRegion, RankedBowler, Rival } from "@shared/schema";

const REGION_LABELS: Record<RankingRegion, string> = {
  local: "Local",
  regional: "Regional",
  state: "State",
  national: "National",
  "pro-tour": "Pro Tour",
};

function RankMovement({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current;
  if (diff > 0) {
    return (
      <span className="flex items-center gap-0.5 text-chart-3 text-xs">
        <TrendingUp className="w-3 h-3" />
        +{diff}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="flex items-center gap-0.5 text-destructive text-xs">
        <TrendingDown className="w-3 h-3" />
        {diff}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-muted-foreground text-xs">
      <Minus className="w-3 h-3" />
    </span>
  );
}

function RivalCard({ rival }: { rival: Rival }) {
  const totalMatches = rival.headToHead.wins + rival.headToHead.losses;
  return (
    <Card data-testid={`rival-card-${rival.id}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <Swords className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{rival.name}</p>
              <Badge variant="outline" className="text-xs shrink-0">{rival.archetype}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span>Avg: {rival.average}</span>
              <span>Rank: #{rival.rank}</span>
              {totalMatches > 0 && (
                <span>H2H: {rival.headToHead.wins}W-{rival.headToHead.losses}L</span>
              )}
            </div>
          </div>
          {rival.headToHead.lastResult !== "none" && (
            <Badge 
              variant={rival.headToHead.lastResult === "win" ? "default" : "secondary"} 
              className="text-xs shrink-0"
            >
              {rival.headToHead.lastResult === "win" ? "Won" : "Lost"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RankingsPanel() {
  const { currentProfile, getRankingsSnapshot } = useGame();
  const [activeRegion, setActiveRegion] = useState<string>("local");
  
  if (!currentProfile) return null;
  
  const snapshot = getRankingsSnapshot();
  if (!snapshot) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Rankings not yet available</p>
          <p className="text-sm">Play some games to see rankings</p>
        </CardContent>
      </Card>
    );
  }

  const availableRegions = snapshot.playerRankings.map(pr => pr.region);
  const currentRegionRanking = snapshot.playerRankings.find(pr => pr.region === activeRegion);
  const topBowlers = snapshot.topBowlers[activeRegion] || [];

  return (
    <div className="space-y-4" data-testid="rankings-panel">
      {currentRegionRanking && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your {REGION_LABELS[activeRegion as RankingRegion]} Rank</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold tabular-nums">#{currentRegionRanking.rank}</p>
                  <RankMovement current={currentRegionRanking.rank} previous={currentRegionRanking.previousRank} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Rating Points</p>
                <p className="text-xl font-bold tabular-nums">{currentRegionRanking.ratingPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeRegion} onValueChange={setActiveRegion}>
        <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${Math.min(availableRegions.length, 5)}, minmax(0, 1fr))` }}>
          {availableRegions.map(region => (
            <TabsTrigger key={region} value={region} className="text-xs" data-testid={`tab-rank-${region}`}>
              {REGION_LABELS[region as RankingRegion]}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableRegions.map(region => (
          <TabsContent key={region} value={region} className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Top {REGION_LABELS[region as RankingRegion]} Bowlers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {(snapshot.topBowlers[region] || []).map((bowler, i) => (
                    <div 
                      key={bowler.id} 
                      className={`flex items-center gap-3 py-2 px-2 rounded-md ${i < 3 ? "bg-muted/50" : ""}`}
                      data-testid={`leaderboard-entry-${bowler.id}`}
                    >
                      <span className={`w-6 text-center font-bold tabular-nums text-sm ${
                        i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"
                      }`}>
                        {bowler.rank}
                      </span>
                      <span className="flex-1 text-sm truncate">{bowler.name}</span>
                      <span className="text-sm font-medium tabular-nums">{bowler.average}</span>
                      <RankMovement current={bowler.rank} previous={bowler.previousRank} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {snapshot.rivals.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-destructive" />
            <p className="text-sm font-medium">Rivals</p>
          </div>
          {snapshot.rivals.map(rival => (
            <RivalCard key={rival.id} rival={rival} />
          ))}
        </div>
      )}
    </div>
  );
}