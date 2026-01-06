import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Target,
  Zap,
  TrendingUp,
  Brain,
  Eye,
  Wrench,
  Heart,
  Sparkles,
  Star,
  Save
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { useTheme } from "@/lib/themeContext";
import { GAME_CONSTANTS, ACHIEVEMENT_INFO, type AchievementId } from "@shared/schema";
import { Trophy, Award, Lock } from "lucide-react";

const STAT_ICONS: Record<string, typeof Target> = {
  throwPower: Zap,
  accuracy: Target,
  hookControl: TrendingUp,
  revRate: TrendingUp,
  speedControl: Zap,
  consistency: Target,
  spareShooting: Target,
  mentalToughness: Brain,
  laneReading: Eye,
  equipmentKnowledge: Wrench,
  stamina: Heart,
  charisma: Sparkles,
  reputation: Star,
};

const STAT_LABELS: Record<string, string> = {
  throwPower: "Throw Power",
  accuracy: "Accuracy",
  hookControl: "Hook Control",
  revRate: "Rev Rate",
  speedControl: "Speed Control",
  consistency: "Consistency",
  spareShooting: "Spare Shooting",
  mentalToughness: "Mental Toughness",
  laneReading: "Lane Reading",
  equipmentKnowledge: "Equipment Knowledge",
  stamina: "Stamina",
  charisma: "Charisma",
  reputation: "Reputation",
};

export function ProfileScreen() {
  const { currentProfile, saveCurrentGame, exitToMenu } = useGame();
  const { theme, toggleTheme } = useTheme();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  if (!currentProfile) return null;
  
  const handleSave = () => {
    saveCurrentGame();
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };
  
  const handleExit = () => {
    saveCurrentGame();
    exitToMenu();
  };
  
  const renderStatRow = (statKey: string, value: number) => {
    const Icon = STAT_ICONS[statKey] || Target;
    const label = STAT_LABELS[statKey] || statKey;
    const percent = ((value - GAME_CONSTANTS.STAT_MIN) / (GAME_CONSTANTS.STAT_MAX - GAME_CONSTANTS.STAT_MIN)) * 100;
    
    return (
      <div key={statKey} className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm truncate">{label}</span>
            <span className="text-sm font-semibold tabular-nums ml-2">{value}</span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold" data-testid="text-profile-name">
                {currentProfile.firstName} {currentProfile.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={currentProfile.isProfessional ? "default" : "secondary"}>
                  {currentProfile.isProfessional ? "Professional" : "Amateur"}
                </Badge>
                <span className="text-sm text-muted-foreground capitalize">
                  {currentProfile.bowlingStyle}
                </span>
                {currentProfile.trait && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {currentProfile.trait.replace("-", " ")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-xl font-bold tabular-nums">{currentProfile.bowlingAverage}</p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-xl font-bold tabular-nums">{currentProfile.totalGamesPlayed}</p>
              <p className="text-xs text-muted-foreground">Games</p>
            </div>
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-xl font-bold tabular-nums">S{currentProfile.currentSeason}</p>
              <p className="text-xs text-muted-foreground">Season</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Player Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(currentProfile.stats).map(([key, value]) => 
            renderStatRow(key, value)
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements ({
              (() => {
                const earnedFromNew = currentProfile.earnedAchievements?.filter(a => a.earnedAt).map(a => a.id) || [];
                const earnedFromLegacy = currentProfile.achievements || [];
                const allEarned = new Set([...earnedFromNew, ...earnedFromLegacy]);
                return allEarned.size;
              })()
            }/{Object.keys(ACHIEVEMENT_INFO).length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2">
            {Object.entries(ACHIEVEMENT_INFO).map(([id, info]) => {
              const earnedData = currentProfile.earnedAchievements?.find(a => a.id === id);
              const earned = earnedData?.earnedAt !== undefined || currentProfile.achievements?.includes(id);
              
              return (
                <div 
                  key={id}
                  className={`flex items-center gap-3 p-2 rounded-md ${earned ? "bg-primary/10 border border-primary/20" : "bg-muted/50"}`}
                  data-testid={`achievement-${id}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${earned ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"}`}>
                    {earned ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${earned ? "" : "text-muted-foreground"}`}>
                      {info.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {info.description}
                    </p>
                    {earnedData?.progress !== undefined && earnedData?.target !== undefined && !earned && (
                      <Progress value={(earnedData.progress / earnedData.target) * 100} className="h-1 mt-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch 
              id="dark-mode" 
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              data-testid="switch-dark-mode"
            />
          </div>
          
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleSave}
              data-testid="button-save-game"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Game
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive"
              onClick={() => setShowExitDialog(true)}
              data-testid="button-exit-menu"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit to Main Menu
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {currentProfile.relationships.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Relationships
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentProfile.relationships.map((rel) => (
              <div key={rel.id} className="flex items-center justify-between">
                <span className="text-sm">{rel.name}</span>
                <div className="flex items-center gap-2">
                  <Progress value={rel.level} className="w-20 h-1.5" />
                  <span className="text-xs text-muted-foreground w-8">{rel.level}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit to Main Menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved automatically before exiting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {showSaveToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-card border border-border rounded-md shadow-lg px-4 py-2 flex items-center gap-2">
            <Save className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Game Saved!</span>
          </div>
        </div>
      )}
    </div>
  );
}
