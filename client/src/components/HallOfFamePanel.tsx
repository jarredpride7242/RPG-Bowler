import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Crown,
  Trophy,
  Star,
  DollarSign,
  Zap,
  Target,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Calendar
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { HallOfFameEntry } from "@shared/schema";

export function HallOfFamePanel() {
  const { getLegacyData } = useGame();
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);
  
  const legacyData = getLegacyData();
  const hallOfFame = legacyData.hallOfFame;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };
  
  if (hallOfFame.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Hall of Fame is Empty</h3>
          <p className="text-sm text-muted-foreground">
            Retire a successful career to enshrine your legacy here. 
            Earn legacy points to unlock permanent bonuses for future characters.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Hall of Fame
              </div>
              <Badge variant="secondary">
                {hallOfFame.length} Legend{hallOfFame.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hallOfFame.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-md hover-elevate cursor-pointer"
                onClick={() => setSelectedEntry(entry)}
                data-testid={`hof-entry-${entry.id}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.seasons} Season{entry.seasons !== 1 ? "s" : ""}</span>
                    <span>Avg: {entry.careerAverage}</span>
                    <span>{entry.totalTitles} Title{entry.totalTitles !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={selectedEntry !== null} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Career Summary
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold">{selectedEntry.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {selectedEntry.trait && (
                      <Badge variant="outline" className="capitalize">
                        {selectedEntry.trait.replace("-", " ")}
                      </Badge>
                    )}
                    {selectedEntry.bowlingStyle && (
                      <Badge variant="secondary" className="capitalize">
                        {selectedEntry.bowlingStyle}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Retired {formatDate(selectedEntry.retiredAt)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-muted rounded-md text-center">
                    <p className="text-lg font-bold">{selectedEntry.seasons}</p>
                    <p className="text-xs text-muted-foreground">Seasons</p>
                  </div>
                  <div className="p-2 bg-muted rounded-md text-center">
                    <p className="text-lg font-bold">{selectedEntry.careerAverage}</p>
                    <p className="text-xs text-muted-foreground">Career Avg</p>
                  </div>
                  <div className="p-2 bg-muted rounded-md text-center">
                    <p className="text-lg font-bold">{selectedEntry.totalGamesPlayed ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Games</p>
                  </div>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Titles & Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">High Game</span>
                      <span className="font-medium">{selectedEntry.highGame ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">High Series</span>
                      <span className="font-medium">{selectedEntry.highSeries ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strike Streak</span>
                      <span className="font-medium">{selectedEntry.longestStrikeStreak ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">League Wins</span>
                      <span className="font-medium">{selectedEntry.leagueWins ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tournament Wins</span>
                      <span className="font-medium">{selectedEntry.tournamentWins ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Perfect Games</span>
                      <span className="font-medium">{selectedEntry.perfectGames}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Percentages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strike %</span>
                      <span className="font-medium">{selectedEntry.strikePercentage ?? 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spare %</span>
                      <span className="font-medium">{selectedEntry.sparePercentage ?? 0}%</span>
                    </div>
                  </CardContent>
                </Card>
                
                {selectedEntry.rivalRecord && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Rival Record
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-500">
                            {selectedEntry.rivalRecord.wins}
                          </p>
                          <p className="text-xs text-muted-foreground">Wins</p>
                        </div>
                        <div className="text-xl font-bold text-muted-foreground">-</div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-red-500">
                            {selectedEntry.rivalRecord.losses}
                          </p>
                          <p className="text-xs text-muted-foreground">Losses</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Financials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-center">
                      ${selectedEntry.totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Career Earnings
                    </p>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-primary/10 rounded-md text-center">
                    <Award className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{selectedEntry.achievementsEarned ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Achievements</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-md text-center">
                    <Sparkles className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{selectedEntry.cosmeticsCollected ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Cosmetics</p>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-500/10 rounded-md text-center">
                  <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-lg font-bold">{selectedEntry.legacyPointsAwarded ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Legacy Points Earned</p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
