import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useGame } from "@/lib/gameContext";
import { LEGACY_BONUSES, type HallOfFameEntry } from "@shared/schema";
import { Trophy, Star, Crown, Award, DollarSign, Zap, TrendingUp, Calendar, Check } from "lucide-react";

export function LegacyPanel() {
  const { currentProfile, getLegacyData, canRetire, retire, applyLegacyBonus } = useGame();
  const [retiredPoints, setRetiredPoints] = useState<number | null>(null);
  
  const legacyData = getLegacyData();
  const isEligibleToRetire = canRetire();
  
  const handleRetire = () => {
    const points = retire();
    setRetiredPoints(points);
  };
  
  const handleApplyBonus = (bonusId: string) => {
    applyLegacyBonus(bonusId);
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Legacy System</CardTitle>
          </div>
          <CardDescription>Build your bowling dynasty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Legacy Points</span>
            <span className="text-2xl font-bold text-amber-500" data-testid="text-legacy-points">
              {legacyData.legacyPoints}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {retiredPoints !== null && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-4 text-center">
            <Trophy className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-bold text-lg">Career Complete!</h3>
            <p className="text-muted-foreground mb-2">You earned {retiredPoints} legacy points</p>
            <p className="text-sm text-muted-foreground">Start a new career to use your legacy bonuses</p>
          </CardContent>
        </Card>
      )}
      
      {currentProfile && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Retire to add your bowler to the Hall of Fame and earn legacy points based on your achievements.
            </p>
            <div className="text-sm space-y-1 mb-4">
              <p className="text-muted-foreground">Requirements (meet any one):</p>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                <li className={currentProfile.currentSeason >= 10 ? "text-green-500" : ""}>
                  Season 10 or higher {currentProfile.currentSeason >= 10 && <Check className="h-3 w-3 inline" />}
                </li>
                <li className={(currentProfile.careerStats?.tournamentWins ?? 0) >= 1 ? "text-green-500" : ""}>
                  Win a tournament {(currentProfile.careerStats?.tournamentWins ?? 0) >= 1 && <Check className="h-3 w-3 inline" />}
                </li>
                <li className={(currentProfile.careerStats?.leagueWins ?? 0) >= 1 ? "text-green-500" : ""}>
                  Win a league {(currentProfile.careerStats?.leagueWins ?? 0) >= 1 && <Check className="h-3 w-3 inline" />}
                </li>
                <li className={currentProfile.stats.reputation >= 80 ? "text-green-500" : ""}>
                  80+ reputation {currentProfile.stats.reputation >= 80 && <Check className="h-3 w-3 inline" />}
                </li>
              </ul>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant={isEligibleToRetire ? "default" : "outline"} 
                  className="w-full"
                  disabled={!isEligibleToRetire}
                  data-testid="button-retire"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {isEligibleToRetire ? "Retire to Hall of Fame" : "Not Eligible Yet"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Retire {currentProfile.firstName} {currentProfile.lastName}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end your current career and add your bowler to the Hall of Fame. 
                    You'll earn legacy points based on your achievements that can be used in future careers.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRetire} data-testid="button-confirm-retire">
                    Retire
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
      
      {legacyData.legacyPoints > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Legacy Bonuses
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Spend legacy points to boost your next career
            </p>
            <div className="grid gap-2">
              {LEGACY_BONUSES.map(bonus => {
                const isOwned = legacyData.activeBonuses.includes(bonus.id);
                const canAfford = legacyData.legacyPoints >= bonus.cost;
                
                return (
                  <Card 
                    key={bonus.id} 
                    className={isOwned ? "border-green-500/50 bg-green-500/5" : ""}
                    data-testid={`card-bonus-${bonus.id}`}
                  >
                    <CardContent className="p-3 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{bonus.name}</h4>
                          {isOwned && <Badge variant="secondary" className="text-xs">Owned</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{bonus.description}</p>
                      </div>
                      {!isOwned && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={!canAfford}
                          onClick={() => handleApplyBonus(bonus.id)}
                          data-testid={`button-buy-bonus-${bonus.id}`}
                        >
                          {bonus.cost} pts
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
      
      {legacyData.hallOfFame.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Hall of Fame
            </h3>
            <div className="grid gap-2">
              {legacyData.hallOfFame.map((entry, index) => (
                <Card key={entry.id} data-testid={`card-hof-${index}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{entry.name}</h4>
                        <p className="text-xs text-muted-foreground">Retired {formatDate(entry.retiredAt)}</p>
                      </div>
                      <Badge variant="outline">{entry.seasons} seasons</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span>{entry.careerAverage} avg</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-muted-foreground" />
                        <span>{entry.totalTitles} titles</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span>${entry.totalEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-muted-foreground" />
                        <span>{entry.perfectGames} perfect</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
