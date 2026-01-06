import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Zap, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { OilPattern, FrameResult, GameResult } from "@shared/schema";
import { oilPatternDifficulty, GAME_CONSTANTS } from "@shared/schema";

const OIL_PATTERNS: { value: OilPattern; label: string; difficulty: number }[] = [
  { value: "house", label: "House Shot", difficulty: 1 },
  { value: "short", label: "Short Oil", difficulty: 2 },
  { value: "dry", label: "Dry Lanes", difficulty: 2 },
  { value: "long", label: "Long Oil", difficulty: 3 },
  { value: "heavy", label: "Heavy Oil", difficulty: 3 },
  { value: "sport", label: "Sport Pattern", difficulty: 4 },
];

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

export function BowlScreen() {
  const { currentProfile, useEnergy, addGameResult, updateProfile } = useGame();
  const [oilPattern, setOilPattern] = useState<OilPattern>("house");
  const [frames, setFrames] = useState<FrameResult[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [pinsRemaining, setPinsRemaining] = useState(10);
  const [throwNumber, setThrowNumber] = useState(1);
  
  if (!currentProfile) return null;
  
  const activeBall = currentProfile.ownedBalls.find(b => b.id === currentProfile.activeBallId) 
    ?? currentProfile.ownedBalls[0];
  
  const startGame = () => {
    if (!useEnergy(10)) return;
    setFrames([]);
    setCurrentFrame(0);
    setPinsRemaining(10);
    setThrowNumber(1);
    setIsPlaying(true);
    setGameComplete(false);
  };
  
  const throwBall = useCallback(() => {
    if (!activeBall || gameComplete) return;
    
    const oilDiff = oilPatternDifficulty[oilPattern];
    const pinsKnocked = simulateThrow(
      pinsRemaining,
      currentProfile.stats,
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
          setFrames(prev => [...prev, {
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
          setFrames(prev => [...prev, {
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
        setFrames(prev => [...prev, newFrame]);
        setCurrentFrame(prev => prev + 1);
        setPinsRemaining(10);
        setThrowNumber(1);
      } else {
        setPinsRemaining(newPinsRemaining);
        setThrowNumber(2);
        setFrames(prev => {
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
        const prevThrow1 = frames[currentFrame]?.throw1 ?? 0;
        const prevWasStrike = prevThrow1 === 10;
        const isStrikeNow = pinsKnocked === 10;
        const isSpareNow = !prevWasStrike && prevThrow1 + pinsKnocked === 10;
        
        setFrames(prev => {
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
          finishGame([...frames.slice(0, currentFrame), {
            ...frames[currentFrame],
            throw2: pinsKnocked,
            isOpen: true,
          }]);
        }
      } else {
        const throw1 = frames[currentFrame]?.throw1 ?? 0;
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
        
        setFrames(prev => {
          const updated = [...prev];
          updated[currentFrame] = newFrame;
          return updated;
        });
        setCurrentFrame(prev => prev + 1);
        setPinsRemaining(10);
        setThrowNumber(1);
      }
    } else {
      setFrames(prev => {
        const updated = [...prev];
        updated[currentFrame] = {
          ...updated[currentFrame],
          throw3: pinsKnocked,
        };
        return updated;
      });
      
      finishGame([...frames.slice(0, currentFrame), {
        ...frames[currentFrame],
        throw3: pinsKnocked,
      }]);
    }
  }, [activeBall, currentFrame, currentProfile, frames, gameComplete, oilPattern, pinsRemaining, throwNumber, useEnergy]);
  
  const finishGame = (finalFrames: FrameResult[]) => {
    setGameComplete(true);
    setIsPlaying(false);
    
    let totalScore = 0;
    for (let i = 0; i < finalFrames.length; i++) {
      totalScore += calculateFrameScore(finalFrames, i);
    }
    
    const strikes = finalFrames.filter(f => f.isStrike).length;
    const spares = finalFrames.filter(f => f.isSpare).length;
    const opens = finalFrames.filter(f => f.isOpen).length;
    
    const gameResult: GameResult = {
      id: Date.now().toString(),
      week: currentProfile!.currentWeek,
      season: currentProfile!.currentSeason,
      score: totalScore,
      strikes,
      spares,
      opens,
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
  
  const calculateCurrentScore = () => {
    let total = 0;
    for (let i = 0; i <= Math.min(currentFrame, frames.length - 1); i++) {
      total += calculateFrameScore(frames, i);
    }
    return total;
  };
  
  const resetGame = () => {
    setFrames([]);
    setCurrentFrame(0);
    setPinsRemaining(10);
    setThrowNumber(1);
    setIsPlaying(false);
    setGameComplete(false);
  };
  
  const renderFrame = (frameIndex: number) => {
    const frame = frames[frameIndex];
    const isActive = frameIndex === currentFrame && isPlaying && !gameComplete;
    const isTenth = frameIndex === 9;
    
    return (
      <div 
        key={frameIndex}
        className={`
          flex flex-col border rounded-md overflow-hidden transition-all
          ${isActive ? "border-primary ring-2 ring-primary/20" : "border-border"}
          ${isTenth ? "min-w-[80px]" : "min-w-[56px]"}
        `}
      >
        <div className="text-[10px] text-center bg-muted/50 py-0.5 font-medium">
          {frameIndex + 1}
        </div>
        <div className={`flex items-center justify-center gap-px p-1 ${isTenth ? "min-h-[28px]" : "min-h-[24px]"}`}>
          {!frame ? (
            <span className="text-muted-foreground text-xs">—</span>
          ) : (
            <>
              <span className={`text-xs font-medium w-4 text-center ${frame.isStrike ? "text-primary" : ""}`}>
                {frame.isStrike ? "X" : frame.throw1}
              </span>
              {(frame.throw2 !== undefined || !frame.isStrike || isTenth) && (
                <span className={`text-xs font-medium w-4 text-center ${frame.isSpare ? "text-chart-2" : ""}`}>
                  {frame.throw2 === undefined ? "—" : frame.isSpare ? "/" : 
                   (isTenth && frame.throw2 === 10) ? "X" : frame.throw2}
                </span>
              )}
              {isTenth && frame.throw3 !== undefined && (
                <span className="text-xs font-medium w-4 text-center">
                  {frame.throw3 === 10 ? "X" : frame.throw3}
                </span>
              )}
            </>
          )}
        </div>
        <div className="text-center py-1 border-t border-border bg-card text-sm font-semibold tabular-nums">
          {frame ? calculateFrameScore(frames, frameIndex) || "—" : "—"}
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
      <div className="flex flex-col items-center gap-2 my-4">
        {pinPositions.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-3 justify-center">
            {row.map((pin) => (
              <div 
                key={pin}
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
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
    <div className="space-y-4 pb-24 px-4 pt-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Practice Lane</h1>
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          10 energy
        </Badge>
      </div>
      
      {!isPlaying && !gameComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Lane Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Oil Pattern</label>
              <Select value={oilPattern} onValueChange={(v) => setOilPattern(v as OilPattern)}>
                <SelectTrigger data-testid="select-oil-pattern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OIL_PATTERNS.map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      <span className="flex items-center justify-between gap-4">
                        {pattern.label}
                        <Badge variant="secondary" className="text-xs">
                          {"★".repeat(pattern.difficulty)}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Active Ball</label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{activeBall?.name ?? "No ball selected"}</p>
                {activeBall && (
                  <p className="text-xs text-muted-foreground capitalize">
                    {activeBall.type} | {activeBall.coreType}
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={startGame}
              disabled={currentProfile.energy < 10}
              data-testid="button-start-game"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Practice Game
            </Button>
          </CardContent>
        </Card>
      )}
      
      {(isPlaying || gameComplete) && (
        <>
          <Card>
            <CardContent className="p-3">
              <div className="flex overflow-x-auto gap-1 pb-2">
                {Array.from({ length: 10 }).map((_, i) => renderFrame(i))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Total Score</span>
                <span className="text-2xl font-bold tabular-nums" data-testid="text-score">
                  {calculateCurrentScore()}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-2">
                <span className="text-sm text-muted-foreground">
                  {gameComplete 
                    ? "Game Complete!" 
                    : `Frame ${currentFrame + 1} - Throw ${throwNumber}`
                  }
                </span>
              </div>
              
              {renderPins()}
              
              {!gameComplete ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={throwBall}
                  data-testid="button-throw"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Throw Ball
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-xl font-bold text-primary">{frames.filter(f => f.isStrike).length}</p>
                      <p className="text-xs text-muted-foreground">Strikes</p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-xl font-bold text-chart-2">{frames.filter(f => f.isSpare).length}</p>
                      <p className="text-xs text-muted-foreground">Spares</p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-xl font-bold text-muted-foreground">{frames.filter(f => f.isOpen).length}</p>
                      <p className="text-xs text-muted-foreground">Opens</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={resetGame}
                    data-testid="button-new-game"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Game
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
