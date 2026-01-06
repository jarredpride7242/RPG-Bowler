import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, ArrowRight } from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { PlayMatch } from "./PlayMatch";
import type { ActiveTournament, Competition, Opponent, TournamentResult, BracketMatch } from "@shared/schema";
import { TOURNAMENT_DEFINITIONS } from "@shared/schema";

interface TournamentPlayMatchProps {
  tournament: ActiveTournament;
  onComplete: (updatedTournament: ActiveTournament | null, result?: TournamentResult) => void;
  onBack: () => void;
}

export function TournamentPlayMatch({ tournament, onComplete, onBack }: TournamentPlayMatchProps) {
  const { currentProfile } = useGame();
  
  // For series format: track games within the series
  const [seriesGameIndex, setSeriesGameIndex] = useState(0);
  const [seriesScores, setSeriesScores] = useState<number[]>([]);
  
  // For bracket format: track match result
  const [bracketMatchComplete, setBracketMatchComplete] = useState(false);
  const [bracketMatchWon, setBracketMatchWon] = useState(false);
  const [bracketMatchScore, setBracketMatchScore] = useState<{ player: number; opponent: number } | null>(null);
  
  // Tournament completion state
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [finalPlacement, setFinalPlacement] = useState<number | null>(null);
  // Initialize from saved scores or empty
  const [allGameScores, setAllGameScores] = useState<number[]>(
    tournament.playerGameScores || []
  );
  
  const tierDef = TOURNAMENT_DEFINITIONS[tournament.tier];
  const totalGames = tournament.totalGames;
  const isBracket = tournament.format === "bracket";
  
  // Calculate bracket info
  const maxRounds = isBracket ? Math.ceil(Math.log2(tournament.entrants.length)) : 1;
  const currentRound = tournament.currentRound;
  
  // Memoize opponent to prevent re-renders from triggering new opponent score generation
  // Must be called before any early returns to satisfy React hooks rules
  const currentOpponent = useMemo((): Opponent => {
    const opponents = tournament.entrants.filter(e => !e.isPlayer);
    
    if (opponents.length === 0) {
      return {
        id: "field",
        firstName: "Opponent",
        lastName: "",
        bowlingAverage: tierDef.minAverage + 20,
        bowlingStyle: "one-handed",
        handedness: "right",
        stats: {
          throwPower: 60, accuracy: 65, hookControl: 60, consistency: 70,
          stamina: 60, mentalToughness: 60, speedControl: 60, equipmentKnowledge: 50,
          revRate: 60, laneReading: 60, spareShooting: 65, charisma: 50, reputation: 40,
        },
      };
    }
    
    const opponentIndex = (currentRound - 1) % opponents.length;
    const opponentEntrant = opponents[opponentIndex];
    const roundBonus = (currentRound - 1) * 5;
    const adjustedAverage = Math.min(220, opponentEntrant.bowlingAverage + roundBonus);
    
    return {
      id: opponentEntrant.id,
      firstName: opponentEntrant.name.split(" ")[0],
      lastName: opponentEntrant.name.split(" ").slice(1).join(" ") || "",
      bowlingAverage: adjustedAverage,
      bowlingStyle: "one-handed",
      handedness: "right",
      stats: {
        throwPower: 60 + roundBonus, 
        accuracy: 65 + roundBonus, 
        hookControl: 60 + roundBonus, 
        consistency: 70 + roundBonus,
        stamina: 60, mentalToughness: 60 + roundBonus, speedControl: 60, equipmentKnowledge: 50,
        revRate: 60, laneReading: 60 + roundBonus, spareShooting: 65 + roundBonus, charisma: 50, reputation: 40,
      },
    };
  }, [tournament.entrants, currentRound, tierDef.minAverage]);
  
  if (!currentProfile) return null;
  
  // Get round name for bracket
  const getRoundName = (round: number, maxRounds: number) => {
    const roundsFromFinal = maxRounds - round + 1;
    if (roundsFromFinal === 1) return "Finals";
    if (roundsFromFinal === 2) return "Semi-Finals";
    if (roundsFromFinal === 3) return "Quarter-Finals";
    return `Round ${round}`;
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
    if (isBracket) {
      // Bracket: one game per match
      const won = playerScore > opponentScore;
      setBracketMatchScore({ player: playerScore, opponent: opponentScore });
      setBracketMatchWon(won);
      setBracketMatchComplete(true);
      setAllGameScores(prev => [...prev, playerScore]);
    } else {
      // Series: multiple games
      const newScores = [...seriesScores, playerScore];
      setSeriesScores(newScores);
      setAllGameScores(prev => [...prev, playerScore]);
      
      if (seriesGameIndex >= totalGames - 1) {
        // Series complete - calculate placement
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
        setSeriesGameIndex(prev => prev + 1);
      }
    }
  };
  
  const handleAdvanceBracket = () => {
    if (!bracketMatchWon) {
      // Lost - tournament over
      const placement = Math.ceil(tournament.entrants.length / Math.pow(2, currentRound));
      setFinalPlacement(placement);
      setTournamentComplete(true);
      setBracketMatchComplete(false);
    } else if (currentRound >= maxRounds) {
      // Won finals - tournament complete
      setFinalPlacement(1);
      setTournamentComplete(true);
      setBracketMatchComplete(false);
    } else {
      // Advance to next round - stay in component
      setBracketMatchComplete(false);
      setBracketMatchWon(false);
      setBracketMatchScore(null);
      
      // Update tournament in parent but stay in play mode
      // Include allGameScores so they persist across rounds
      const updatedTournament: ActiveTournament = {
        ...tournament,
        currentRound: currentRound + 1,
        currentGame: tournament.currentGame + 1,
        playerGameScores: allGameScores,
      };
      onComplete(updatedTournament);
    }
  };
  
  const handleFinishTournament = () => {
    const totalPins = allGameScores.reduce((a, b) => a + b, 0);
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
      gamesPlayed: allGameScores.length,
      prizeMoney: prize,
      week: currentProfile.currentWeek,
    };
    
    onComplete(null, result);
  };
  
  // Bracket match result screen
  if (isBracket && bracketMatchComplete && bracketMatchScore) {
    const roundName = getRoundName(currentRound, maxRounds);
    const isChampionship = currentRound >= maxRounds && bracketMatchWon;
    
    return (
      <div className="space-y-4 pb-24 px-4 pt-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{tournament.name}</h1>
          <Badge variant="outline">{roundName}</Badge>
        </div>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="text-center py-4">
              {bracketMatchWon ? (
                isChampionship ? (
                  <div className="flex flex-col items-center gap-2 text-chart-3">
                    <Trophy className="w-12 h-12" />
                    <span className="text-2xl font-bold">Tournament Champion!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-chart-3">
                    <Trophy className="w-8 h-8" />
                    <span className="text-xl font-bold">Match Won!</span>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <span className="text-xl font-bold">Match Lost</span>
                  <span className="text-sm">Eliminated in {roundName}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <p className="text-2xl font-bold">{bracketMatchScore.player}</p>
                <p className="text-xs text-muted-foreground">You</p>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="text-center">
                <p className="text-2xl font-bold">{bracketMatchScore.opponent}</p>
                <p className="text-xs text-muted-foreground">{currentOpponent.firstName}</p>
              </div>
            </div>
            
            {allGameScores.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">All Games:</p>
                <div className="flex flex-wrap gap-2">
                  {allGameScores.map((score, idx) => (
                    <Badge key={idx} variant="secondary">
                      R{idx + 1}: {score}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              className="w-full" 
              onClick={handleAdvanceBracket}
              data-testid="button-bracket-continue"
            >
              {bracketMatchWon && currentRound < maxRounds ? (
                <>
                  Advance to {getRoundName(currentRound + 1, maxRounds)}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "View Results"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Tournament complete screen
  if (tournamentComplete) {
    const totalPins = allGameScores.reduce((a, b) => a + b, 0);
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
                <p className="text-xs text-muted-foreground">Games Played</p>
                <p className="text-xl font-bold">{allGameScores.length}</p>
              </div>
            </div>
            
            {prize > 0 && (
              <div className="p-4 bg-chart-3/10 rounded-md text-center">
                <p className="text-sm text-muted-foreground">Prize Money</p>
                <p className="text-2xl font-bold text-chart-3">${prize.toLocaleString()}</p>
              </div>
            )}
            
            {allGameScores.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Game Scores:</p>
                <div className="flex flex-wrap gap-2">
                  {allGameScores.map((score, idx) => (
                    <Badge key={idx} variant="secondary">
                      {isBracket ? `R${idx + 1}` : `G${idx + 1}`}: {score}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Button className="w-full" onClick={handleFinishTournament} data-testid="button-finish-tournament">
              Finish Tournament
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Active game screen
  return (
    <div className="space-y-2">
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tournament.name}</Badge>
            {isBracket && (
              <Badge>{getRoundName(currentRound, maxRounds)}</Badge>
            )}
          </div>
          <Badge variant="secondary">
            {isBracket 
              ? `vs ${currentOpponent.firstName}`
              : `Game ${seriesGameIndex + 1} of ${totalGames}`
            }
          </Badge>
        </div>
        
        {allGameScores.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {allGameScores.map((score, idx) => (
              <div key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                {isBracket ? `R${idx + 1}` : `G${idx + 1}`}: {score}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <PlayMatch
        key={`game-${isBracket ? currentRound : seriesGameIndex}`}
        competition={competition}
        opponents={[currentOpponent]}
        gameIndex={isBracket ? currentRound - 1 : seriesGameIndex}
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
