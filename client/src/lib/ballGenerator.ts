import type { BowlingBall, BallRarity, LaneCondition } from "@shared/schema";
import { 
  BALL_RARITY_WEIGHTS, 
  BALL_RARITY_PRICE_MULTIPLIER, 
  BALL_RARITY_STAT_BONUS 
} from "@shared/schema";

const ADJECTIVES = [
  "Thunder", "Storm", "Cyclone", "Vortex", "Blaze", "Shadow", "Phantom", "Titan", "Apex", "Quantum",
  "Neon", "Midnight", "Iron", "Crimson", "Azure", "Obsidian", "Inferno", "Arctic", "Solar", "Lunar",
  "Stealth", "Fusion", "Nova", "Cosmic", "Hyper", "Ultra", "Prime", "Elite", "Supreme", "Omega",
  "Savage", "Venom", "Fury", "Havoc", "Chaos", "Rampage", "Dominator", "Destroyer", "Crusher", "Annihilator"
];

const CONCEPTS = [
  "Strike", "Fury", "Force", "Rush", "Wave", "Core", "Pro", "Master", "Hawk", "Viper",
  "Serpent", "Comet", "Bolt", "Flash", "Blitz", "Flame", "Storm", "Thunder", "Titan", "Phoenix",
  "Dragon", "Falcon", "Panther", "Tiger", "Wolf", "Raptor", "Scorpion", "Cobra", "Shark", "Eagle",
  "Hammer", "Blade", "Edge", "Spike", "Slash", "Impact", "Shockwave", "Tremor", "Quake", "Surge"
];

const SUFFIXES = ["X", "Pro", "Elite", "HX", "XL", "GT", "RS", "XT", "Max", "Plus", "Tour", "V2", "SE", "LTD"];

const SERIES = [
  "Performance Line", "Tour Series", "Pro Shop Exclusive", "Championship Edition", 
  "Premier Collection", "Elite Series", "Competition Line", "Signature Series"
];

const TAGLINES: Record<BallRarity, string[]> = {
  common: [
    "Reliable performance for everyday bowling.",
    "A solid choice for building your arsenal.",
    "Consistent reaction you can count on.",
    "Perfect for learning lane transitions.",
  ],
  rare: [
    "Enhanced performance for serious competitors.",
    "Engineered for versatility across conditions.",
    "A step up in hook and backend power.",
    "Refined core dynamics for better pin action.",
  ],
  epic: [
    "Tournament-ready performance in every throw.",
    "Aggressive hook meets pinpoint control.",
    "Dominate the lanes with advanced technology.",
    "Elite-level performance for ambitious bowlers.",
  ],
  legendary: [
    "The pinnacle of bowling engineering.",
    "Unleash devastating strikes with every roll.",
    "Legendary performance for legendary bowlers.",
    "The ultimate weapon in your bowling arsenal.",
  ],
};

type BallType = "plastic" | "urethane" | "reactive-solid" | "reactive-pearl" | "reactive-hybrid";
type CoreType = "symmetric" | "asymmetric";

const BALL_TYPE_BASE_STATS: Record<BallType, {
  hookPotential: [number, number];
  control: [number, number];
  backendReaction: [number, number];
  oilHandling: [number, number];
  forgiveness: [number, number];
  basePrice: number;
  recommendedCondition: LaneCondition;
}> = {
  plastic: {
    hookPotential: [1, 2],
    control: [8, 10],
    backendReaction: [1, 2],
    oilHandling: [1, 3],
    forgiveness: [8, 10],
    basePrice: 60,
    recommendedCondition: "dry",
  },
  urethane: {
    hookPotential: [3, 5],
    control: [6, 8],
    backendReaction: [3, 5],
    oilHandling: [4, 6],
    forgiveness: [6, 8],
    basePrice: 120,
    recommendedCondition: "medium",
  },
  "reactive-solid": {
    hookPotential: [5, 8],
    control: [4, 7],
    backendReaction: [5, 7],
    oilHandling: [6, 9],
    forgiveness: [3, 6],
    basePrice: 180,
    recommendedCondition: "heavy",
  },
  "reactive-pearl": {
    hookPotential: [6, 9],
    control: [3, 6],
    backendReaction: [7, 10],
    oilHandling: [4, 7],
    forgiveness: [2, 5],
    basePrice: 200,
    recommendedCondition: "medium",
  },
  "reactive-hybrid": {
    hookPotential: [6, 9],
    control: [4, 7],
    backendReaction: [6, 9],
    oilHandling: [5, 8],
    forgiveness: [3, 5],
    basePrice: 220,
    recommendedCondition: "heavy",
  },
};

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randomInRange(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pickRarity(rand: () => number): BallRarity {
  const total = Object.values(BALL_RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = rand() * total;
  
  for (const [rarity, weight] of Object.entries(BALL_RARITY_WEIGHTS)) {
    roll -= weight;
    if (roll <= 0) return rarity as BallRarity;
  }
  return "common";
}

export function generateBallName(seed: number): { name: string; series: string } {
  const rand = seededRandom(seed);
  const adjective = pickRandom(ADJECTIVES, rand);
  const concept = pickRandom(CONCEPTS, rand);
  const suffix = rand() > 0.5 ? ` ${pickRandom(SUFFIXES, rand)}` : "";
  const series = pickRandom(SERIES, rand);
  
  return {
    name: `${adjective} ${concept}${suffix}`,
    series,
  };
}

export function generateBowlingBall(seed: number): BowlingBall {
  const rand = seededRandom(seed);
  const ballTypes: BallType[] = ["plastic", "urethane", "reactive-solid", "reactive-pearl", "reactive-hybrid"];
  const coreTypes: CoreType[] = ["symmetric", "asymmetric"];
  
  const type = pickRandom(ballTypes, rand);
  const coreType = pickRandom(coreTypes, rand);
  const rarity = pickRarity(rand);
  const { name, series } = generateBallName(seed);
  
  const baseStats = BALL_TYPE_BASE_STATS[type];
  const rarityBonus = BALL_RARITY_STAT_BONUS[rarity];
  const bonus = randomInRange(rarityBonus.min, rarityBonus.max, rand);
  
  const clamp = (val: number) => Math.min(10, Math.max(1, val));
  
  const hookPotential = clamp(randomInRange(baseStats.hookPotential[0], baseStats.hookPotential[1], rand) + bonus);
  const control = clamp(randomInRange(baseStats.control[0], baseStats.control[1], rand) + (rarity === "legendary" ? 1 : 0));
  const backendReaction = clamp(randomInRange(baseStats.backendReaction[0], baseStats.backendReaction[1], rand) + bonus);
  const oilHandling = clamp(randomInRange(baseStats.oilHandling[0], baseStats.oilHandling[1], rand) + Math.floor(bonus / 2));
  const forgiveness = clamp(randomInRange(baseStats.forgiveness[0], baseStats.forgiveness[1], rand));
  
  const basePrice = baseStats.basePrice + (hookPotential + backendReaction + oilHandling) * 10;
  const price = Math.round(basePrice * BALL_RARITY_PRICE_MULTIPLIER[rarity]);
  
  const rg = Number((2.4 + rand() * 0.4).toFixed(3));
  const differential = Number((0.01 + rand() * 0.05).toFixed(3));
  
  const tagline = pickRandom(TAGLINES[rarity], rand);
  
  return {
    id: `ball-${seed}`,
    name,
    type,
    coreType,
    hookPotential,
    control,
    backendReaction,
    oilHandling,
    forgiveness,
    price,
    rarity,
    visualSeed: seed,
    rg,
    differential,
    recommendedCondition: baseStats.recommendedCondition,
    series,
    tagline,
  };
}

export function generateShopInventory(weekSeed: number, count: number = 45): BowlingBall[] {
  const balls: BowlingBall[] = [];
  const usedNames = new Set<string>();
  const ballTypes: Array<"plastic" | "urethane" | "reactive-solid" | "reactive-pearl" | "reactive-hybrid"> = [
    "plastic", "urethane", "reactive-solid", "reactive-pearl", "reactive-hybrid"
  ];
  
  for (let i = 0; i < count; i++) {
    const uniqueSeed = weekSeed * 10000 + i * 137 + (i % 7) * 1009;
    const ball = generateBowlingBall(uniqueSeed);
    
    const typeIndex = i % 5;
    if (i < 25) {
      ball.type = ballTypes[typeIndex];
    }
    
    if (usedNames.has(ball.name)) {
      const variant = Math.floor(i / 10) + 1;
      ball.name = `${ball.name} V${variant}`;
    }
    usedNames.add(ball.name);
    ball.id = `shop-${weekSeed}-${i}`;
    
    balls.push(ball);
  }
  
  balls.sort((a, b) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return (rarityOrder[a.rarity || "common"] - rarityOrder[b.rarity || "common"]) || a.price - b.price;
  });
  
  return balls;
}

export function getFeaturedBalls(weekSeed: number): BowlingBall[] {
  const featured: BowlingBall[] = [];
  
  for (let i = 0; i < 3; i++) {
    const ball = generateBowlingBall(weekSeed * 100 + i + 5000);
    ball.id = `featured-${weekSeed}-${i}`;
    
    if (ball.rarity === "common") {
      ball.rarity = "rare";
      ball.price = Math.round(ball.price * 1.3);
    }
    featured.push(ball);
  }
  
  return featured;
}

export function getWeekSeed(week: number): number {
  return Math.floor(week / 4) + 1000;
}

export type SortOption = "price-low" | "price-high" | "hook-high" | "hook-low" | "control-high" | "control-low" | "oil-high" | "oil-low" | "recommended";

export function sortBalls(balls: BowlingBall[], sortBy: SortOption, currentOilPattern?: string): BowlingBall[] {
  const sorted = [...balls];
  
  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "hook-high":
      return sorted.sort((a, b) => b.hookPotential - a.hookPotential);
    case "hook-low":
      return sorted.sort((a, b) => a.hookPotential - b.hookPotential);
    case "control-high":
      return sorted.sort((a, b) => b.control - a.control);
    case "control-low":
      return sorted.sort((a, b) => a.control - b.control);
    case "oil-high":
      return sorted.sort((a, b) => b.oilHandling - a.oilHandling);
    case "oil-low":
      return sorted.sort((a, b) => a.oilHandling - b.oilHandling);
    case "recommended":
      const oilMap: Record<string, LaneCondition> = {
        house: "medium",
        sport: "heavy",
        short: "dry",
        long: "heavy",
        heavy: "heavy",
        dry: "dry",
      };
      const targetCondition = currentOilPattern ? oilMap[currentOilPattern] || "medium" : "medium";
      return sorted.sort((a, b) => {
        const aMatch = a.recommendedCondition === targetCondition ? 0 : 1;
        const bMatch = b.recommendedCondition === targetCondition ? 0 : 1;
        return aMatch - bMatch || b.hookPotential + b.oilHandling - (a.hookPotential + a.oilHandling);
      });
    default:
      return sorted;
  }
}

export function filterBallsByType(balls: BowlingBall[], type: string | null): BowlingBall[] {
  if (!type || type === "all") return balls;
  return balls.filter(b => b.type === type);
}

export function filterBallsByRarity(balls: BowlingBall[], rarity: string | null): BowlingBall[] {
  if (!rarity || rarity === "all") return balls;
  return balls.filter(b => b.rarity === rarity);
}
