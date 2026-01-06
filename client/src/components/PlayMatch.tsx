import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  ArrowLeft, 
  Trophy,
  User,
  Users
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { OilPattern, FrameResult, GameResult, Opponent, Competition } from "@shared/schema";
import { oilPatternDifficulty } from "@shared/schema";
import { simulateOpponentGameFrameByFrame, applyTraitToStats } from "@/lib/gameUtils";
import { CelebrationOverlay, type CelebrationType } from "@/components/CelebrationOverlay";

interface PlayMatchProps {
  competition: Competition;
  opponents: Opponent[];
  gameIndex: number;
  onComplete: (playerScore: number, opponentScore: number, allOpponentScores: number[]) => void;
  onForfeit: () => void;
}

function simulateThrow(
  pinsRemaining: number,
  stats: { accuracy: number; hookControl: number; consistency: number; revRate: number; mentalToughness: number; laneReading: number; spareShooting: number },
  ballStats: { hookPotential: number; control: number; forgiveness: number; oilHandling: number },
  oilDifficulty: number,
  frameNumber: number,
  isSpareAttempt: boolean,
  energy: number
): number {
  const energyPenalty = energy < 30 ? 0.85 : energy < 50 ? 0.93 : 1;
  const lateFrameBonus = frameNumber >= 9 ? (stats.mentalToughness / 100) * 0.1 : 0;
  const oilPenalty = 1 - (oilDifficulty * 0.08) + (stats.laneReading / 100) * 0.05;
  
  let baseChance: number;
  if (!isSpareAttempt && pinsRemaining === 10) {
    baseChance = (
      (stats.accuracy * 0.25) +
      (stats.hookControl * 0.2) +
      (stats.consistency * 0.2) +
      (stats.revRate * 0.15) +
      (ballStats.hookPotential * 3) +
      (ballStats.control * 2) +
      (ballStats.oilHandling * 1.5)
    ) / 100;
  } else {
    baseChance = (
      (stats.spareShooting * 0.35) +
      (stats.accuracy * 0.25) +
      (stats.consistency * 0.2) +
      (ballStats.control * 3) +
      (ballStats.forgiveness * 2)
    ) / 100;
  }
  
  const finalChance = baseChance * energyPenalty * oilPenalty * (1 + lateFrameBonus);
  const roll = Math.random();
  
  if (!isSpareAttempt && pinsRemaining === 10) {
    if (roll < finalChance * 0.3) {
      return 10;
    }
    const avgPins = 6 + (finalChance * 3);
    const variance = (1 - stats.consistency / 100) * 4;
    const pins = Math.round(avgPins + (Math.random() - 0.5) * variance);
    return Math.max(0, Math.min(10, pins));
  }
  
  if (roll < finalChance * 0.5) {
    return pinsRemaining;
  }
  
  const avgPins = pinsRemaining * (0.4 + finalChance * 0.5);
  const variance = (1 - stats.consistency / 100) * pinsRemaining * 0.3;
  const pins = Math.round(avgPins + (Math.random() - 0.5) * variance);
  return Math.max(0, Math.min(pinsRemaining, pins));
}

function calculateFrameScore(frames: FrameResult[], frameIndex: number): number {
  const frame = frames[frameIndex];
  if (!frame) return 0;
  
  let score = frame.throw1 + (frame.throw2 ?? 0);
  
  if (frameIndex === 9) {
    score += frame.throw3 ?? 0;
    return score;
  }
  
  if (frame.isStrike) {
    const next1 = frames[frameIndex + 1];
    if (next1) {
      score += next1.throw1;
      if (next1.isStrike && frameIndex < 8) {
        const next2 = frames[frameIndex + 2];
        if (next2) score += next2.throw1;
        else score += next1.throw2 ?? 0;
      } else {
        score += next1.throw2 ?? 0;
      }
    }
  } else if (frame.isSpare) {
    const next = frames[frameIndex + 1];
    if (next) score += next.throw1;
  }
  
  return score;
}

function calculateTotalScore(frames: FrameResult[]): number {
  let total = 0;
  for (let i = 0; i < frames.length; i++) {
    total += calculateFrameScore(frames, i);
  }
  return total;
}

export function PlayMatch({ competition, opponents, gameIndex, onComplete, onForfeit }: PlayMatchProps) {
  const { currentProfile, addGameResult, getSettings } = useGame();
  const [playerFrames, setPlayerFrames] = useState<FrameResult[]>([]);
  const [opponentFrames, setOpponentFrames] = useState<FrameResult[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [pinsRemaining, setPinsRemaining] = useState(10);
  const [throwNumber, setThrowNumber] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [allOpponentScores, setAllOpponentScores] = useState<number[]>([]);
  const [consecutiveStrikes, setConsecutiveStrikes] = useState(0);
  const [celebration, setCelebration] = useState<CelebrationType>(null);
  
  const settings = getSettings();
  
  const oilPattern = competition.oilPattern;
  const featuredOpponentIndex = gameIndex % opponents.length;
  const featuredOpponent = opponents[featuredOpponentIndex];
  const [featuredOpponentScore, setFeaturedOpponentScore] = useState<number>(0);
  
  useEffect(() => {
    const { frames, score } = simulateOpponentGameFrameByFrame(featuredOpponent, oilPattern);
    const oppFrameResults: FrameResult[] = frames.map((f, idx) => ({
      frameNumber: idx + 1,
      throw1: f.throw1,
      throw2: f.throw2,
      throw3: f.throw3,
      isStrike: f.isStrike,
      isSpare: f.isSpare,
      isOpen: !f.isStrike && !f.isSpare,
      pinsRemaining: f.isStrike ? 0 : 10 - f.throw1 - (f.throw2 ?? 0),
      frameScore: 0,
      runningTotal: 0,
    }));
    setOpponentFrames(oppFrameResults);
    setFeaturedOpponentScore(score);
  }, [featuredOpponent, oilPattern]);
  
  useEffect(() => {
    if (!settings.enableAnimations || playerFrames.length === 0) return;
    
    const lastFrame = playerFrames[playerFrames.length - 1];
    if (!lastFrame) return;
    
    if (lastFrame.isStrike) {
      const newStrikes = consecutiveStrikes + 1;
      setConsecutiveStrikes(newStrikes);
      
      if (newStrikes >= 3) {
        setCelebration("turkey");
      } else if (newStrikes === 2) {
        setCelebration("double");
      } else {
        setCelebration("strike");
      }
    } else if (lastFrame.isSpare) {
      setConsecutiveStrikes(0);
      setCelebration("spare");
    } else if (lastFrame.throw2 !== undefined) {
      setConsecutiveStrikes(0);
    }
  }, [playerFrames.length]);
  
  if (!currentProfile) return null;
  
  const activeBall = currentProfile.ownedBalls.find(b => b.id === currentProfile.activeBallId) 
    ?? currentProfile.ownedBalls[0];
  
  const playerScore = calculateTotalScore(playerFrames);
  const opponentScore = calculateTotalScore(opponentFrames);
  const scoreDiff = playerScore - opponentScore;
  
  const throwBall = useCallback(() => {
    if (!activeBall || gameComplete) return;
    
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    const oilDiff = oilPatternDifficulty[oilPattern];
    const isSpareAttempt = throwNumber > 1 && pinsRemaining < 10;
    const modifiedStats = applyTraitToStats(currentProfile.stats, currentProfile.trait, currentFrame + 1, isSpareAttempt);
    const pinsKnocked = simulateThrow(
      pinsRemaining,
      modifiedStats,
      {
        hookPotential: activeBall.hookPotential,
        control: activeBall.control,
        forgiveness: activeBall.forgiveness,
        oilHandling: activeBall.oilHandling,
      },
      oilDiff,
      currentFrame + 1,
      throwNumber > 1,
      currentProfile.energy
    );
    
    const newPinsRemaining = pinsRemaining - pinsKnocked;
    const frameNum = currentFrame + 1;
    const isTenthFrame = frameNum === 10;
    
    if (throwNumber === 1) {
      const isStrike = pinsKnocked === 10;
      
      if (isTenthFrame) {
        if (isStrike) {
          setPlayerFrames(prev => [...prev, {
            frameNumber: frameNum,
            throw1: pinsKnocked,
            isStrike: true,
            isSpare: false,
            isOpen: false,
            pinsRemaining: 0,
            frameScore: 0,
            runningTotal: 0,
          }]);
          setPinsRemaining(10);
          setThrowNumber(2);
        } else {
          setPlayerFrames(prev => [...prev, {
            frameNumber: frameNum,
            throw1: pinsKnocked,
            isStrike: false,
            isSpare: false,
            isOpen: false,
            pinsRemaining: newPinsRemaining,
            frameScore: 0,
            runningTotal: 0,
          }]);
          setPinsRemaining(newPinsRemaining);
          setThrowNumber(2);
        }
      } else if (isStrike) {
        const newFrame: FrameResult = {
          frameNumber: frameNum,
          throw1: 10,
          isStrike: true,
          isSpare: false,
          isOpen: false,
          pinsRemaining: 0,
          frameScore: 0,
          runningTotal: 0,
        };
        setPlayerFrames(prev => [...prev, newFrame]);
        setCurrentFrame(prev => prev + 1);
        setPinsRemaining(10);
        setThrowNumber(1);
      } else {
        setPinsRemaining(newPinsRemaining);
        setThrowNumber(2);
        setPlayerFrames(prev => {
          const updated = [...prev];
          updated[currentFrame] = {
            frameNumber: frameNum,
            throw1: pinsKnocked,
            isStrike: false,
            isSpare: false,
            isOpen: false,
            pinsRemaining: newPinsRemaining,
            frameScore: 0,
            runningTotal: 0,
          };
          return updated;
        });
      }
    } else if (throwNumber === 2) {
      if (isTenthFrame) {
        const prevThrow1 = playerFrames[currentFrame]?.throw1 ?? 0;
        const prevWasStrike = prevThrow1 === 10;
        const isStrikeNow = pinsKnocked === 10;
        const isSpareNow = !prevWasStrike && prevThrow1 + pinsKnocked === 10;
        
        setPlayerFrames(prev => {
          const updated = [...prev];
          updated[currentFrame] = {
            ...updated[currentFrame],
            throw2: pinsKnocked,
            isSpare: isSpareNow,
          };
          return updated;
        });
        
        if (prevWasStrike || isStrikeNow || isSpareNow) {
          setPinsRemaining(isStrikeNow || isSpareNow ? 10 : newPinsRemaining);
          setThrowNumber(3);
        } else {
          finishGame([...playerFrames.slice(0, currentFrame), {
            ...playerFrames[currentFrame],
            throw2: pinsKnocked,
            isOpen: true,
          }]);
        }
      } else {
        const throw1 = playerFrames[currentFrame]?.throw1 ?? 0;
        const isSpare = throw1 + pinsKnocked === 10;
        const isOpen = !isSpare;
        
        const newFrame: FrameResult = {
          frameNumber: frameNum,
          throw1,
          throw2: pinsKnocked,
          isStrike: false,
          isSpare,
          isOpen,
          pinsRemaining: newPinsRemaining,
          frameScore: 0,
          runningTotal: 0,
        };
        
        setPlayerFrames(prev => {
          const updated = [...prev];
          updated[currentFrame] = newFrame;
          return updated;
        });
        setCurrentFrame(prev => prev + 1);
        setPinsRemaining(10);
        setThrowNumber(1);
      }
    } else {
      setPlayerFrames(prev => {
        const updated = [...prev];
        updated[currentFrame] = {
          ...updated[currentFrame],
          throw3: pinsKnocked,
        };
        return updated;
      });
      
      finishGame([...playerFrames.slice(0, currentFrame), {
        ...playerFrames[currentFrame],
        throw3: pinsKnocked,
      }]);
    }
  }, [activeBall, currentFrame, currentProfile, playerFrames, gameComplete, oilPattern, pinsRemaining, throwNumber]);
  
  const finishGame = (finalFrames: FrameResult[]) => {
    setGameComplete(true);
    
    const finalPlayerScore = calculateTotalScore(finalFrames);
    const strikes = finalFrames.filter(f => f.isStrike).length;
    const spares = finalFrames.filter(f => f.isSpare).length;
    const opens = finalFrames.filter(f => f.isOpen).length;
    
    const gameResult: GameResult = {
      id: Date.now().toString(),
      week: currentProfile!.currentWeek,
      season: currentProfile!.currentSeason,
      score: finalPlayerScore,
      strikes,
      spares,
      opens,
      competitionId: competition.id,
      competitionName: competition.name,
      oilPattern,
      frames: finalFrames.map(f => ({
        throw1: f.throw1,
        throw2: f.throw2,
        throw3: f.throw3,
        score: f.frameScore,
      })),
    };
    
    addGameResult(gameResult);
  };
  
  const handleFinish = () => {
    const scores = opponents.map((opp, idx) => {
      if (idx === featuredOpponentIndex) {
        return featuredOpponentScore;
      }
      const { score } = simulateOpponentGameFrameByFrame(opp, oilPattern);
      return score;
    });
    setAllOpponentScores(scores);
    onComplete(playerScore, featuredOpponentScore, scores);
  };
  
  const renderMiniFrame = (frame: FrameResult | undefined, frameIndex: number, isPlayer: boolean) => {
    const isTenth = frameIndex === 9;
    
    return (
      <div 
        key={frameIndex}
        className={`
          flex flex-col border rounded-sm overflow-hidden
          ${isTenth ? "min-w-[48px]" : "min-w-[32px]"}
          ${isPlayer ? "border-primary/30" : "border-muted"}
        `}
      >
        <div className="text-[8px] text-center bg-muted/50 py-px">
          {frameIndex + 1}
        </div>
        <div className="flex items-center justify-center gap-px p-0.5 min-h-[18px]">
          {!frame ? (
            <span className="text-muted-foreground text-[10px]">—</span>
          ) : (
            <>
              <span className={`text-[10px] font-medium ${frame.isStrike ? "text-primary" : ""}`}>
                {frame.isStrike ? "X" : frame.throw1}
              </span>
              {(frame.throw2 !== undefined || !frame.isStrike || isTenth) && (
                <span className={`text-[10px] font-medium ${frame.isSpare ? "text-chart-2" : ""}`}>
                  {frame.throw2 === undefined ? "" : frame.isSpare ? "/" : 
                   (isTenth && frame.throw2 === 10) ? "X" : frame.throw2}
                </span>
              )}
              {isTenth && frame.throw3 !== undefined && (
                <span className="text-[10px] font-medium">
                  {frame.throw3 === 10 ? "X" : frame.throw3}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };
  
  const renderPins = () => {
    const knockedPins = 10 - pinsRemaining;
    const pinPositions = [
      [7, 8, 9, 10],
      [4, 5, 6],
      [2, 3],
      [1]
    ];
    
    return (
      <div className="flex flex-col items-center gap-1.5 my-3">
        {pinPositions.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map((pin) => (
              <div 
                key={pin}
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                  transition-all duration-300
                  ${pin <= knockedPins 
                    ? "bg-muted text-muted-foreground scale-75 opacity-50" 
                    : "bg-primary text-primary-foreground"
                  }
                `}
              >
                {pin}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-3 pb-24 px-4 pt-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onForfeit}
          disabled={gameStarted}
          data-testid="button-back-match"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Game {gameIndex + 1}</h1>
          <p className="text-xs text-muted-foreground">{competition.name}</p>
        </div>
      </div>
      
      <Card className={scoreDiff > 0 ? "border-chart-3/30" : scoreDiff < 0 ? "border-destructive/30" : ""}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">You</span>
            </div>
            <span className="text-xl font-bold tabular-nums text-primary" data-testid="text-player-score">
              {playerScore}
            </span>
          </div>
          
          <div className="flex gap-0.5 overflow-x-auto pb-1">
            {Array.from({ length: 10 }).map((_, i) => renderMiniFrame(playerFrames[i], i, true))}
          </div>
          
          <div className="border-t border-border my-3" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm text-muted-foreground">
                {featuredOpponent.firstName} {featuredOpponent.lastName}
              </span>
            </div>
            <span className="text-xl font-bold tabular-nums" data-testid="text-opponent-score">
              {opponentScore}
            </span>
          </div>
          
          <div className="flex gap-0.5 overflow-x-auto pb-1">
            {Array.from({ length: 10 }).map((_, i) => renderMiniFrame(opponentFrames[i], i, false))}
          </div>
          
          <div className="border-t border-border mt-3 pt-3 flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Difference:</span>
            <Badge 
              variant={scoreDiff > 0 ? "default" : scoreDiff < 0 ? "destructive" : "secondary"}
              className="tabular-nums"
            >
              {scoreDiff > 0 ? "+" : ""}{scoreDiff}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center mb-2">
            <span className="text-sm text-muted-foreground">
              {gameComplete 
                ? (playerScore > opponentScore ? "You Win!" : playerScore < opponentScore ? "You Lose" : "Tie Game")
                : `Frame ${currentFrame + 1} - Throw ${throwNumber}`
              }
            </span>
          </div>
          
          {!gameComplete && renderPins()}
          
          {!gameComplete ? (
            <Button 
              className="w-full" 
              size="lg"
              onClick={throwBall}
              data-testid="button-throw-match"
            >
              <Target className="w-4 h-4 mr-2" />
              Throw Ball
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-md text-center">
                {playerScore > opponentScore ? (
                  <div className="flex items-center justify-center gap-2 text-chart-3">
                    <Trophy className="w-6 h-6" />
                    <span className="text-xl font-bold">Victory!</span>
                  </div>
                ) : playerScore < opponentScore ? (
                  <div className="text-muted-foreground">
                    <span className="text-xl font-bold">Better luck next time</span>
                  </div>
                ) : (
                  <div className="text-yellow-500">
                    <span className="text-xl font-bold">Tie Game!</span>
                  </div>
                )}
                <p className="text-sm mt-2">
                  {playerScore} - {opponentScore}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleFinish}
                data-testid="button-finish-match"
              >
                Continue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <CelebrationOverlay 
        type={celebration}
        onComplete={() => setCelebration(null)}
        enabled={settings.enableAnimations}
      />
    </div>
  );
}
