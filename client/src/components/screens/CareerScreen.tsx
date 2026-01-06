import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trophy, 
  Target, 
  Star, 
  Lock, 
  Zap, 
  Coins,
  TrendingUp,
  Award,
  Calendar
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { GAME_CONSTANTS, type Competition, type OilPattern, type ActiveEvent, type Opponent } from "@shared/schema";
import { EventLobby } from "@/components/EventLobby";
import { PlayMatch } from "@/components/PlayMatch";
import { simulateOpponentGame } from "@/lib/gameUtils";

const AVAILABLE_COMPETITIONS: Competition[] = [
  {
    id: "local-league",
    name: "Local Weekly League",
    type: "league",
    tier: "amateur-local",
    prizePool: 200,
    entryFee: 25,
    energyCost: 15,
    oilPattern: "house",
    requiresPro: false,
    gamesCount: 3,
  },
  {
    id: "city-tournament",
    name: "City Amateur Open",
    type: "tournament",
    tier: "amateur-regional",
    prizePool: 1000,
    entryFee: 75,
    energyCost: 25,
    oilPattern: "short",
    requiresPro: false,
    minAverage: 150,
    gamesCount: 4,
  },
  {
    id: "regional-championship",
    name: "Regional Championship",
    type: "championship",
    tier: "amateur-regional",
    prizePool: 2500,
    entryFee: 150,
    energyCost: 35,
    oilPattern: "sport",
    requiresPro: false,
    minAverage: 175,
    gamesCount: 6,
  },
  {
    id: "pro-tour-stop",
    name: "Pro Tour Stop",
    type: "tournament",
    tier: "pro-local",
    prizePool: 10000,
    entryFee: 500,
    energyCost: 40,
    oilPattern: "sport",
    requiresPro: true,
    minAverage: 200,
    gamesCount: 6,
  },
  {
    id: "pro-regional",
    name: "Professional Regional",
    type: "tournament",
    tier: "pro-regional",
    prizePool: 25000,
    entryFee: 1000,
    energyCost: 50,
    oilPattern: "long",
    requiresPro: true,
    minAverage: 210,
    gamesCount: 8,
  },
  {
    id: "national-championship",
    name: "National Pro Championship",
    type: "championship",
    tier: "pro-national",
    prizePool: 100000,
    entryFee: 2500,
    energyCost: 60,
    oilPattern: "heavy",
    requiresPro: true,
    minAverage: 220,
    gamesCount: 10,
  },
];

export function CareerScreen() {
  const { currentProfile, goProfessional, spendMoney, useEnergy, addMoney, addGameResult } = useGame();
  const [showProDialog, setShowProDialog] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [competitionResult, setCompetitionResult] = useState<{ score: number; placement: number; prize: number } | null>(null);
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);
  const [showEventLobby, setShowEventLobby] = useState(false);
  const [playingMatch, setPlayingMatch] = useState(false);
  const [currentOpponents, setCurrentOpponents] = useState<Opponent[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  if (!currentProfile) return null;
  
  const gamesForPro = currentProfile.recentGameScores.length;
  const avgProgress = Math.min(100, (currentProfile.bowlingAverage / GAME_CONSTANTS.PRO_AVERAGE_THRESHOLD) * 100);
  const gamesProgress = Math.min(100, (gamesForPro / GAME_CONSTANTS.PRO_GAMES_REQUIRED) * 100);
  
  const canGoPro = 
    currentProfile.bowlingAverage >= GAME_CONSTANTS.PRO_AVERAGE_THRESHOLD &&
    gamesForPro >= GAME_CONSTANTS.PRO_GAMES_REQUIRED &&
    currentProfile.money >= GAME_CONSTANTS.PRO_APPLICATION_COST &&
    currentProfile.energy >= GAME_CONSTANTS.PRO_APPLICATION_ENERGY;
  
  const handleGoPro = () => {
    if (goProfessional()) {
      setShowProDialog(false);
    }
  };
  
  const canEnterCompetition = (comp: Competition) => {
    if (comp.requiresPro && !currentProfile.isProfessional) return false;
    if (comp.minAverage && currentProfile.bowlingAverage < comp.minAverage) return false;
    if (currentProfile.money < comp.entryFee) return false;
    if (currentProfile.energy < comp.energyCost) return false;
    return true;
  };
  
  const enterCompetition = (comp: Competition) => {
    if (!canEnterCompetition(comp)) return;
    if (!spendMoney(comp.entryFee)) return;
    if (!useEnergy(comp.energyCost)) return;
    
    setSelectedCompetition(comp);
    setShowEventLobby(true);
  };
  
  const handlePlayGame = (gameIndex: number, opponents: Opponent[], event: ActiveEvent) => {
    setActiveEvent(event);
    setCurrentOpponents(opponents);
    setCurrentMatchIndex(gameIndex);
    setPlayingMatch(true);
    setShowEventLobby(false);
  };
  
  const handleMatchComplete = (playerScore: number, opponentScore: number, opponentScoresForGame: number[]) => {
    if (!selectedCompetition || !activeEvent) return;
    
    const newOpponentScores = activeEvent.opponentSeriesScores.map((scores, idx) => {
      return [...scores, opponentScoresForGame[idx]];
    });
    
    const newPlayerScores = [...activeEvent.playerSeriesScores, playerScore];
    const newGameIndex = activeEvent.currentGameIndex + 1;
    const isComplete = newGameIndex >= selectedCompetition.gamesCount;
    
    if (isComplete) {
      const playerTotal = newPlayerScores.reduce((a, b) => a + b, 0);
      const standings: Array<{ name: string; total: number }> = [
        { name: "You", total: playerTotal }
      ];
      
      activeEvent.opponents.forEach((opp, idx) => {
        const oppScores = newOpponentScores[idx] || [];
        const total = oppScores.reduce((a, b) => a + b, 0);
        standings.push({ name: `${opp.firstName} ${opp.lastName}`, total });
      });
      
      standings.sort((a, b) => b.total - a.total);
      const placement = standings.findIndex(s => s.name === "You") + 1;
      
      let prize = 0;
      if (placement === 1) prize = Math.round(selectedCompetition.prizePool * 0.4);
      else if (placement === 2) prize = Math.round(selectedCompetition.prizePool * 0.25);
      else if (placement === 3) prize = Math.round(selectedCompetition.prizePool * 0.15);
      else if (placement <= 5) prize = Math.round(selectedCompetition.prizePool * 0.05);
      
      if (prize > 0) addMoney(prize);
      
      setActiveEvent({
        ...activeEvent,
        playerSeriesScores: newPlayerScores,
        opponentSeriesScores: newOpponentScores,
        currentGameIndex: newGameIndex,
        isComplete: true,
        finalPlacement: placement,
        prizeWon: prize,
      });
      
      setCompetitionResult({ 
        score: Math.round(playerTotal / newPlayerScores.length), 
        placement, 
        prize 
      });
    } else {
      setActiveEvent({
        ...activeEvent,
        playerSeriesScores: newPlayerScores,
        opponentSeriesScores: newOpponentScores,
        currentGameIndex: newGameIndex,
      });
    }
    
    setPlayingMatch(false);
    setShowEventLobby(true);
  };
  
  const handleMatchBack = () => {
    setPlayingMatch(false);
    setShowEventLobby(true);
  };
  
  const handleSimGame = (gameIndex: number, opponents: Opponent[], event: ActiveEvent) => {
    if (!selectedCompetition || !currentProfile) return;
    
    const baseScore = 100 + (currentProfile.bowlingAverage * 0.5) + (Math.random() * 40 - 20);
    const gameScore = Math.round(Math.max(80, Math.min(300, baseScore)));
    
    addGameResult({
      id: Date.now().toString(),
      week: currentProfile.currentWeek,
      season: currentProfile.currentSeason,
      score: gameScore,
      strikes: Math.floor(gameScore / 30),
      spares: Math.floor((300 - gameScore) / 40),
      opens: Math.floor((300 - gameScore) / 60),
      competitionId: selectedCompetition.id,
      competitionName: selectedCompetition.name,
      oilPattern: selectedCompetition.oilPattern,
      frames: [],
    });
    
    setActiveEvent({
      ...event,
      playerSeriesScores: [...event.playerSeriesScores, gameScore],
      currentGameIndex: event.currentGameIndex + 1,
    });
  };
  
  const handleSimAll = (opponents: Opponent[], event: ActiveEvent) => {
    if (!selectedCompetition || !currentProfile) return;
    
    const gamesRemaining = selectedCompetition.gamesCount - event.currentGameIndex;
    const newPlayerScores: number[] = [...event.playerSeriesScores];
    
    for (let i = 0; i < gamesRemaining; i++) {
      const baseScore = 100 + (currentProfile.bowlingAverage * 0.5) + (Math.random() * 40 - 20);
      const gameScore = Math.round(Math.max(80, Math.min(300, baseScore)));
      newPlayerScores.push(gameScore);
      
      addGameResult({
        id: Date.now().toString() + i,
        week: currentProfile.currentWeek,
        season: currentProfile.currentSeason,
        score: gameScore,
        strikes: Math.floor(gameScore / 30),
        spares: Math.floor((300 - gameScore) / 40),
        opens: Math.floor((300 - gameScore) / 60),
        competitionId: selectedCompetition.id,
        competitionName: selectedCompetition.name,
        oilPattern: selectedCompetition.oilPattern,
        frames: [],
      });
    }
    
    const playerTotal = newPlayerScores.reduce((a, b) => a + b, 0);
    const standings: Array<{ name: string; total: number }> = [
      { name: "You", total: playerTotal }
    ];
    
    opponents.forEach((opp, idx) => {
      const oppScores = event.opponentSeriesScores[idx] || [];
      const total = oppScores.reduce((a, b) => a + b, 0);
      standings.push({ name: `${opp.firstName} ${opp.lastName}`, total });
    });
    
    standings.sort((a, b) => b.total - a.total);
    const placement = standings.findIndex(s => s.name === "You") + 1;
    
    let prize = 0;
    if (placement === 1) prize = Math.round(selectedCompetition.prizePool * 0.4);
    else if (placement === 2) prize = Math.round(selectedCompetition.prizePool * 0.25);
    else if (placement === 3) prize = Math.round(selectedCompetition.prizePool * 0.15);
    else if (placement <= 5) prize = Math.round(selectedCompetition.prizePool * 0.05);
    
    if (prize > 0) addMoney(prize);
    
    setActiveEvent({
      ...event,
      playerSeriesScores: newPlayerScores,
      currentGameIndex: selectedCompetition.gamesCount,
      isComplete: true,
      finalPlacement: placement,
      prizeWon: prize,
    });
    
    setCompetitionResult({ 
      score: Math.round(playerTotal / newPlayerScores.length), 
      placement, 
      prize 
    });
  };
  
  const handleEventExit = () => {
    setShowEventLobby(false);
    setSelectedCompetition(null);
    setActiveEvent(null);
  };
  
  const handleEventComplete = (placement: number, prize: number, playerScores: number[], opponentScores: number[][]) => {
    if (prize > 0) addMoney(prize);
    
    const avgScore = playerScores.length > 0 
      ? Math.round(playerScores.reduce((a, b) => a + b, 0) / playerScores.length)
      : 0;
    
    setCompetitionResult({ score: avgScore, placement, prize });
  };
  
  const getOilPatternLabel = (pattern: OilPattern) => {
    const labels: Record<OilPattern, string> = {
      house: "House Shot",
      sport: "Sport Pattern",
      short: "Short Oil",
      long: "Long Oil",
      heavy: "Heavy Oil",
      dry: "Dry Lanes",
    };
    return labels[pattern];
  };

  const amateurComps = AVAILABLE_COMPETITIONS.filter(c => !c.requiresPro);
  const proComps = AVAILABLE_COMPETITIONS.filter(c => c.requiresPro);

  if (playingMatch && selectedCompetition && activeEvent) {
    return (
      <PlayMatch
        competition={selectedCompetition}
        opponents={activeEvent.opponents}
        gameIndex={activeEvent.currentGameIndex}
        onComplete={handleMatchComplete}
        onForfeit={handleMatchBack}
      />
    );
  }
  
  if (showEventLobby && selectedCompetition) {
    return (
      <EventLobby
        competition={selectedCompetition}
        playerAverage={currentProfile.bowlingAverage}
        playerEnergy={currentProfile.energy}
        onPlayGame={handlePlayGame}
        onSimGame={handleSimGame}
        onSimAll={handleSimAll}
        onExit={handleEventExit}
        onComplete={handleEventComplete}
        initialEvent={activeEvent}
      />
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      <h1 className="text-xl font-bold">Career</h1>
      
      {!currentProfile.isProfessional && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Professional Membership
              </CardTitle>
              <Badge variant={canGoPro ? "default" : "secondary"}>
                {canGoPro ? "Eligible" : "Not Eligible"}
              </Badge>
            </div>
            <CardDescription>
              Meet the requirements to go pro and unlock elite competitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Bowling Average</span>
                  <span className="font-medium tabular-nums">
                    {currentProfile.bowlingAverage} / {GAME_CONSTANTS.PRO_AVERAGE_THRESHOLD}
                  </span>
                </div>
                <Progress value={avgProgress} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Games Tracked</span>
                  <span className="font-medium tabular-nums">
                    {gamesForPro} / {GAME_CONSTANTS.PRO_GAMES_REQUIRED}
                  </span>
                </div>
                <Progress value={gamesProgress} className="h-2" />
              </div>
            </div>
            
            <Button 
              className="w-full" 
              disabled={!canGoPro}
              onClick={() => setShowProDialog(true)}
              data-testid="button-go-pro"
            >
              Apply for Pro Status
              <span className="ml-2 flex items-center gap-2 text-xs opacity-80">
                <Coins className="w-3.5 h-3.5" /> ${GAME_CONSTANTS.PRO_APPLICATION_COST}
                <Zap className="w-3.5 h-3.5" /> {GAME_CONSTANTS.PRO_APPLICATION_ENERGY}
              </span>
            </Button>
          </CardContent>
        </Card>
      )}
      
      {currentProfile.isProfessional && (
        <Card className="border-chart-3/30 bg-chart-3/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-chart-3/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-chart-3" />
            </div>
            <div>
              <p className="font-semibold">Professional Bowler</p>
              <p className="text-sm text-muted-foreground">
                Access to pro tournaments and sponsorships unlocked
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="competitions" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="competitions" className="space-y-4 mt-4">
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Amateur Events</h2>
            {amateurComps.map((comp) => {
              const canEnter = canEnterCompetition(comp);
              const isLocked = currentProfile.isProfessional;
              
              return (
                <Card key={comp.id} className={isLocked ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{comp.name}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {comp.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" />
                            {getOilPatternLabel(comp.oilPattern)}
                          </span>
                          <span>{comp.gamesCount} games</span>
                        </div>
                        {comp.minAverage && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Min avg: {comp.minAverage}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-chart-3">${comp.prizePool.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Prize Pool</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" /> ${comp.entryFee}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> {comp.energyCost}
                        </span>
                      </div>
                      
                      {isLocked ? (
                        <Badge variant="secondary">
                          <Lock className="w-3 h-3 mr-1" />
                          Pro Only
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          disabled={!canEnter}
                          onClick={() => enterCompetition(comp)}
                          data-testid={`button-enter-${comp.id}`}
                        >
                          Enter
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Professional Events
            </h2>
            {proComps.map((comp) => {
              const canEnter = canEnterCompetition(comp);
              const isLocked = !currentProfile.isProfessional;
              
              return (
                <Card key={comp.id} className={isLocked ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{comp.name}</span>
                          <Badge variant="default" className="text-xs shrink-0">
                            PRO
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" />
                            {getOilPatternLabel(comp.oilPattern)}
                          </span>
                          <span>{comp.gamesCount} games</span>
                        </div>
                        {comp.minAverage && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Min avg: {comp.minAverage}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-chart-3">${comp.prizePool.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Prize Pool</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" /> ${comp.entryFee}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> {comp.energyCost}
                        </span>
                      </div>
                      
                      {isLocked ? (
                        <Badge variant="secondary">
                          <Lock className="w-3 h-3 mr-1" />
                          Go Pro First
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          disabled={!canEnter}
                          onClick={() => enterCompetition(comp)}
                          data-testid={`button-enter-${comp.id}`}
                        >
                          Enter
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Career Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-2xl font-bold tabular-nums">{currentProfile.totalGamesPlayed}</p>
                  <p className="text-xs text-muted-foreground">Total Games</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-2xl font-bold tabular-nums">{currentProfile.bowlingAverage}</p>
                  <p className="text-xs text-muted-foreground">Average</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-2xl font-bold tabular-nums">
                    {Math.max(...currentProfile.recentGameScores, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">High Game</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-2xl font-bold tabular-nums">
                    S{currentProfile.currentSeason}
                  </p>
                  <p className="text-xs text-muted-foreground">Current Season</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {currentProfile.gameHistory.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Games</h3>
              {currentProfile.gameHistory.slice(-10).reverse().map((game) => (
                <Card key={game.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium tabular-nums">{game.score}</p>
                      <p className="text-xs text-muted-foreground">
                        {game.competitionName || "Practice"} • S{game.season} W{game.week}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {game.strikes}X {game.spares}/
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No games played yet</p>
                <p className="text-sm">Start practicing to build your history</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={showProDialog} onOpenChange={setShowProDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Go Professional?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Apply for professional bowling membership:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Access pro-level tournaments</li>
                <li>Larger prize pools</li>
                <li>Sponsorship opportunities</li>
                <li>Increased reputation gains</li>
              </ul>
              <p className="text-sm font-medium pt-2">
                Cost: ${GAME_CONSTANTS.PRO_APPLICATION_COST} + {GAME_CONSTANTS.PRO_APPLICATION_ENERGY} energy
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoPro}>
              Apply Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={competitionResult !== null} onOpenChange={() => setCompetitionResult(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${competitionResult?.placement === 1 ? "text-chart-3" : "text-muted-foreground"}`} />
              Competition Results
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium">{selectedCompetition?.name}</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-2xl font-bold">{competitionResult?.score}</p>
                  <p className="text-xs text-muted-foreground">Average Score</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-2xl font-bold">#{competitionResult?.placement}</p>
                  <p className="text-xs text-muted-foreground">Placement</p>
                </div>
              </div>
              {(competitionResult?.prize ?? 0) > 0 && (
                <div className="p-3 bg-chart-3/10 rounded-md text-center">
                  <p className="text-xl font-bold text-chart-3">+${competitionResult?.prize.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Prize Money Earned</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setCompetitionResult(null)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
