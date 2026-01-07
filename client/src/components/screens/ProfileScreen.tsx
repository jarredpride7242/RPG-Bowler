import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  Save,
  GraduationCap,
  AlertTriangle,
  Crown,
  Building2,
  Palette,
  Trophy,
  Award,
  Lock,
  Layers
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { useTheme } from "@/lib/themeContext";
import { GAME_CONSTANTS } from "@shared/schema";
import { CoachesTab } from "@/components/CoachesTab";
import { InjurySlumpPanel } from "@/components/InjurySlumpPanel";
import { WeeklyChallengesPanel } from "@/components/WeeklyChallengesPanel";
import { LegacyPanel } from "@/components/LegacyPanel";
import { CosmeticsTab } from "@/components/CosmeticsTab";
import { AchievementsRecordsTab } from "@/components/AchievementsRecordsTab";
import { HallOfFamePanel } from "@/components/HallOfFamePanel";
import { SponsorNegotiationPanel } from "@/components/SponsorNegotiationPanel";
import { AlleyTab } from "@/components/AlleyTab";

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
  const { currentProfile, saveCurrentGame, exitToMenu, getActiveEffects, getActiveCoach } = useGame();
  const { theme, toggleTheme } = useTheme();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
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

  const activeEffects = getActiveEffects();
  const activeCoach = getActiveCoach();

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
          
          {(activeEffects.length > 0 || activeCoach) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
              {activeCoach && (
                <Badge variant="secondary" className="text-xs">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  Coach: {activeCoach.name.split(" ")[0]}
                </Badge>
              )}
              {activeEffects.map(effect => (
                <Badge key={effect.id} variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {effect.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex w-auto gap-1">
            <TabsTrigger value="overview" className="text-xs px-2 shrink-0" data-testid="tab-overview">
              <User className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs px-2 shrink-0" data-testid="tab-achievements">
              <Trophy className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="cosmetics" className="text-xs px-2 shrink-0" data-testid="tab-cosmetics">
              <Palette className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="text-xs px-2 shrink-0" data-testid="tab-sponsors">
              <Building2 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs px-2 shrink-0" data-testid="tab-challenges">
              <Target className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="coach" className="text-xs px-2 shrink-0" data-testid="tab-coach">
              <GraduationCap className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs px-2 shrink-0" data-testid="tab-health">
              <Heart className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="legacy" className="text-xs px-2 shrink-0" data-testid="tab-legacy">
              <Crown className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="alley" className="text-xs px-2 shrink-0" data-testid="tab-alley">
              <Layers className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        <TabsContent value="overview" className="mt-4 space-y-4">
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
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-4">
          <AchievementsRecordsTab />
        </TabsContent>
        
        <TabsContent value="cosmetics" className="mt-4">
          <CosmeticsTab />
        </TabsContent>
        
        <TabsContent value="sponsors" className="mt-4">
          <SponsorNegotiationPanel />
        </TabsContent>
        
        <TabsContent value="challenges" className="mt-4">
          <WeeklyChallengesPanel />
        </TabsContent>
        
        <TabsContent value="coach" className="mt-4">
          <CoachesTab />
        </TabsContent>
        
        <TabsContent value="health" className="mt-4">
          <InjurySlumpPanel />
        </TabsContent>
        
        <TabsContent value="legacy" className="mt-4 space-y-4">
          <LegacyPanel />
          <HallOfFamePanel />
        </TabsContent>
        
        <TabsContent value="alley" className="mt-4">
          <AlleyTab />
        </TabsContent>
      </Tabs>
      
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
