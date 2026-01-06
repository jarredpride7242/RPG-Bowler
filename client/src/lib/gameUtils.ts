import type { BowlingBall, OilPattern, PlayerStats, Sponsor, Opponent, Competition, BowlingStyle, Handedness } from "@shared/schema";
import { oilPatternDifficulty, GAME_CONSTANTS } from "@shared/schema";

type CompetitionTier = Competition['tier'];

// ============================================
// BOWLING SIMULATION UTILITIES
// ============================================

/**
 * Calculate strike probability based on player stats, ball, and conditions
 */
export function calculateStrikeProbability(
  stats: PlayerStats,
  ball: BowlingBall,
  oilPattern: OilPattern,
  frameNumber: number,
  energy: number
): number {
  const oilDiff = oilPatternDifficulty[oilPattern];
  
  // Base strike chance from stats (0-1)
  const statFactor = (
    stats.accuracy * 0.25 +
    stats.hookControl * 0.2 +
    stats.consistency * 0.2 +
    stats.revRate * 0.15 +
    stats.laneReading * 0.2
  ) / 100;
  
  // Ball factor
  const ballFactor = (
    ball.hookPotential * 0.3 +
    ball.control * 0.3 +
    ball.oilHandling * 0.2 +
    ball.forgiveness * 0.2
  ) / 10;
  
  // Energy penalty (0.8-1.0)
  const energyMod = 0.8 + (Math.min(energy, 100) / 100) * 0.2;
  
  // Oil difficulty penalty (0.7-1.0)
  const oilMod = 1 - (oilDiff - 1) * 0.1;
  
  // Late frame mental bonus
  const mentalMod = frameNumber >= 9 ? 1 + (stats.mentalToughness / 100) * 0.15 : 1;
  
  return Math.min(0.5, statFactor * ballFactor * energyMod * oilMod * mentalMod);
}

/**
 * Calculate spare probability
 */
export function calculateSpareProbability(
  stats: PlayerStats,
  ball: BowlingBall,
  pinsRemaining: number,
  energy: number
): number {
  const baseFactor = (
    stats.spareShooting * 0.4 +
    stats.accuracy * 0.3 +
    stats.consistency * 0.3
  ) / 100;
  
  const ballFactor = (ball.control * 0.5 + ball.forgiveness * 0.5) / 10;
  const energyMod = 0.85 + (Math.min(energy, 100) / 100) * 0.15;
  
  // Harder with more pins
  const pinMod = 1 - (pinsRemaining - 1) * 0.03;
  
  return Math.min(0.85, baseFactor * ballFactor * energyMod * pinMod);
}

/**
 * Simulate a single throw and return pins knocked down
 */
export function simulateThrow(
  pinsRemaining: number,
  isSpareAttempt: boolean,
  stats: PlayerStats,
  ball: BowlingBall,
  oilPattern: OilPattern,
  frameNumber: number,
  energy: number
): number {
  const roll = Math.random();
  
  if (!isSpareAttempt && pinsRemaining === 10) {
    // First throw - chance for strike
    const strikeProb = calculateStrikeProbability(stats, ball, oilPattern, frameNumber, energy);
    
    if (roll < strikeProb) {
      return 10; // Strike!
    }
    
    // Not a strike - calculate pins based on stats
    const avgPins = 5 + (stats.accuracy / 100) * 3 + (stats.consistency / 100) * 2;
    const variance = (1 - stats.consistency / 100) * 4;
    const pins = Math.round(avgPins + (Math.random() - 0.5) * variance);
    return Math.max(0, Math.min(9, pins));
  }
  
  // Spare attempt
  const spareProb = calculateSpareProbability(stats, ball, pinsRemaining, energy);
  
  if (roll < spareProb) {
    return pinsRemaining; // Spare!
  }
  
  // Missed spare - calculate pins
  const avgPins = pinsRemaining * (0.4 + (stats.spareShooting / 100) * 0.4);
  const variance = (1 - stats.consistency / 100) * pinsRemaining * 0.3;
  const pins = Math.round(avgPins + (Math.random() - 0.5) * variance);
  return Math.max(0, Math.min(pinsRemaining - 1, pins));
}

// ============================================
// TRAINING CALCULATIONS
// ============================================

/**
 * Calculate stat gain from training with diminishing returns
 */
export function calculateTrainingGain(currentStat: number, trainingIntensity: number = 1): number {
  // Higher stats = less gain (diminishing returns)
  const diminishingFactor = Math.max(0.1, (100 - currentStat) / 100);
  const baseGain = 1 + Math.floor(Math.random() * 2);
  return Math.max(1, Math.round(baseGain * diminishingFactor * trainingIntensity));
}

/**
 * Calculate energy cost for training with training intensity
 */
export function calculateTrainingEnergyCost(baseCost: number, consecutiveTrains: number): number {
  // Training costs more energy with consecutive sessions
  return Math.round(baseCost * (1 + consecutiveTrains * 0.1));
}

// ============================================
// SPONSOR UTILITIES
// ============================================

export const AVAILABLE_SPONSORS: Sponsor[] = [
  {
    id: "local-lanes",
    name: "Local Lanes Bowling",
    weeklyPay: 100,
    minAverage: 180,
    minReputation: 20,
    contractWeeks: 12,
  },
  {
    id: "strike-gear",
    name: "Strike Gear Equipment",
    weeklyPay: 200,
    minAverage: 195,
    minReputation: 35,
    contractWeeks: 24,
  },
  {
    id: "pro-ball-co",
    name: "Pro Ball Company",
    weeklyPay: 350,
    minAverage: 205,
    minReputation: 50,
    contractWeeks: 52,
  },
  {
    id: "national-bowling",
    name: "National Bowling Association",
    weeklyPay: 500,
    minAverage: 215,
    minReputation: 70,
    contractWeeks: 52,
  },
  {
    id: "elite-bowlers",
    name: "Elite Bowlers League",
    weeklyPay: 750,
    minAverage: 225,
    minReputation: 85,
    contractWeeks: 104,
  },
];

/**
 * Check if player qualifies for a sponsor
 */
export function canGetSponsor(
  sponsor: Sponsor,
  playerAverage: number,
  reputation: number,
  isProfessional: boolean
): boolean {
  if (!isProfessional) return false;
  if (playerAverage < sponsor.minAverage) return false;
  if (reputation < sponsor.minReputation) return false;
  return true;
}

// ============================================
// BALL NAME GENERATION
// ============================================

const BALL_PREFIXES = [
  "Thunder", "Storm", "Cyclone", "Vortex", "Blaze", 
  "Shadow", "Phantom", "Titan", "Apex", "Quantum",
  "Fusion", "Nitro", "Hyper", "Ultra", "Mega",
  "Power", "Fury", "Rush", "Blitz", "Flash"
];

const BALL_SUFFIXES = [
  "Strike", "Fury", "Force", "Rush", "Wave", 
  "Core", "Pro", "Elite", "Master", "X",
  "Zone", "Max", "Plus", "Prime", "Edge"
];

export function generateBallName(): string {
  const prefix = BALL_PREFIXES[Math.floor(Math.random() * BALL_PREFIXES.length)];
  const suffix = BALL_SUFFIXES[Math.floor(Math.random() * BALL_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

// ============================================
// SCORE CALCULATIONS
// ============================================

/**
 * Calculate the score for a complete game from frame data
 */
export function calculateGameScore(frames: Array<{ 
  throw1: number; 
  throw2?: number; 
  throw3?: number;
  isStrike: boolean;
  isSpare: boolean;
}>): number {
  let total = 0;
  
  for (let i = 0; i < Math.min(frames.length, 10); i++) {
    const frame = frames[i];
    let frameScore = frame.throw1 + (frame.throw2 ?? 0);
    
    if (i === 9) {
      // 10th frame
      frameScore += frame.throw3 ?? 0;
    } else if (frame.isStrike) {
      // Strike bonus
      const next = frames[i + 1];
      if (next) {
        frameScore += next.throw1;
        if (next.isStrike && i < 8) {
          const nextNext = frames[i + 2];
          if (nextNext) {
            frameScore += nextNext.throw1;
          } else {
            frameScore += next.throw2 ?? 0;
          }
        } else {
          frameScore += next.throw2 ?? 0;
        }
      }
    } else if (frame.isSpare) {
      // Spare bonus
      const next = frames[i + 1];
      if (next) {
        frameScore += next.throw1;
      }
    }
    
    total += frameScore;
  }
  
  return total;
}

// ============================================
// DATE FORMATTING
// ============================================

export function formatSaveDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ============================================
// OPPONENT GENERATION
// ============================================

const FIRST_NAMES = [
  "Mike", "John", "Chris", "Dave", "Brian", "Steve", "Tom", "Matt", "Dan", "Pete",
  "Jason", "Ryan", "Kevin", "Eric", "Mark", "Jeff", "Scott", "Tim", "Nick", "Kyle",
  "Sarah", "Lisa", "Kelly", "Amy", "Michelle", "Karen", "Lauren", "Ashley", "Emily", "Jessica",
  "Alex", "Jordan", "Casey", "Taylor", "Morgan", "Sam", "Pat", "Drew", "Jamie", "Robin"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson",
  "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White",
  "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Perez", "Hall",
  "Young", "Allen", "Sanchez", "Wright", "King", "Scott", "Green", "Baker", "Adams", "Nelson"
];

function generateOpponentName(): { firstName: string; lastName: string } {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return { firstName, lastName };
}

function generateOpponentStats(tier: CompetitionTier): PlayerStats {
  const skillRange = GAME_CONSTANTS.OPPONENT_SKILL_BY_TIER[tier] || 
    GAME_CONSTANTS.OPPONENT_SKILL_BY_TIER["amateur-local"];
  
  const { statMin, statMax } = skillRange;
  
  const randomStat = () => Math.floor(statMin + Math.random() * (statMax - statMin));
  
  return {
    throwPower: randomStat(),
    accuracy: randomStat(),
    hookControl: randomStat(),
    revRate: randomStat(),
    speedControl: randomStat(),
    consistency: randomStat(),
    spareShooting: randomStat(),
    mentalToughness: randomStat(),
    laneReading: randomStat(),
    equipmentKnowledge: randomStat(),
    stamina: randomStat(),
    charisma: randomStat(),
    reputation: Math.floor(Math.random() * 50),
  };
}

function generateOpponentAverage(tier: CompetitionTier): number {
  const skillRange = GAME_CONSTANTS.OPPONENT_SKILL_BY_TIER[tier] || 
    GAME_CONSTANTS.OPPONENT_SKILL_BY_TIER["amateur-local"];
  
  const { avgMin, avgMax } = skillRange;
  return Math.floor(avgMin + Math.random() * (avgMax - avgMin));
}

export function generateOpponent(tier: CompetitionTier): Opponent {
  const { firstName, lastName } = generateOpponentName();
  const styles: BowlingStyle[] = ["one-handed", "two-handed"];
  const hands: Handedness[] = ["left", "right"];
  
  return {
    id: `opp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    firstName,
    lastName,
    bowlingStyle: styles[Math.floor(Math.random() * styles.length)],
    handedness: hands[Math.floor(Math.random() * hands.length)],
    stats: generateOpponentStats(tier),
    bowlingAverage: generateOpponentAverage(tier),
    currentSeriesScore: 0,
    gamesPlayed: 0,
  };
}

export function generateOpponents(count: number, tier: CompetitionTier): Opponent[] {
  const usedNames = new Set<string>();
  const opponents: Opponent[] = [];
  
  while (opponents.length < count) {
    const opponent = generateOpponent(tier);
    const fullName = `${opponent.firstName} ${opponent.lastName}`;
    
    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      opponents.push(opponent);
    }
  }
  
  return opponents;
}

// ============================================
// OPPONENT GAME SIMULATION
// ============================================

export function simulateOpponentGame(
  opponent: Opponent,
  oilPattern: OilPattern
): number {
  const oilDiff = oilPatternDifficulty[oilPattern];
  
  // Base score from opponent average with variance
  const baseScore = opponent.bowlingAverage;
  const variance = GAME_CONSTANTS.UPSET_FACTOR * 40; // +/- range
  const oilPenalty = (oilDiff - 1) * 5;
  
  const score = baseScore + (Math.random() - 0.5) * variance * 2 - oilPenalty;
  return Math.round(Math.max(80, Math.min(300, score)));
}

// Create a default ball for opponents to use in simulation
function getDefaultOpponentBall(): BowlingBall {
  return {
    id: "opponent-ball",
    name: "Opponent Ball",
    type: "reactive-solid",
    coreType: "symmetric",
    hookPotential: 5,
    control: 5,
    backendReaction: 5,
    oilHandling: 5,
    forgiveness: 5,
    price: 0,
    owned: true,
  };
}

export function simulateOpponentGameFrameByFrame(
  opponent: Opponent,
  oilPattern: OilPattern
): { frames: Array<{ throw1: number; throw2?: number; throw3?: number; isStrike: boolean; isSpare: boolean }>; score: number } {
  const frames: Array<{ throw1: number; throw2?: number; throw3?: number; isStrike: boolean; isSpare: boolean }> = [];
  const ball = getDefaultOpponentBall();
  
  for (let frameNum = 1; frameNum <= 10; frameNum++) {
    const isTenthFrame = frameNum === 10;
    let pinsRemaining = 10;
    
    // First throw
    const throw1 = simulateThrow(pinsRemaining, false, opponent.stats, ball, oilPattern, frameNum, 100);
    pinsRemaining -= throw1;
    
    if (isTenthFrame) {
      if (throw1 === 10) {
        // Strike in 10th - get 2 more throws
        pinsRemaining = 10;
        const throw2 = simulateThrow(pinsRemaining, false, opponent.stats, ball, oilPattern, frameNum, 100);
        pinsRemaining = throw2 === 10 ? 10 : 10 - throw2;
        const throw3 = simulateThrow(pinsRemaining, throw2 !== 10, opponent.stats, ball, oilPattern, frameNum, 100);
        frames.push({ throw1, throw2, throw3, isStrike: true, isSpare: false });
      } else {
        // Not a strike - try for spare
        const throw2 = simulateThrow(pinsRemaining, true, opponent.stats, ball, oilPattern, frameNum, 100);
        if (throw1 + throw2 === 10) {
          // Spare - get 1 more throw
          const throw3 = simulateThrow(10, false, opponent.stats, ball, oilPattern, frameNum, 100);
          frames.push({ throw1, throw2, throw3, isStrike: false, isSpare: true });
        } else {
          frames.push({ throw1, throw2, isStrike: false, isSpare: false });
        }
      }
    } else {
      if (throw1 === 10) {
        frames.push({ throw1, isStrike: true, isSpare: false });
      } else {
        const throw2 = simulateThrow(pinsRemaining, true, opponent.stats, ball, oilPattern, frameNum, 100);
        const isSpare = throw1 + throw2 === 10;
        frames.push({ throw1, throw2, isStrike: false, isSpare });
      }
    }
  }
  
  const score = calculateGameScore(frames);
  return { frames, score };
}
