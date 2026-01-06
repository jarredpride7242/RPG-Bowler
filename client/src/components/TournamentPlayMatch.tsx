import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { PlayMatch } from "./PlayMatch";
import type { ActiveTournament, Competition, Opponent, TournamentResult } from "@shared/schema";
import { TOURNAMENT_DEFINITIONS } from "@shared/schema";

interface TournamentPlayMatchProps {
  tournament: ActiveTournament;
  onComplete: (updatedTournament: ActiveTournament | null, result?: TournamentResult) => void;
  onBack: () => void;
}

export function TournamentPlayMatch({ tournament, onComplete, onBack }: TournamentPlayMatchProps) {
  const { currentProfile } = useGame();
  const [currentGameIndex, setCurrentGameIndex] = useState(tournament.currentGame - 1);
  const [gameScores, setGameScores] = useState<number[]>([]);
  const [opponentScores, setOpponentScores] = useState<number[]>([]);
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [finalPlacement, setFinalPlacement] = useState<number | null>(null);
  
  if (!currentProfile) return null;
  
  const tierDef = TOURNAMENT_DEFINITIONS[tournament.tier];
  const totalGames = tournament.totalGames;
  const gamesPlayed = gameScores.length;
  const currentGame = gamesPlayed;
  
  const currentOpponent: Opponent = {
    id: "field",
    firstName: "Field",
    lastName: "Average",
    bowlingAverage: tierDef.minAverage + 20,
    bowlingStyle: "one-handed",
    handedness: "right",
    stats: {
      throwPower: 60, accuracy: 65, hookControl: 60, consistency: 70,
      stamina: 60, mentalToughness: 60, speedControl: 60, equipmentKnowledge: 50,
      revRate: 60, laneReading: 60, spareShooting: 65, charisma: 50, reputation: 40,
    },
  };
  
  const tierToCompTier = (tier: string) => {
    switch (tier) {
      case "local": return "amateur-local" as const;
      case "regional": return "amateur-regional" as const;
      case "major": return "pro-national" as const;
      default: return "amateur-local" as const;
    }
  };
  
  const competition: Competition = {
    id: tournament.id,
    name: tournament.name,
    type: "tournament",
    tier: tierToCompTier(tournament.tier),
    entryFee: tournament.entryFee,
    prizePool: tournament.prizePool,
    energyCost: tierDef.energyCost,
    requiresPro: tierDef.requiresPro,
    minAverage: tierDef.minAverage,
    oilPattern: tournament.oilPattern,
    gamesCount: totalGames,
  };
  
  const handleGameComplete = (playerScore: number, opponentScore: number) => {
    const newScores = [...gameScores, playerScore];
    const newOppScores = [...opponentScores, opponentScore];
    setGameScores(newScores);
    setOpponentScores(newOppScores);
    
    if (tournament.format === "bracket") {
      const playerWon = playerScore > opponentScore;
      if (!playerWon) {
        const placement = Math.ceil(tournament.entrants.length / Math.pow(2, tournament.currentRound));
        setFinalPlacement(placement);
        setTournamentComplete(true);
      } else {
        const nextRound = tournament.currentRound + 1;
        const maxRounds = Math.ceil(Math.log2(tournament.entrants.length));
        
        if (nextRound > maxRounds) {
          setFinalPlacement(1);
          setTournamentComplete(true);
        } else {
          const updatedTournament: ActiveTournament = {
            ...tournament,
            currentRound: nextRound,
            currentGame: tournament.currentGame + 1,
          };
          onComplete(updatedTournament);
        }
      }
    } else {
      if (currentGame >= totalGames - 1) {
        const totalPins = newScores.reduce((a, b) => a + b, 0);
        const avgScore = tierDef.minAverage + 20;
        const fieldScores = Array.from({ length: tournament.entrants.length - 1 }, () => {
          return Array.from({ length: totalGames }, () => 
            Math.round(avgScore + (Math.random() * 40 - 20))
          ).reduce((a, b) => a + b, 0);
        });
        
        const placement = fieldScores.filter(s => s > totalPins).length + 1;
        setFinalPlacement(placement);
        setTournamentComplete(true);
      } else {
        setCurrentGameIndex(prev => prev + 1);
      }
    }
  };
  
  const handleFinishTournament = () => {
    const totalPins = gameScores.reduce((a, b) => a + b, 0);
    const placement = finalPlacement || tournament.entrants.length;
    
    let prize = 0;
    if (placement === 1) prize = Math.round(tournament.prizePool * 0.4);
    else if (placement === 2) prize = Math.round(tournament.prizePool * 0.25);
    else if (placement === 3) prize = Math.round(tournament.prizePool * 0.15);
    else if (placement <= 5) prize = Math.round(tournament.prizePool * 0.05);
    
    const result: TournamentResult = {
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      tier: tournament.tier,
      format: tournament.format,
      placement,
      totalEntrants: tournament.entrants.length,
      totalPins,
      gamesPlayed: gameScores.length,
      prizeMoney: prize,
      week: currentProfile.currentWeek,
    };
    
    onComplete(null, result);
  };
  
  if (tournamentComplete) {
    const totalPins = gameScores.reduce((a, b) => a + b, 0);
    const placement = finalPlacement || tournament.entrants.length;
    const isWinner = placement === 1;
    const isPodium = placement <= 3;
    
    let prize = 0;
    if (placement === 1) prize = Math.round(tournament.prizePool * 0.4);
    else if (placement === 2) prize = Math.round(tournament.prizePool * 0.25);
    else if (placement === 3) prize = Math.round(tournament.prizePool * 0.15);
    else if (placement <= 5) prize = Math.round(tournament.prizePool * 0.05);
    
    return (
      <div className="space-y-4 pb-24 px-4 pt-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{tournament.name}</h1>
          <Badge variant="outline">Complete</Badge>
        </div>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="text-center py-4">
              {isWinner ? (
                <div className="flex flex-col items-center gap-2 text-chart-3">
                  <Trophy className="w-12 h-12" />
                  <span className="text-2xl font-bold">Champion!</span>
                </div>
              ) : isPodium ? (
                <div className="flex flex-col items-center gap-2 text-chart-2">
                  <Medal className="w-12 h-12" />
                  <span className="text-2xl font-bold">{getPlacementText(placement)}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <span className="text-2xl font-bold">{getPlacementText(placement)}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">Total Pins</p>
                <p className="text-xl font-bold">{totalPins}</p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">Games</p>
                <p className="text-xl font-bold">{gameScores.length}</p>
              </div>
            </div>
            
            {prize > 0 && (
              <div className="p-4 bg-chart-3/10 rounded-md text-center">
                <p className="text-sm text-muted-foreground">Prize Money</p>
                <p className="text-2xl font-bold text-chart-3">${prize.toLocaleString()}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Game Scores:</p>
              <div className="flex flex-wrap gap-2">
                {gameScores.map((score, idx) => (
                  <Badge key={idx} variant="secondary">
                    G{idx + 1}: {score}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button className="w-full" onClick={handleFinishTournament} data-testid="button-finish-tournament">
              Finish Tournament
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
            <Badge variant="outline">{tournament.name}</Badge>
            {tournament.format === "bracket" && (
              <Badge>Round {tournament.currentRound}</Badge>
            )}
          </div>
          <Badge variant="secondary">
            {tournament.format === "series" 
              ? `Game ${currentGame + 1} of ${totalGames}`
              : `Match ${tournament.currentRound}`
            }
          </Badge>
        </div>
        
        {gameScores.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {gameScores.map((score, idx) => (
              <div key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                G{idx + 1}: {score}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <PlayMatch
        competition={competition}
        opponents={[currentOpponent]}
        gameIndex={currentGame}
        onComplete={handleGameComplete}
        onForfeit={onBack}
      />
    </div>
  );
}

function getPlacementText(placement: number): string {
  if (placement === 1) return "1st Place";
  if (placement === 2) return "2nd Place";
  if (placement === 3) return "3rd Place";
  return `${placement}th Place`;
}
