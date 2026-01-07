import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy } from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { PlayMatch } from "./PlayMatch";
import type { ActiveLeague, Competition, Opponent, OilPattern } from "@shared/schema";

interface LeaguePlayMatchProps {
  league: ActiveLeague;
  onComplete: (updatedLeague: ActiveLeague) => void;
  onBack: () => void;
}

export function LeaguePlayMatch({ league, onComplete, onBack }: LeaguePlayMatchProps) {
  const { currentProfile } = useGame();
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameScores, setGameScores] = useState<{ player: number; opponent: number }[]>([]);
  const [seriesComplete, setSeriesComplete] = useState(false);
  
  const currentWeekNum = league.currentWeek;
  const opponentsExcludingPlayer = league.standings.filter(s => !s.isPlayer);
  const opponentCount = opponentsExcludingPlayer.length || 1;
  const opponentIndex = (currentWeekNum - 1) % opponentCount;
  const opponentStanding = opponentsExcludingPlayer[opponentIndex];
  
  // Memoize opponent to prevent re-renders from triggering new opponent score generation
  const opponent = useMemo((): Opponent => ({
    id: opponentStanding?.bowlerId || "opp-1",
    firstName: opponentStanding?.name?.split(" ")[0] || "Opponent",
    lastName: opponentStanding?.name?.split(" ").slice(1).join(" ") || "",
    bowlingAverage: opponentStanding?.average || 150,
    bowlingStyle: "one-handed",
    handedness: "right",
    stats: {
      throwPower: 60, accuracy: 65, hookControl: 60, consistency: 70,
      stamina: 60, mentalToughness: 60, speedControl: 60, equipmentKnowledge: 50,
      revRate: 60, laneReading: 60, spareShooting: 65, charisma: 50, reputation: 40,
    },
  }), [opponentStanding?.bowlerId, opponentStanding?.name, opponentStanding?.average]);
  
  if (!currentProfile) return null;
  
  const competition: Competition = {
    id: league.id,
    name: league.name,
    type: "league",
    tier: "amateur-local",
    entryFee: 0,
    prizePool: 0,
    energyCost: 15,
    requiresPro: false,
    minAverage: 0,
    oilPattern: league.oilPattern,
    gamesCount: 3,
  };
  
  const handleGameComplete = (playerScore: number, opponentScore: number) => {
    const newScores = [...gameScores, { player: playerScore, opponent: opponentScore }];
    setGameScores(newScores);
    
    if (currentGameIndex >= 2) {
      setSeriesComplete(true);
    } else {
      setCurrentGameIndex(prev => prev + 1);
    }
  };
  
  const handleSeriesFinish = () => {
    const totalPlayer = gameScores.reduce((sum, g) => sum + g.player, 0);
    const totalOpp = gameScores.reduce((sum, g) => sum + g.opponent, 0);
    const playerWon = totalPlayer > totalOpp;
    const opponentWon = totalOpp > totalPlayer;
    const isTied = totalPlayer === totalOpp;
    const playerPoints = playerWon ? 2 : (isTied ? 1 : 0);
    const opponentPoints = opponentWon ? 2 : (isTied ? 1 : 0);
    
    const newWeekResult = {
      week: currentWeekNum,
      playerScores: gameScores.map(g => g.player),
      playerTotal: totalPlayer,
      opponentName: opponent.firstName + " " + opponent.lastName,
      opponentScores: gameScores.map(g => g.opponent),
      opponentTotal: totalOpp,
      won: playerWon,
      pointsEarned: playerPoints,
    };
    
    const updatedWeeklyResults = [...league.weeklyResults, newWeekResult];
    
    const updatedStandings = league.standings.map(s => {
      if (s.isPlayer) {
        return {
          ...s,
          wins: s.wins + (playerWon ? 1 : 0),
          losses: s.losses + (playerWon || isTied ? 0 : 1),
          points: s.points + playerPoints,
          totalPins: s.totalPins + totalPlayer,
          gamesPlayed: s.gamesPlayed + 3,
          average: Math.round((s.totalPins + totalPlayer) / (s.gamesPlayed + 3)),
        };
      }
      if (s.bowlerId === opponentStanding?.bowlerId) {
        return {
          ...s,
          wins: s.wins + (opponentWon ? 1 : 0),
          losses: s.losses + (opponentWon || isTied ? 0 : 1),
          points: s.points + opponentPoints,
          totalPins: s.totalPins + totalOpp,
          gamesPlayed: s.gamesPlayed + 3,
          average: Math.round((s.totalPins + totalOpp) / (s.gamesPlayed + 3)),
        };
      }
      return s;
    });
    
    const newWeek = league.currentWeek + 1;
    const updatedLeague: ActiveLeague = {
      ...league,
      weeklyResults: updatedWeeklyResults,
      standings: updatedStandings,
      currentWeek: newWeek,
      isComplete: newWeek > league.seasonLength,
    };
    
    onComplete(updatedLeague);
  };
  
  if (seriesComplete) {
    const totalPlayer = gameScores.reduce((sum, g) => sum + g.player, 0);
    const totalOpp = gameScores.reduce((sum, g) => sum + g.opponent, 0);
    const playerWon = totalPlayer > totalOpp;
    
    return (
      <div className="space-y-4 pb-24 px-4 pt-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{league.name}</h1>
          <Badge variant="outline">Week {currentWeekNum} Complete</Badge>
        </div>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="text-center">
              {playerWon ? (
                <div className="flex items-center justify-center gap-2 text-chart-3">
                  <Trophy className="w-8 h-8" />
                  <span className="text-2xl font-bold">Series Victory!</span>
                </div>
              ) : totalPlayer === totalOpp ? (
                <span className="text-2xl font-bold text-yellow-500">Series Tied!</span>
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">Series Lost</span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {gameScores.map((score, idx) => (
                <div key={idx} className="p-3 rounded-md bg-muted text-center">
                  <p className="text-xs text-muted-foreground mb-1">Game {idx + 1}</p>
                  <p className="font-bold">{score.player}</p>
                  <p className="text-xs text-muted-foreground">vs {score.opponent}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Your Total:</span>
                <span className="font-bold text-lg">{totalPlayer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Opponent Total:</span>
                <span className="font-medium">{totalOpp}</span>
              </div>
            </div>
            
            <Button className="w-full" onClick={handleSeriesFinish} data-testid="button-finish-series">
              Finish Week
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{league.name}</Badge>
            <Badge>Week {currentWeekNum}</Badge>
          </div>
          <Badge variant="secondary">Game {currentGameIndex + 1} of 3</Badge>
        </div>
        
        {gameScores.length > 0 && (
          <div className="flex gap-2 mb-2">
            {gameScores.map((score, idx) => (
              <div key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                G{idx + 1}: {score.player} - {score.opponent}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <PlayMatch
        key={`game-${currentGameIndex}`}
        competition={competition}
        opponents={[opponent]}
        gameIndex={currentGameIndex}
        onComplete={handleGameComplete}
        onForfeit={onBack}
      />
    </div>
  );
}
