import type { BowlingBall, OilPattern, PlayerStats } from "@shared/schema";
import { oilPatternDifficulty } from "@shared/schema";

// ============================================
// TUNING CONSTANTS - Adjust these to modify gameplay balance
// ============================================

export const BOWLING_TUNING = {
  // Strike/Pocket chances
  BASE_STRIKE_CHANCE: 0.08,        // Base strike chance before modifiers (8%)
  MAX_STRIKE_CHANCE: 0.55,         // Cap for elite players (55%)
  POCKET_HIT_CHANCE: 0.65,         // Chance of hitting pocket when not strike
  CARRY_FACTOR: 0.15,              // How much stats improve pin carry
  
  // Pin leave distributions  
  SPLIT_CHANCE: 0.12,              // Base chance of split when missing pocket
  CORNER_PIN_CHANCE: 0.35,         // Chance of leaving corner pins (7 or 10)
  WASHOUT_CHANCE: 0.08,            // Chance of washout (head pin + corner)
  
  // Error/variance
  ERROR_VARIANCE: 0.25,            // How much randomness affects outcomes
  GUTTER_CHANCE_BASE: 0.02,        // Base chance of gutter ball
  LIGHT_HIT_CHANCE: 0.15,          // Chance of light hit (1-6 pins)
  
  // Spare difficulties by pin count
  SPARE_BASE_CHANCE: 0.75,         // Base spare conversion rate
  SPLIT_SPARE_PENALTY: 0.5,        // Multiplier for split conversion (much harder)
  CORNER_SPARE_PENALTY: 0.85,      // Multiplier for corner pin spares
  
  // Fatigue effects
  LOW_ENERGY_THRESHOLD: 30,
  MED_ENERGY_THRESHOLD: 50,
  LOW_ENERGY_PENALTY: 0.80,
  MED_ENERGY_PENALTY: 0.92,
  
  // Oil pattern modifiers
  OIL_SPLIT_MODIFIER: 0.04,        // Additional split chance per difficulty level
  OIL_CORNER_MODIFIER: 0.03,       // Additional corner pin chance per difficulty
} as const;

// ============================================
// PIN LAYOUT - Standard 10-pin bowling
// ============================================
//       7  8  9  10
//         4  5  6
//           2  3
//             1
// Pin numbers: 1 = headpin, 7 = left back corner, 10 = right back corner

// Common pin leave patterns with their frequencies
// Format: [pins left standing, relative weight, isSplit]
const POCKET_LEAVES: Array<[number[], number, boolean]> = [
  // Perfect pocket but no carry (single pins)
  [[10], 20, false],              // 10-pin (most common for right-handers)
  [[7], 8, false],                // 7-pin (left corner)
  [[4], 5, false],                // 4-pin 
  [[6], 3, false],                // 6-pin
  [[9], 2, false],                // 9-pin
  [[8], 2, false],                // 8-pin
  
  // Two-pin leaves (non-splits)
  [[5, 7], 4, false],             // 5-7
  [[3, 10], 3, false],            // 3-10 (baby split for some, tough leave)
  [[2, 4], 2, false],             // 2-4
  [[5, 10], 2, false],            // 5-10
  [[3, 6], 2, false],             // 3-6
  [[2, 5], 1, false],             // 2-5
  
  // Three-pin leaves
  [[3, 6, 10], 3, false],         // 3-6-10
  [[2, 4, 5], 2, false],          // 2-4-5
  [[1, 2, 4], 2, false],          // 1-2-4 (bucket)
  [[1, 2, 10], 1, false],         // 1-2-10 washout
  [[2, 8], 1, false],             // 2-8
  
  // Rare pocket splits (light hits)
  [[4, 6], 1, true],              // 4-6 split (rare from pocket)
];

// Off-pocket/light hit leaves (when ball doesn't hit pocket well)
const LIGHT_HIT_LEAVES: Array<[number[], number, boolean]> = [
  // Deflection leaves
  [[1, 2, 4, 7], 5, false],       // Heavy left
  [[1, 3, 6, 10], 5, false],      // Heavy right
  [[1, 2, 8], 3, false],          // Left side deflection
  [[1, 3, 9], 3, false],          // Right side deflection
  [[1, 5], 4, false],             // Head pin + 5
  [[1, 2, 4, 10], 2, false],      // Washout
  [[1, 3, 6, 7], 2, false],       // Reverse washout
  
  // More pins left
  [[1, 2, 4, 5, 7], 2, false],    // 5-pin bucket
  [[1, 3, 5, 6, 10], 2, false],   // Right side cluster
  [[2, 4, 5, 8], 2, false],       // Left side cluster
  [[3, 5, 6, 9], 2, false],       // Right side cluster
];

// Split patterns (when ball misses pocket badly or deflects wrong)
const SPLIT_LEAVES: Array<[number[], number, boolean]> = [
  // Common splits
  [[4, 6], 15, true],             // 4-6 split
  [[3, 10], 12, true],            // 3-10 baby split
  [[2, 7], 10, true],             // 2-7 split
  [[4, 10], 8, true],             // 4-10 split
  [[6, 7], 6, true],              // 6-7 split
  [[4, 7, 10], 5, true],          // 4-7-10 split
  [[3, 7], 5, true],              // 3-7 split
  [[5, 7], 5, true],              // 5-7 split
  [[5, 10], 4, true],             // 5-10 split
  [[4, 6, 7, 10], 3, true],       // Big 4 split
  
  // Rare devastating splits
  [[7, 10], 2, true],             // 7-10 split (most difficult)
  [[7, 9], 2, true],              // 7-9 split
  [[8, 10], 2, true],             // 8-10 split
  [[4, 6, 7, 9, 10], 1, true],    // Greek church
  [[7, 6, 10], 2, true],          // Sour apple
];

// Very bad shots (gutter-adjacent or very poor accuracy)
const BAD_SHOT_LEAVES: Array<[number[], number, boolean]> = [
  [[1, 2, 3, 4, 5, 6, 7], 3, false],   // Only back 3 knocked down
  [[1, 2, 3, 4, 5, 6], 4, false],      // 4 pins down
  [[1, 2, 4, 5, 7, 8], 3, false],      // Left side miss
  [[1, 3, 5, 6, 9, 10], 3, false],     // Right side miss
  [[2, 3, 4, 5, 6], 2, false],         // Head pin + some
  [[7, 8, 9, 10], 2, false],           // Only front 6 knocked
  [[4, 5, 6, 7, 8, 9, 10], 1, false],  // Very weak hit
];

// ============================================
// SIMULATION RESULT TYPES
// ============================================

export interface PinResult {
  pinsKnocked: number;
  pinsRemaining: number[];
  isSplit: boolean;
  isGutter: boolean;
  description?: string;
}

export interface ThrowParams {
  pinsStanding: number[];       // Which pins are currently standing
  stats: PlayerStats;
  ball: BowlingBall;
  oilPattern: OilPattern;
  frameNumber: number;
  energy: number;
  isSpareAttempt: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function weightedRandomSelect<T>(items: Array<[T, number, boolean]>): [T, boolean] {
  const totalWeight = items.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [item, weight, isSplit] of items) {
    random -= weight;
    if (random <= 0) {
      return [item, isSplit];
    }
  }
  
  return [items[0][0], items[0][2]];
}

function calculateSkillFactor(stats: PlayerStats, ball: BowlingBall): number {
  return (
    stats.accuracy * 0.25 +
    stats.hookControl * 0.20 +
    stats.consistency * 0.20 +
    stats.revRate * 0.10 +
    stats.laneReading * 0.15 +
    (ball.hookPotential + ball.control + ball.oilHandling) * 0.5
  ) / 100;
}

function calculateEnergyMod(energy: number): number {
  if (energy < BOWLING_TUNING.LOW_ENERGY_THRESHOLD) {
    return BOWLING_TUNING.LOW_ENERGY_PENALTY;
  }
  if (energy < BOWLING_TUNING.MED_ENERGY_THRESHOLD) {
    return BOWLING_TUNING.MED_ENERGY_PENALTY;
  }
  return 1.0;
}

function calculateOilMod(oilPattern: OilPattern): number {
  const diff = oilPatternDifficulty[oilPattern];
  return 1 - (diff - 1) * 0.08;
}

// ============================================
// MAIN SIMULATION FUNCTIONS
// ============================================

/**
 * Simulate a first ball throw (all 10 pins standing)
 */
export function simulateFirstBall(params: ThrowParams): PinResult {
  const { stats, ball, oilPattern, frameNumber, energy } = params;
  const oilDiff = oilPatternDifficulty[oilPattern];
  
  const skillFactor = calculateSkillFactor(stats, ball);
  const energyMod = calculateEnergyMod(energy);
  const oilMod = calculateOilMod(oilPattern);
  const mentalMod = frameNumber >= 9 ? 1 + (stats.mentalToughness / 100) * 0.12 : 1;
  
  // Calculate strike probability
  const strikeChance = Math.min(
    BOWLING_TUNING.MAX_STRIKE_CHANCE,
    BOWLING_TUNING.BASE_STRIKE_CHANCE + 
    skillFactor * BOWLING_TUNING.CARRY_FACTOR * 3 * energyMod * oilMod * mentalMod
  );
  
  // Check for strike
  if (Math.random() < strikeChance) {
    return {
      pinsKnocked: 10,
      pinsRemaining: [],
      isSplit: false,
      isGutter: false,
      description: "Strike!"
    };
  }
  
  // Calculate pocket hit probability
  const pocketChance = BOWLING_TUNING.POCKET_HIT_CHANCE * skillFactor * energyMod * oilMod;
  const hitsPocket = Math.random() < pocketChance;
  
  // Check for gutter ball (rare for skilled players)
  const gutterChance = BOWLING_TUNING.GUTTER_CHANCE_BASE * (1 - skillFactor) * (1 / energyMod);
  if (Math.random() < gutterChance) {
    return {
      pinsKnocked: 0,
      pinsRemaining: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      isSplit: false,
      isGutter: true,
      description: "Gutter ball"
    };
  }
  
  // Calculate light hit chance (very poor accuracy)
  const lightHitChance = BOWLING_TUNING.LIGHT_HIT_CHANCE * (1 - skillFactor * 0.8);
  const isLightHit = !hitsPocket && Math.random() < lightHitChance;
  
  // Calculate split chance
  let splitChance = BOWLING_TUNING.SPLIT_CHANCE;
  splitChance += (oilDiff - 1) * BOWLING_TUNING.OIL_SPLIT_MODIFIER;
  splitChance *= (1 - skillFactor * 0.6); // Skilled players split less
  splitChance *= ball.hookPotential > 7 ? 1.15 : 1; // Aggressive balls can cause splits
  
  // Determine outcome type
  let leavePool: Array<[number[], number, boolean]>;
  
  if (isLightHit) {
    // Very poor shot - many pins left
    if (Math.random() < 0.3) {
      leavePool = BAD_SHOT_LEAVES;
    } else {
      leavePool = LIGHT_HIT_LEAVES;
    }
  } else if (!hitsPocket && Math.random() < splitChance) {
    // Missed pocket and got a split
    leavePool = SPLIT_LEAVES;
  } else if (hitsPocket) {
    // Good pocket hit but didn't strike
    leavePool = POCKET_LEAVES;
  } else {
    // Off-pocket but not a split
    if (Math.random() < 0.4) {
      leavePool = LIGHT_HIT_LEAVES;
    } else {
      leavePool = POCKET_LEAVES;
    }
  }
  
  // Select a leave pattern
  const [pinsRemaining, isSplit] = weightedRandomSelect(leavePool);
  const pinsKnocked = 10 - pinsRemaining.length;
  
  return {
    pinsKnocked,
    pinsRemaining,
    isSplit,
    isGutter: false,
    description: isSplit ? "Split!" : pinsKnocked >= 8 ? "Good shot" : "Off target"
  };
}

/**
 * Simulate a spare attempt
 */
export function simulateSpareBall(params: ThrowParams): PinResult {
  const { pinsStanding, stats, ball, energy } = params;
  const pinCount = pinsStanding.length;
  
  if (pinCount === 0) {
    return { pinsKnocked: 0, pinsRemaining: [], isSplit: false, isGutter: false };
  }
  
  const energyMod = calculateEnergyMod(energy);
  
  // Calculate base spare probability
  let spareChance = BOWLING_TUNING.SPARE_BASE_CHANCE;
  spareChance *= (stats.spareShooting / 100) * 0.5 + 0.5;
  spareChance *= (stats.accuracy / 100) * 0.3 + 0.7;
  spareChance *= (ball.control / 10) * 0.2 + 0.8;
  spareChance *= energyMod;
  
  // Penalties for difficult leaves
  const isSplit = checkIfSplit(pinsStanding);
  const hasCornerPin = pinsStanding.includes(7) || pinsStanding.includes(10);
  const hasBothCorners = pinsStanding.includes(7) && pinsStanding.includes(10);
  
  if (isSplit) {
    spareChance *= BOWLING_TUNING.SPLIT_SPARE_PENALTY;
    // 7-10 split is nearly impossible
    if (hasBothCorners && pinCount === 2) {
      spareChance *= 0.02; // ~1-2% chance
    }
  } else if (hasCornerPin && pinCount === 1) {
    spareChance *= BOWLING_TUNING.CORNER_SPARE_PENALTY;
  }
  
  // More pins = harder spare
  spareChance *= 1 - (pinCount - 1) * 0.05;
  
  // Check for spare conversion
  if (Math.random() < spareChance) {
    return {
      pinsKnocked: pinCount,
      pinsRemaining: [],
      isSplit: false,
      isGutter: false,
      description: "Spare!"
    };
  }
  
  // Missed spare - determine how many pins knocked down
  const missRoll = Math.random();
  let pinsHit: number;
  
  if (pinCount === 1) {
    // Single pin - either hit or miss
    pinsHit = 0;
  } else if (missRoll < 0.1 && !isSplit) {
    // Complete miss (rare unless split)
    pinsHit = 0;
  } else if (isSplit) {
    // Splits: often get one side but not the other
    pinsHit = Math.floor(Math.random() * pinCount);
  } else {
    // Normal miss: usually knock most pins
    const minHit = Math.max(0, pinCount - 2);
    pinsHit = minHit + Math.floor(Math.random() * (pinCount - minHit));
  }
  
  // Remove random pins from the standing list
  const remaining = [...pinsStanding];
  for (let i = 0; i < pinsHit && remaining.length > 0; i++) {
    const idx = Math.floor(Math.random() * remaining.length);
    remaining.splice(idx, 1);
  }
  
  return {
    pinsKnocked: pinsHit,
    pinsRemaining: remaining,
    isSplit: false,
    isGutter: pinsHit === 0 && pinCount > 1,
    description: pinsHit === 0 ? "Miss" : `Knocked ${pinsHit}`
  };
}

/**
 * Check if a pin configuration is a split
 * A split has the head pin down with pins separated by gaps
 */
function checkIfSplit(pins: number[]): boolean {
  if (pins.includes(1)) return false; // Head pin standing = not a split
  if (pins.length <= 1) return false;
  
  // Common split patterns
  const splitPatterns = [
    [4, 6], [3, 10], [2, 7], [4, 10], [6, 7], [7, 10],
    [4, 7, 10], [3, 7], [5, 7], [5, 10], [7, 9], [8, 10],
    [4, 6, 7, 10], [4, 6, 7, 9, 10], [7, 6, 10]
  ];
  
  const sortedPins = [...pins].sort((a, b) => a - b);
  
  for (const pattern of splitPatterns) {
    const sortedPattern = [...pattern].sort((a, b) => a - b);
    if (sortedPins.length === sortedPattern.length &&
        sortedPins.every((p, i) => p === sortedPattern[i])) {
      return true;
    }
  }
  
  // General check: if back row pins (7,8,9,10) are separated
  const backRow = pins.filter(p => p >= 7);
  if (backRow.length >= 2) {
    const hasLeft = backRow.includes(7);
    const hasRight = backRow.includes(10);
    if (hasLeft && hasRight && !backRow.includes(8) && !backRow.includes(9)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Main throw simulation - determines pins knocked and returns result
 * This is the primary function to call from game components
 */
export function simulateThrowAdvanced(params: ThrowParams): PinResult {
  if (!params.isSpareAttempt) {
    return simulateFirstBall(params);
  } else {
    return simulateSpareBall(params);
  }
}

/**
 * Legacy compatible function - returns just pin count for backward compatibility
 */
export function simulateThrowSimple(
  pinsRemaining: number,
  stats: { accuracy: number; hookControl: number; consistency: number; revRate: number; mentalToughness: number; laneReading: number; spareShooting: number },
  ballStats: { hookPotential: number; control: number; forgiveness: number; oilHandling: number },
  oilDifficulty: number,
  frameNumber: number,
  isSpareAttempt: boolean,
  energy: number
): number {
  // Convert to full PlayerStats
  const fullStats: PlayerStats = {
    throwPower: 60,
    accuracy: stats.accuracy,
    hookControl: stats.hookControl,
    consistency: stats.consistency,
    revRate: stats.revRate,
    mentalToughness: stats.mentalToughness,
    laneReading: stats.laneReading,
    spareShooting: stats.spareShooting,
    speedControl: 60,
    equipmentKnowledge: 50,
    stamina: 60,
    charisma: 50,
    reputation: 40,
  };
  
  const ball: BowlingBall = {
    id: "sim-ball",
    name: "Simulation Ball",
    type: "reactive-solid",
    coreType: "symmetric",
    hookPotential: ballStats.hookPotential,
    control: ballStats.control,
    backendReaction: 5,
    oilHandling: ballStats.oilHandling,
    forgiveness: ballStats.forgiveness,
    price: 0,
    owned: true,
  };
  
  // Convert oil difficulty to pattern name
  const oilPatterns: OilPattern[] = ["house", "short", "sport", "long", "heavy", "dry"];
  const patternIndex = Math.max(0, Math.min(5, Math.round(oilDifficulty) - 1));
  const oilPattern = oilPatterns[patternIndex];
  
  // Build pins standing array
  const pinsStanding = isSpareAttempt 
    ? Array.from({ length: pinsRemaining }, (_, i) => i + 1) // Simplified - just uses count
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  const result = simulateThrowAdvanced({
    pinsStanding,
    stats: fullStats,
    ball,
    oilPattern,
    frameNumber,
    energy,
    isSpareAttempt,
  });
  
  return result.pinsKnocked;
}
