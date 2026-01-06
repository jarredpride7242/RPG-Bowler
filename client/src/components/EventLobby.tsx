import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Users,
  Play,
  FastForward,
  ArrowLeft,
  Medal,
  Zap
} from "lucide-react";
import type { Competition, Opponent, OilPattern, ActiveEvent } from "@shared/schema";
import { generateOpponents, simulateOpponentGame } from "@/lib/gameUtils";

interface EventLobbyProps {
  competition: Competition;
  playerAverage: number;
  playerEnergy: number;
  onPlayGame: (gameIndex: number, opponents: Opponent[], event: ActiveEvent) => void;
  onSimGame: (gameIndex: number, opponents: Opponent[], event: ActiveEvent) => void;
  onSimAll: (opponents: Opponent[], event: ActiveEvent) => void;
  onExit: () => void;
  onComplete: (placement: number, prize: number, playerScores: number[], opponentScores: number[][]) => void;
  initialEvent?: ActiveEvent | null;
}

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

export function EventLobby({
  competition,
  playerAverage,
  playerEnergy,
  onPlayGame,
  onSimGame,
  onSimAll,
  onExit,
  onComplete,
  initialEvent
}: EventLobbyProps) {
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  
  useEffect(() => {
    if (initialEvent) {
      setEvent(initialEvent);
    } else {
      const opponentCount = competition.type === "league" ? 7 : 15;
      const opponents = generateOpponents(opponentCount, competition.tier);
      
      setEvent({
        competitionId: competition.id,
        competition,
        opponents,
        currentGameIndex: 0,
        playerSeriesScores: [],
        opponentSeriesScores: opponents.map(() => []),
        isComplete: false,
      });
    }
  }, [competition, initialEvent]);
  
  if (!event) return null;
  
  const gamesRemaining = competition.gamesCount - event.currentGameIndex;
  const playerTotal = event.playerSeriesScores.reduce((a, b) => a + b, 0);
  const playerGamesAvg = event.playerSeriesScores.length > 0 
    ? Math.round(playerTotal / event.playerSeriesScores.length) 
    : 0;
  
  const getStandings = () => {
    const standings: Array<{ name: string; total: number; gamesPlayed: number; avg: number; isPlayer: boolean }> = [];
    
    standings.push({
      name: "You",
      total: playerTotal,
      gamesPlayed: event.playerSeriesScores.length,
      avg: playerGamesAvg,
      isPlayer: true,
    });
    
    event.opponents.forEach((opp, idx) => {
      const scores = event.opponentSeriesScores[idx] || [];
      const total = scores.reduce((a, b) => a + b, 0);
      standings.push({
        name: `${opp.firstName} ${opp.lastName}`,
        total,
        gamesPlayed: scores.length,
        avg: scores.length > 0 ? Math.round(total / scores.length) : opp.bowlingAverage,
        isPlayer: false,
      });
    });
    
    return standings.sort((a, b) => b.total - a.total);
  };
  
  const standings = getStandings();
  const playerPosition = standings.findIndex(s => s.isPlayer) + 1;
  
  const handlePlayGame = () => {
    onPlayGame(event.currentGameIndex, event.opponents, event);
  };
  
  const handleSimGame = () => {
    const newOpponentScores = event.opponentSeriesScores.map((scores, idx) => {
      const opp = event.opponents[idx];
      const score = simulateOpponentGame(opp, competition.oilPattern);
      return [...scores, score];
    });
    
    const updatedEvent: ActiveEvent = {
      ...event,
      opponentSeriesScores: newOpponentScores,
    };
    
    setEvent(updatedEvent);
    onSimGame(event.currentGameIndex, event.opponents, updatedEvent);
  };
  
  const handleSimAll = () => {
    let newOpponentScores = [...event.opponentSeriesScores];
    
    for (let gameIdx = event.currentGameIndex; gameIdx < competition.gamesCount; gameIdx++) {
      newOpponentScores = newOpponentScores.map((scores, idx) => {
        const opp = event.opponents[idx];
        const score = simulateOpponentGame(opp, competition.oilPattern);
        return [...scores, score];
      });
    }
    
    const updatedEvent: ActiveEvent = {
      ...event,
      opponentSeriesScores: newOpponentScores,
    };
    
    setEvent(updatedEvent);
    onSimAll(event.opponents, updatedEvent);
  };
  
  const handlePlayerGameComplete = (score: number) => {
    const newPlayerScores = [...event.playerSeriesScores, score];
    const newGameIndex = event.currentGameIndex + 1;
    const isComplete = newGameIndex >= competition.gamesCount;
    
    if (isComplete) {
      const finalStandings = getStandings();
      const placement = finalStandings.findIndex(s => s.isPlayer) + 1;
      
      let prize = 0;
      if (placement === 1) prize = Math.round(competition.prizePool * 0.4);
      else if (placement === 2) prize = Math.round(competition.prizePool * 0.25);
      else if (placement === 3) prize = Math.round(competition.prizePool * 0.15);
      else if (placement <= 5) prize = Math.round(competition.prizePool * 0.05);
      
      setEvent({
        ...event,
        playerSeriesScores: newPlayerScores,
        currentGameIndex: newGameIndex,
        isComplete: true,
        finalPlacement: placement,
        prizeWon: prize,
      });
      
      onComplete(placement, prize, newPlayerScores, event.opponentSeriesScores);
    } else {
      setEvent({
        ...event,
        playerSeriesScores: newPlayerScores,
        currentGameIndex: newGameIndex,
      });
    }
  };
  
  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onExit}
          data-testid="button-exit-event"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{competition.name}</h1>
          <p className="text-sm text-muted-foreground">
            {competition.type.charAt(0).toUpperCase() + competition.type.slice(1)} - {getOilPatternLabel(competition.oilPattern)}
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold tabular-nums">{event.currentGameIndex}</p>
              <p className="text-xs text-muted-foreground">Games Played</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-primary">#{playerPosition}</p>
              <p className="text-xs text-muted-foreground">Current Position</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{gamesRemaining}</p>
              <p className="text-xs text-muted-foreground">Games Left</p>
            </div>
          </div>
          
          {event.playerSeriesScores.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Series</span>
                <span className="font-medium tabular-nums">
                  {playerTotal} ({playerGamesAvg} avg)
                </span>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {event.playerSeriesScores.map((score, idx) => (
                  <Badge key={idx} variant="secondary" className="tabular-nums">
                    {score}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!event.isComplete && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Game {event.currentGameIndex + 1} of {competition.gamesCount}
            </CardTitle>
            <CardDescription>
              Choose how to play your next game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handlePlayGame}
              data-testid="button-play-game"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Game
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="secondary"
                onClick={handleSimGame}
                data-testid="button-sim-game"
              >
                <FastForward className="w-4 h-4 mr-2" />
                Sim Game
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleSimAll}
                data-testid="button-sim-all"
              >
                <FastForward className="w-4 h-4 mr-2" />
                Sim All ({gamesRemaining})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {event.isComplete && (
        <Card className={event.finalPlacement === 1 ? "border-chart-3/50 bg-chart-3/5" : ""}>
          <CardContent className="p-6 text-center space-y-4">
            <Trophy className={`w-12 h-12 mx-auto ${event.finalPlacement === 1 ? "text-chart-3" : "text-muted-foreground"}`} />
            <div>
              <p className="text-2xl font-bold">#{event.finalPlacement} Place</p>
              <p className="text-muted-foreground">{competition.name}</p>
            </div>
            {(event.prizeWon ?? 0) > 0 && (
              <div className="p-3 bg-chart-3/10 rounded-md">
                <p className="text-xl font-bold text-chart-3">+${event.prizeWon?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Prize Money</p>
              </div>
            )}
            <Button onClick={onExit} className="w-full" data-testid="button-finish-event">
              Finish
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Standings ({event.opponents.length + 1} bowlers)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64">
            <div className="divide-y">
              {standings.map((entry, idx) => (
                <div 
                  key={entry.name}
                  className={`flex items-center justify-between p-3 ${entry.isPlayer ? "bg-primary/5" : ""}`}
                  data-testid={`standing-row-${idx}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center">
                      {idx < 3 ? (
                        <Medal className={`w-5 h-5 ${idx === 0 ? "text-yellow-500" : idx === 1 ? "text-gray-400" : "text-amber-600"}`} />
                      ) : (
                        <span className="text-sm text-muted-foreground">{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${entry.isPlayer ? "text-primary" : ""}`}>
                        {entry.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.gamesPlayed} games - {entry.avg} avg
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">{entry.total}</p>
                    <p className="text-xs text-muted-foreground">total</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
