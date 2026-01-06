import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy,
  Award,
  Lock,
  BarChart3,
  Target,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Medal
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { ACHIEVEMENT_INFO, type AchievementId } from "@shared/schema";

type FilterType = "all" | "completed" | "in_progress";

export function AchievementsRecordsTab() {
  const { currentProfile } = useGame();
  const [filter, setFilter] = useState<FilterType>("all");
  
  if (!currentProfile) return null;
  
  const careerStats = currentProfile.careerStats ?? {
    highGame: 0,
    highSeries: 0,
    longestStrikeStreak: 0,
    totalStrikes: 0,
    totalSpares: 0,
    totalOpens: 0,
    totalSplits: 0,
    splitsConverted: 0,
    totalTurkeys: 0,
    totalDoubles: 0,
    perfectGames: 0,
    leagueWins: 0,
    tournamentWins: 0,
    bestTournamentFinish: 0,
    totalTitles: 0,
    totalEarnings: 0,
    rivalWins: 0,
    rivalLosses: 0,
    totalFrames: 0,
    strikeFrames: 0,
    spareFrames: 0,
  };
  
  const strikePercentage = careerStats.totalFrames > 0 
    ? Math.round((careerStats.strikeFrames / careerStats.totalFrames) * 100)
    : 0;
  const sparePercentage = careerStats.totalFrames > 0 
    ? Math.round((careerStats.spareFrames / careerStats.totalFrames) * 100)
    : 0;
  const splitConversion = careerStats.totalSplits > 0 
    ? Math.round((careerStats.splitsConverted / careerStats.totalSplits) * 100)
    : 0;
  
  const achievements = Object.entries(ACHIEVEMENT_INFO).map(([id, info]) => {
    const earnedData = currentProfile.earnedAchievements?.find(a => a.id === id);
    const earnedLegacy = currentProfile.achievements?.includes(id);
    const isCompleted = earnedData?.earnedAt !== undefined || earnedLegacy;
    const progress = earnedData?.progress ?? 0;
    const target = earnedData?.target ?? info.target ?? 1;
    
    return {
      id: id as AchievementId,
      ...info,
      isCompleted,
      progress,
      target,
      earnedAt: earnedData?.earnedAt,
    };
  });
  
  const filteredAchievements = achievements.filter(a => {
    if (filter === "all") return true;
    if (filter === "completed") return a.isCompleted;
    if (filter === "in_progress") return !a.isCompleted && (a.progress > 0 || a.target === 1);
    return true;
  });
  
  const completedCount = achievements.filter(a => a.isCompleted).length;
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="achievements">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements" data-testid="tab-achievements">
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="records" data-testid="tab-records">
            <BarChart3 className="w-4 h-4 mr-2" />
            Records
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Achievements
                </div>
                <Badge variant="secondary">
                  {completedCount}/{achievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={filter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("all")}
                  data-testid="filter-all"
                >
                  All
                </Button>
                <Button 
                  variant={filter === "completed" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("completed")}
                  data-testid="filter-completed"
                >
                  Completed
                </Button>
                <Button 
                  variant={filter === "in_progress" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("in_progress")}
                  data-testid="filter-in-progress"
                >
                  In Progress
                </Button>
              </div>
              
              <div className="space-y-2">
                {filteredAchievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`flex items-center gap-3 p-2 rounded-md ${
                      achievement.isCompleted 
                        ? "bg-primary/10 border border-primary/20" 
                        : "bg-muted/50"
                    }`}
                    data-testid={`achievement-${achievement.id}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.isCompleted 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}>
                      {achievement.isCompleted ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        achievement.isCompleted ? "" : "text-muted-foreground"
                      }`}>
                        {achievement.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {achievement.description}
                      </p>
                      {!achievement.isCompleted && achievement.target > 1 && (
                        <div className="mt-1">
                          <Progress value={(achievement.progress / achievement.target) * 100} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {achievement.progress}/{achievement.target}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredAchievements.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No achievements match this filter
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="records" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Medal className="w-4 h-4" />
                Game Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-2xl font-bold tabular-nums">{careerStats.highGame}</p>
                  <p className="text-xs text-muted-foreground">High Game</p>
                </div>
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-2xl font-bold tabular-nums">{careerStats.highSeries}</p>
                  <p className="text-xs text-muted-foreground">High Series</p>
                </div>
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-2xl font-bold tabular-nums">{careerStats.longestStrikeStreak}</p>
                  <p className="text-xs text-muted-foreground">Strike Streak</p>
                </div>
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-2xl font-bold tabular-nums">{careerStats.perfectGames}</p>
                  <p className="text-xs text-muted-foreground">Perfect Games</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Percentages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Strike %</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={strikePercentage} className="w-20 h-2" />
                  <span className="text-sm font-medium w-12 text-right">{strikePercentage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Spare %</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={sparePercentage} className="w-20 h-2" />
                  <span className="text-sm font-medium w-12 text-right">{sparePercentage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Split Conv. %</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={splitConversion} className="w-20 h-2" />
                  <span className="text-sm font-medium w-12 text-right">{splitConversion}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Competition Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">League Wins</span>
                <span className="text-sm font-medium">{careerStats.leagueWins}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Tournament Wins</span>
                <span className="text-sm font-medium">{careerStats.tournamentWins}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Best Tournament Finish</span>
                <span className="text-sm font-medium">
                  {careerStats.bestTournamentFinish > 0 ? `#${careerStats.bestTournamentFinish}` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Total Titles</span>
                <span className="text-sm font-medium">{careerStats.totalTitles}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Career Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Total Earnings</span>
                <span className="text-sm font-medium">${careerStats.totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Total Strikes</span>
                <span className="text-sm font-medium">{careerStats.totalStrikes}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Total Turkeys</span>
                <span className="text-sm font-medium">{careerStats.totalTurkeys}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">Total Doubles</span>
                <span className="text-sm font-medium">{careerStats.totalDoubles}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Rival Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{careerStats.rivalWins}</p>
                  <p className="text-xs text-muted-foreground">Wins</p>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">-</div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{careerStats.rivalLosses}</p>
                  <p className="text-xs text-muted-foreground">Losses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
