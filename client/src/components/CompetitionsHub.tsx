import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Calendar, 
  Users, 
  Zap, 
  DollarSign, 
  Target, 
  ChevronRight,
  Medal,
  Crown,
  Lock,
  Play,
  FastForward,
  ArrowLeft,
  Info,
  TrendingUp,
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { 
  LeagueType, 
  TournamentTier, 
  TournamentFormat,
  ActiveLeague,
  ActiveTournament,
} from "@shared/schema";
import { 
  LEAGUE_DEFINITIONS, 
  TOURNAMENT_DEFINITIONS,
  OIL_PATTERN_DETAILS,
} from "@shared/schema";
import {
  createActiveLeague,
  createActiveTournament,
  simulateLeagueWeek,
  simulateTournamentGame,
  canJoinLeague,
  canJoinTournament,
  getLeaguePrize,
  getTournamentPrize,
  createTournamentResult,
  simulateOpponentLeagueGame,
} from "@/lib/competitionUtils";

interface CompetitionsHubProps {
  onPlayLeagueGame: (league: ActiveLeague) => void;
  onPlayTournamentGame: (tournament: ActiveTournament) => void;
}

export function CompetitionsHub({ onPlayLeagueGame, onPlayTournamentGame }: CompetitionsHubProps) {
  const { currentProfile, updateProfile, spendMoney, useEnergy, addMoney, trackLeagueWeekCompleted, trackTournamentEntered, trackTournamentWon } = useGame();
  const [activeTab, setActiveTab] = useState<"leagues" | "tournaments">("leagues");
  const [viewingLeague, setViewingLeague] = useState<LeagueType | null>(null);
  const [viewingTournament, setViewingTournament] = useState<TournamentTier | null>(null);
  
  if (!currentProfile) return null;
  
  const activeLeague = currentProfile.activeLeague;
  const activeTournament = currentProfile.activeTournament;
  
  const handleJoinLeague = (leagueType: LeagueType) => {
    const definition = LEAGUE_DEFINITIONS[leagueType];
    
    if (!spendMoney(definition.entryFee)) return;
    
    const playerName = `${currentProfile.firstName} ${currentProfile.lastName}`;
    const newLeague = createActiveLeague(leagueType, playerName, currentProfile.currentWeek);
    
    updateProfile({ activeLeague: newLeague });
    setViewingLeague(null);
  };
  
  const handleLeaveLeague = () => {
    if (!activeLeague) return;
    updateProfile({ activeLeague: null });
  };
  
  const handleSimLeagueWeek = () => {
    if (!activeLeague || !useEnergy(LEAGUE_DEFINITIONS[activeLeague.leagueType].energyCost)) return;
    
    const playerScores = [0, 0, 0].map(() => 
      simulateOpponentLeagueGame(currentProfile.bowlingAverage, activeLeague.oilPattern)
    );
    
    const updatedLeague = simulateLeagueWeek(activeLeague, playerScores);
    
    trackLeagueWeekCompleted();
    if (updatedLeague.isComplete) {
      const prize = getLeaguePrize(updatedLeague, activeLeague.leagueType);
      addMoney(prize);
      const playerStanding = updatedLeague.standings.find(s => s.isPlayer);
      const position = updatedLeague.standings.indexOf(playerStanding!) + 1;
      if (position === 1) {
        updateProfile({ 
          activeLeague: null,
          leagueChampionships: (currentProfile.leagueChampionships || 0) + 1,
        });
      } else {
        updateProfile({ activeLeague: null });
      }
    } else {
      const definition = LEAGUE_DEFINITIONS[activeLeague.leagueType];
      addMoney(definition.weeklyPrize);
      updateProfile({ activeLeague: updatedLeague });
    }
  };
  
  const handleJoinTournament = (tier: TournamentTier, format: TournamentFormat) => {
    const definition = TOURNAMENT_DEFINITIONS[tier];
    
    if (!spendMoney(definition.entryFee)) return;
    
    const playerName = `${currentProfile.firstName} ${currentProfile.lastName}`;
    const newTournament = createActiveTournament(
      tier, 
      format, 
      playerName, 
      currentProfile.bowlingAverage, 
      currentProfile.currentWeek
    );
    
    updateProfile({ activeTournament: newTournament });
    trackTournamentEntered();
    setViewingTournament(null);
  };
  
  const handleSimTournamentGame = () => {
    if (!activeTournament || !useEnergy(Math.ceil(TOURNAMENT_DEFINITIONS[activeTournament.tier].energyCost / activeTournament.totalGames))) return;
    
    const playerScore = simulateOpponentLeagueGame(currentProfile.bowlingAverage, activeTournament.oilPattern);
    const updatedTournament = simulateTournamentGame(activeTournament, playerScore);
    
    if (updatedTournament.isComplete) {
      const result = createTournamentResult(updatedTournament, currentProfile.currentWeek);
      addMoney(result.prizeMoney);
      if (result.placement === 1) {
        trackTournamentWon();
      }
      
      const history = currentProfile.tournamentHistory || [];
      updateProfile({ 
        activeTournament: null,
        tournamentHistory: [...history, result],
        tournamentsThisSeason: (currentProfile.tournamentsThisSeason || 0) + 1,
      });
    } else {
      updateProfile({ activeTournament: updatedTournament });
    }
  };
  
  const handleWithdrawTournament = () => {
    if (!activeTournament) return;
    updateProfile({ activeTournament: null });
  };
  
  const renderLeagueCard = (leagueType: LeagueType) => {
    const definition = LEAGUE_DEFINITIONS[leagueType];
    const { canJoin, reason } = canJoinLeague(
      leagueType, 
      currentProfile.bowlingAverage, 
      currentProfile.isProfessional
    );
    const isLocked = !canJoin;
    const hasActiveLeague = !!activeLeague;
    const oilDetails = OIL_PATTERN_DETAILS[definition.oilPattern];
    
    return (
      <Card 
        key={leagueType} 
        className={`${isLocked ? "opacity-60" : ""} hover-elevate cursor-pointer`}
        onClick={() => !hasActiveLeague && canJoin && setViewingLeague(leagueType)}
        data-testid={`card-league-${leagueType}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium">{definition.name}</span>
                {definition.requiresPro && (
                  <Badge variant="secondary" className="text-xs">PRO</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{definition.description}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {oilDetails.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {definition.seasonLength} weeks
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {definition.fieldSize} bowlers
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              {isLocked ? (
                <Lock className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border gap-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                ${definition.entryFee}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {definition.energyCost}/wk
              </span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-chart-3">${definition.weeklyPrize}/wk</p>
            </div>
          </div>
          
          {isLocked && reason && (
            <p className="text-xs text-destructive mt-2">{reason}</p>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderActiveLeague = () => {
    if (!activeLeague) return null;
    
    const definition = LEAGUE_DEFINITIONS[activeLeague.leagueType];
    const oilDetails = OIL_PATTERN_DETAILS[activeLeague.oilPattern];
    const playerStanding = activeLeague.standings.find(s => s.isPlayer);
    const position = activeLeague.standings.indexOf(playerStanding!) + 1;
    const progress = ((activeLeague.currentWeek - 1) / activeLeague.seasonLength) * 100;
    
    return (
      <Card className="border-chart-3" data-testid="card-active-league">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-chart-3" />
              {activeLeague.name}
            </CardTitle>
            <Badge variant="outline">Week {activeLeague.currentWeek} of {activeLeague.seasonLength}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{position}</p>
              <p className="text-xs text-muted-foreground">Standing</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{playerStanding?.points || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{playerStanding?.average || 0}</p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Standings</h4>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {activeLeague.standings.slice(0, 8).map((standing, idx) => (
                  <div 
                    key={standing.bowlerId} 
                    className={`flex items-center justify-between text-sm px-2 py-1 rounded ${standing.isPlayer ? "bg-chart-3/10" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-muted-foreground">{idx + 1}.</span>
                      <span className={standing.isPlayer ? "font-medium" : ""}>{standing.name}</span>
                    </div>
                    <span className="font-mono">{standing.points} pts</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>{oilDetails.name}</span>
            <span className="mx-2">|</span>
            <Zap className="w-4 h-4" />
            <span>{definition.energyCost} energy</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onPlayLeagueGame(activeLeague)} 
              className="flex-1"
              disabled={currentProfile.energy < definition.energyCost}
              data-testid="button-play-league-game"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Week
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleSimLeagueWeek}
              disabled={currentProfile.energy < definition.energyCost}
              data-testid="button-sim-league-game"
            >
              <FastForward className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLeaveLeague}
            className="w-full text-muted-foreground"
            data-testid="button-leave-league"
          >
            Leave League
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  const renderTournamentCard = (tier: TournamentTier) => {
    const definition = TOURNAMENT_DEFINITIONS[tier];
    const { canJoin, reason } = canJoinTournament(
      tier, 
      currentProfile.bowlingAverage, 
      currentProfile.stats.reputation,
      currentProfile.isProfessional
    );
    const isLocked = !canJoin;
    const hasActiveTournament = !!activeTournament;
    const oilDetails = OIL_PATTERN_DETAILS[definition.oilPattern];
    
    return (
      <Card 
        key={tier} 
        className={`${isLocked ? "opacity-60" : ""} hover-elevate cursor-pointer`}
        onClick={() => !hasActiveTournament && canJoin && setViewingTournament(tier)}
        data-testid={`card-tournament-${tier}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium">{definition.name}</span>
                {definition.requiresPro && (
                  <Badge variant="secondary" className="text-xs">PRO</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{definition.description}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {oilDetails.name}
                </span>
                <span className="flex items-center gap-1">
                  <Medal className="w-3.5 h-3.5" />
                  {definition.gamesCount} games
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {definition.fieldSize} bowlers
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              {isLocked ? (
                <Lock className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border gap-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                ${definition.entryFee}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {definition.energyCost}
              </span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-chart-3">${definition.prizePool.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Prize Pool</p>
            </div>
          </div>
          
          {isLocked && reason && (
            <p className="text-xs text-destructive mt-2">{reason}</p>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderActiveTournament = () => {
    if (!activeTournament) return null;
    
    const definition = TOURNAMENT_DEFINITIONS[activeTournament.tier];
    const oilDetails = OIL_PATTERN_DETAILS[activeTournament.oilPattern];
    const playerEntrant = activeTournament.entrants.find(e => e.isPlayer);
    const sortedEntrants = [...activeTournament.entrants].sort((a, b) => b.totalPins - a.totalPins);
    const position = sortedEntrants.indexOf(playerEntrant!) + 1;
    const progress = (activeTournament.currentGame / activeTournament.totalGames) * 100;
    const energyPerGame = Math.ceil(definition.energyCost / activeTournament.totalGames);
    
    return (
      <Card className="border-chart-3" data-testid="card-active-tournament">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Medal className="w-5 h-5 text-chart-3" />
              {activeTournament.name}
            </CardTitle>
            <Badge variant="outline">
              Game {activeTournament.currentGame + 1} of {activeTournament.totalGames}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{position}</p>
              <p className="text-xs text-muted-foreground">Position</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{playerEntrant?.totalPins || 0}</p>
              <p className="text-xs text-muted-foreground">Total Pins</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {playerEntrant && playerEntrant.scores.length > 0 
                  ? Math.round(playerEntrant.totalPins / playerEntrant.scores.length) 
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Leaderboard</h4>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {sortedEntrants.slice(0, 10).map((entrant, idx) => (
                  <div 
                    key={entrant.id} 
                    className={`flex items-center justify-between text-sm px-2 py-1 rounded ${entrant.isPlayer ? "bg-chart-3/10" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-muted-foreground">{idx + 1}.</span>
                      <span className={entrant.isPlayer ? "font-medium" : ""}>{entrant.name}</span>
                    </div>
                    <span className="font-mono">{entrant.totalPins}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>{oilDetails.name}</span>
            <span className="mx-2">|</span>
            <Zap className="w-4 h-4" />
            <span>{energyPerGame} energy/game</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onPlayTournamentGame(activeTournament)} 
              className="flex-1"
              disabled={currentProfile.energy < energyPerGame}
              data-testid="button-play-tournament-game"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Game
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleSimTournamentGame}
              disabled={currentProfile.energy < energyPerGame}
              data-testid="button-sim-tournament-game"
            >
              <FastForward className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleWithdrawTournament}
            className="w-full text-muted-foreground"
            data-testid="button-withdraw-tournament"
          >
            Withdraw from Tournament
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  const renderLeagueDetails = () => {
    if (!viewingLeague) return null;
    
    const definition = LEAGUE_DEFINITIONS[viewingLeague];
    const oilDetails = OIL_PATTERN_DETAILS[definition.oilPattern];
    const { canJoin } = canJoinLeague(
      viewingLeague, 
      currentProfile.bowlingAverage, 
      currentProfile.isProfessional
    );
    
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setViewingLeague(null)}
          data-testid="button-back-from-league"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leagues
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {definition.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{definition.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Season Length</p>
                <p className="font-medium">{definition.seasonLength} weeks</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Field Size</p>
                <p className="font-medium">{definition.fieldSize} bowlers</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Oil Pattern</p>
                <p className="font-medium">{oilDetails.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${i < oilDetails.difficulty ? "bg-chart-3" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Format</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bowl a 3-game series each week against a league opponent. 
                Earn points for wins (2 pts) and ties (1 pt). 
                Top 4 advance to playoffs at season end.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Costs & Rewards</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">Entry Fee</p>
                  <p className="font-medium">${definition.entryFee}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">Weekly Energy</p>
                  <p className="font-medium">{definition.energyCost}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">Weekly Prize</p>
                  <p className="font-medium text-chart-3">${definition.weeklyPrize}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">Championship</p>
                  <p className="font-medium text-chart-3">${definition.weeklyPrize * 10}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => handleJoinLeague(viewingLeague)} 
              className="w-full"
              disabled={!canJoin || currentProfile.money < definition.entryFee}
              data-testid="button-join-league"
            >
              <Crown className="w-4 h-4 mr-2" />
              Join League (${definition.entryFee})
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderTournamentDetails = () => {
    if (!viewingTournament) return null;
    
    const definition = TOURNAMENT_DEFINITIONS[viewingTournament];
    const oilDetails = OIL_PATTERN_DETAILS[definition.oilPattern];
    const { canJoin } = canJoinTournament(
      viewingTournament, 
      currentProfile.bowlingAverage, 
      currentProfile.stats.reputation,
      currentProfile.isProfessional
    );
    
    const prizeBreakdown = [
      { place: "1st", amount: Math.floor(definition.prizePool * 0.40) },
      { place: "2nd", amount: Math.floor(definition.prizePool * 0.25) },
      { place: "3rd", amount: Math.floor(definition.prizePool * 0.15) },
      { place: "4th", amount: Math.floor(definition.prizePool * 0.10) },
      { place: "5th-8th", amount: Math.floor(definition.prizePool * 0.02) },
    ];
    
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setViewingTournament(null)}
          data-testid="button-back-from-tournament"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tournaments
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5" />
              {definition.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{definition.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Games</p>
                <p className="font-medium">{definition.gamesCount} games</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Field Size</p>
                <p className="font-medium">{definition.fieldSize} bowlers</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Oil Pattern</p>
                <p className="font-medium">{oilDetails.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${i < oilDetails.difficulty ? "bg-chart-3" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Prize Breakdown</h4>
              <div className="space-y-1">
                {prizeBreakdown.map(prize => (
                  <div key={prize.place} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{prize.place}</span>
                    <span className="font-medium text-chart-3">${prize.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Choose Format</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleJoinTournament(viewingTournament, "series")} 
                  disabled={!canJoin || currentProfile.money < definition.entryFee}
                  className="flex-col h-auto py-3"
                  data-testid="button-join-tournament-series"
                >
                  <TrendingUp className="w-5 h-5 mb-1" />
                  <span>Series</span>
                  <span className="text-xs text-muted-foreground">Total Pins</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleJoinTournament(viewingTournament, "bracket")} 
                  disabled={!canJoin || currentProfile.money < definition.entryFee}
                  className="flex-col h-auto py-3"
                  data-testid="button-join-tournament-bracket"
                >
                  <Trophy className="w-5 h-5 mb-1" />
                  <span>Bracket</span>
                  <span className="text-xs text-muted-foreground">Match Play</span>
                </Button>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Entry Fee: ${definition.entryFee} | Energy: {definition.energyCost}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderTournamentHistory = () => {
    const history = currentProfile.tournamentHistory || [];
    
    if (history.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Medal className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No tournament history yet</p>
          <p className="text-sm">Enter a tournament to start competing</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {history.slice(-10).reverse().map((result, idx) => (
          <div 
            key={`${result.tournamentId}-${idx}`}
            className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
          >
            <div>
              <p className="font-medium">{result.tournamentName}</p>
              <p className="text-sm text-muted-foreground">
                {result.placement === 1 ? "Winner" : `${result.placement}${getOrdinalSuffix(result.placement)} place`} of {result.totalEntrants}
              </p>
            </div>
            <div className="text-right">
              {result.prizeMoney > 0 && (
                <p className="font-medium text-chart-3">${result.prizeMoney.toLocaleString()}</p>
              )}
              <p className="text-sm text-muted-foreground">{result.totalPins} pins</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  if (viewingLeague) {
    return renderLeagueDetails();
  }
  
  if (viewingTournament) {
    return renderTournamentDetails();
  }
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "leagues" | "tournaments")}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="leagues" data-testid="tab-leagues">
            <Trophy className="w-4 h-4 mr-2" />
            Leagues
          </TabsTrigger>
          <TabsTrigger value="tournaments" data-testid="tab-tournaments">
            <Medal className="w-4 h-4 mr-2" />
            Tournaments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leagues" className="space-y-4 mt-4">
          {activeLeague ? (
            renderActiveLeague()
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Available Leagues</h3>
              {(["casual", "competitive", "pro"] as LeagueType[]).map(renderLeagueCard)}
            </div>
          )}
          
          {currentProfile.leagueChampionships && currentProfile.leagueChampionships > 0 && (
            <div className="p-3 bg-chart-3/10 rounded-md flex items-center gap-2">
              <Crown className="w-5 h-5 text-chart-3" />
              <span className="text-sm">
                <span className="font-medium">{currentProfile.leagueChampionships}</span> League Championship{currentProfile.leagueChampionships > 1 ? "s" : ""} Won
              </span>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tournaments" className="space-y-4 mt-4">
          {activeTournament ? (
            renderActiveTournament()
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Available Tournaments</h3>
              {(["local", "regional", "major"] as TournamentTier[]).map(renderTournamentCard)}
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Tournament History</h3>
            {renderTournamentHistory()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
