import { z } from "zod";

// ============================================
// GAME CONSTANTS (for tuning)
// ============================================
export const GAME_CONSTANTS = {
  MAX_ENERGY: 100,
  ENERGY_REFILL_PER_WEEK: 40,
  PRO_AVERAGE_THRESHOLD: 200,
  PRO_GAMES_REQUIRED: 20,
  PRO_APPLICATION_COST: 5000,
  PRO_APPLICATION_ENERGY: 20,
  STARTING_MONEY: 500,
  STARTING_ENERGY: 100,
  STAT_MIN: 20,
  STAT_MAX: 99,
  AMATEUR_AVG_TARGET: { min: 120, max: 160 },
  PRO_AVG_TARGET: { min: 200, max: 240 },
  // Opponent difficulty scaling by tier
  OPPONENT_SKILL_BY_TIER: {
    "amateur-local": { statMin: 25, statMax: 50, avgMin: 120, avgMax: 160 },
    "amateur-regional": { statMin: 40, statMax: 65, avgMin: 150, avgMax: 185 },
    "pro-local": { statMin: 60, statMax: 80, avgMin: 190, avgMax: 210 },
    "pro-regional": { statMin: 70, statMax: 88, avgMin: 205, avgMax: 225 },
    "pro-national": { statMin: 80, statMax: 95, avgMin: 215, avgMax: 240 },
  } as Record<string, { statMin: number; statMax: number; avgMin: number; avgMax: number }>,
  // Event settings
  LEAGUE_SIZE: 8,
  TOURNAMENT_SIZE: 16,
  UPSET_FACTOR: 0.15, // Variance factor for opponent performance
};

// ============================================
// PLAYER STATS
// ============================================
export const playerStatsSchema = z.object({
  throwPower: z.number().min(20).max(99),
  accuracy: z.number().min(20).max(99),
  hookControl: z.number().min(20).max(99),
  revRate: z.number().min(20).max(99),
  speedControl: z.number().min(20).max(99),
  consistency: z.number().min(20).max(99),
  spareShooting: z.number().min(20).max(99),
  mentalToughness: z.number().min(20).max(99),
  laneReading: z.number().min(20).max(99),
  equipmentKnowledge: z.number().min(20).max(99),
  stamina: z.number().min(20).max(99),
  charisma: z.number().min(20).max(99),
  reputation: z.number().min(0).max(100),
});

export type PlayerStats = z.infer<typeof playerStatsSchema>;

// ============================================
// BOWLING STYLE & HANDEDNESS
// ============================================
export const bowlingStyleSchema = z.enum(["one-handed", "two-handed"]);
export const handednessSchema = z.enum(["left", "right", "left-dominant", "right-dominant"]);

export type BowlingStyle = z.infer<typeof bowlingStyleSchema>;
export type Handedness = z.infer<typeof handednessSchema>;

// ============================================
// BOWLING BALL
// ============================================
export const ballTypeSchema = z.enum(["plastic", "urethane", "reactive-solid", "reactive-pearl", "reactive-hybrid"]);
export const coreTypeSchema = z.enum(["symmetric", "asymmetric"]);

export const bowlingBallSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ballTypeSchema,
  coreType: coreTypeSchema,
  hookPotential: z.number().min(1).max(10),
  control: z.number().min(1).max(10),
  backendReaction: z.number().min(1).max(10),
  oilHandling: z.number().min(1).max(10),
  forgiveness: z.number().min(1).max(10),
  price: z.number(),
  owned: z.boolean().optional(),
  surfaceAdjustment: z.number().optional(),
  drillingUpgrade: z.boolean().optional(),
});

export type BowlingBall = z.infer<typeof bowlingBallSchema>;

// ============================================
// OIL PATTERNS
// ============================================
export const oilPatternSchema = z.enum(["house", "sport", "short", "long", "heavy", "dry"]);
export type OilPattern = z.infer<typeof oilPatternSchema>;

export const oilPatternDifficulty: Record<OilPattern, number> = {
  house: 1,
  short: 2,
  dry: 2,
  long: 3,
  heavy: 3,
  sport: 4,
};

// ============================================
// JOB
// ============================================
export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  weeklyPay: z.number(),
  energyCost: z.number(),
  contractWeeks: z.number(),
  weeksRemaining: z.number().optional(),
  requirements: z.object({
    reputation: z.number().optional(),
    charisma: z.number().optional(),
    consistency: z.number().optional(),
  }).optional(),
});

export type Job = z.infer<typeof jobSchema>;

// ============================================
// RELATIONSHIP
// ============================================
export const relationshipSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().min(0).max(100),
  buffs: z.object({
    mentalToughness: z.number().optional(),
    energyRecovery: z.number().optional(),
  }).optional(),
});

export type Relationship = z.infer<typeof relationshipSchema>;

// ============================================
// PROPERTY
// ============================================
export const propertySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["rent", "own"]),
  monthlyCost: z.number(),
  energyBonus: z.number(),
  trainingBonus: z.number(),
});

export type Property = z.infer<typeof propertySchema>;

// ============================================
// TOURNAMENT / LEAGUE
// ============================================
export const competitionTypeSchema = z.enum(["league", "tournament", "championship"]);
export const competitionTierSchema = z.enum(["amateur-local", "amateur-regional", "pro-local", "pro-regional", "pro-national"]);

export const competitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: competitionTypeSchema,
  tier: competitionTierSchema,
  prizePool: z.number(),
  entryFee: z.number(),
  energyCost: z.number(),
  oilPattern: oilPatternSchema,
  requiresPro: z.boolean(),
  minAverage: z.number().optional(),
  gamesCount: z.number(),
});

export type Competition = z.infer<typeof competitionSchema>;

// ============================================
// SPONSOR
// ============================================
export const sponsorSchema = z.object({
  id: z.string(),
  name: z.string(),
  weeklyPay: z.number(),
  minAverage: z.number(),
  minReputation: z.number(),
  contractWeeks: z.number(),
  weeksRemaining: z.number().optional(),
  active: z.boolean().optional(),
});

export type Sponsor = z.infer<typeof sponsorSchema>;

// ============================================
// BOWLING TRAITS (Character Builds)
// ============================================
export const bowlingTraitSchema = z.enum([
  "power-cranker",     // Higher strike chance, lower consistency
  "smooth-stroker",    // High accuracy, lower hook
  "tweener",           // Balanced approach
  "clutch-finisher",   // Late-frame bonuses
  "spare-specialist",  // Higher spare conversion
]);

export type BowlingTrait = z.infer<typeof bowlingTraitSchema>;

export const TRAIT_DESCRIPTIONS: Record<BowlingTrait, { name: string; description: string; effects: string }> = {
  "power-cranker": { 
    name: "Power Cranker", 
    description: "Aggressive high-rev style with explosive hook",
    effects: "+15% strike chance, -10% consistency" 
  },
  "smooth-stroker": { 
    name: "Smooth Stroker", 
    description: "Classic accuracy-focused approach",
    effects: "+15% accuracy, -10% hook power" 
  },
  "tweener": { 
    name: "Tweener", 
    description: "Versatile balanced style",
    effects: "+5% all stats, no penalties" 
  },
  "clutch-finisher": { 
    name: "Clutch Finisher", 
    description: "Performs best under pressure",
    effects: "+20% in frames 9-10, -5% early frames" 
  },
  "spare-specialist": { 
    name: "Spare Specialist", 
    description: "Master of spare conversions",
    effects: "+25% spare conversion, -5% strike chance" 
  },
};

// ============================================
// OPPONENT (NPC bowler)
// ============================================
export const opponentSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  bowlingStyle: bowlingStyleSchema,
  handedness: handednessSchema,
  stats: playerStatsSchema,
  bowlingAverage: z.number(),
  currentSeriesScore: z.number().optional(),
  gamesPlayed: z.number().optional(),
  trait: bowlingTraitSchema.optional(),
  isRival: z.boolean().optional(),
});

export type Opponent = z.infer<typeof opponentSchema>;

// ============================================
// RIVALRY TRACKING
// ============================================
export const rivalrySchema = z.object({
  opponentId: z.string(),
  opponentName: z.string(),
  wins: z.number(),
  losses: z.number(),
  lastMatchWeek: z.number(),
  lastMatchSeason: z.number(),
});

export type Rivalry = z.infer<typeof rivalrySchema>;

// ============================================
// ACHIEVEMENTS
// ============================================
export const achievementIdSchema = z.enum([
  "first_200_average",
  "first_300_game",
  "first_perfect_game",
  "first_league_championship",
  "first_tournament_win",
  "went_pro",
  "turkey_master",        // 10 turkeys in career
  "double_specialist",    // 25 doubles in career
  "money_maker",          // Earn $100,000 total
  "grinder",              // Play 100 games
  "veteran",              // Play 500 games
  "rival_nemesis",        // Beat a rival 5 times
  "streak_king",          // 5 strikes in a row
]);

export type AchievementId = z.infer<typeof achievementIdSchema>;

export const achievementSchema = z.object({
  id: achievementIdSchema,
  earnedAt: z.string().optional(),
  progress: z.number().optional(),
  target: z.number().optional(),
});

export type Achievement = z.infer<typeof achievementSchema>;

export const ACHIEVEMENT_INFO: Record<AchievementId, { name: string; description: string; target?: number }> = {
  "first_200_average": { name: "Rising Star", description: "Achieve a 200 bowling average" },
  "first_300_game": { name: "Perfect Game", description: "Bowl a 300 game" },
  "first_perfect_game": { name: "Perfection", description: "Bowl a perfect game in competition" },
  "first_league_championship": { name: "League Champion", description: "Win your first league championship" },
  "first_tournament_win": { name: "Tournament Victor", description: "Win your first tournament" },
  "went_pro": { name: "Professional", description: "Become a professional bowler" },
  "turkey_master": { name: "Turkey Master", description: "Bowl 10 turkeys in your career", target: 10 },
  "double_specialist": { name: "Double Specialist", description: "Bowl 25 doubles in your career", target: 25 },
  "money_maker": { name: "Money Maker", description: "Earn $100,000 total", target: 100000 },
  "grinder": { name: "Grinder", description: "Play 100 games", target: 100 },
  "veteran": { name: "Veteran", description: "Play 500 games", target: 500 },
  "rival_nemesis": { name: "Rival Nemesis", description: "Beat a rival 5 times", target: 5 },
  "streak_king": { name: "Streak King", description: "Get 5 strikes in a row" },
};

// ============================================
// PURCHASES (In-App Purchase Tracking)
// ============================================
export const purchaseIdSchema = z.enum([
  "energy_boost_10",    // +10 max weekly energy (permanent)
  "energy_boost_20",    // +20 max weekly energy (permanent)
  "cash_pack_small",    // $5,000 one-time
  "cash_pack_medium",   // $15,000 one-time
  "cash_pack_large",    // $50,000 one-time
]);

export type PurchaseId = z.infer<typeof purchaseIdSchema>;

export const purchaseRecordSchema = z.object({
  purchaseId: purchaseIdSchema,
  purchasedAt: z.string(),
  quantity: z.number().optional(), // For consumables
});

export type PurchaseRecord = z.infer<typeof purchaseRecordSchema>;

// IAP product definitions (for future Google Play / Apple integration)
export const IAP_PRODUCTS = {
  "energy_boost_10": { 
    name: "+10 Weekly Energy", 
    description: "Permanently increase your max weekly energy by 10",
    type: "permanent" as const,
    price: "$0.99",
    effect: { maxEnergyBoost: 10 },
    // TODO: Add Google Play product ID: com.strikeforce.energy_boost_10
    // TODO: Add Apple product ID: energy_boost_10
  },
  "energy_boost_20": { 
    name: "+20 Weekly Energy", 
    description: "Permanently increase your max weekly energy by 20",
    type: "permanent" as const,
    price: "$1.99",
    effect: { maxEnergyBoost: 20 },
    // TODO: Add Google Play product ID: com.strikeforce.energy_boost_20
    // TODO: Add Apple product ID: energy_boost_20
  },
  "cash_pack_small": { 
    name: "$5,000 Cash Pack", 
    description: "One-time cash boost of $5,000",
    type: "consumable" as const,
    price: "$0.99",
    effect: { cashBoost: 5000 },
    // TODO: Add Google Play product ID: com.strikeforce.cash_pack_small
    // TODO: Add Apple product ID: cash_pack_small
  },
  "cash_pack_medium": { 
    name: "$15,000 Cash Pack", 
    description: "One-time cash boost of $15,000",
    type: "consumable" as const,
    price: "$2.99",
    effect: { cashBoost: 15000 },
    // TODO: Add Google Play product ID: com.strikeforce.cash_pack_medium
    // TODO: Add Apple product ID: cash_pack_medium
  },
  "cash_pack_large": { 
    name: "$50,000 Cash Pack", 
    description: "One-time cash boost of $50,000",
    type: "consumable" as const,
    price: "$4.99",
    effect: { cashBoost: 50000 },
    // TODO: Add Google Play product ID: com.strikeforce.cash_pack_large
    // TODO: Add Apple product ID: cash_pack_large
  },
};

// ============================================
// COACH SYSTEM
// ============================================
export const coachTypeSchema = z.enum(["power", "accuracy", "spare", "mental", "lane-reading", "conditioning"]);
export type CoachType = z.infer<typeof coachTypeSchema>;

export const coachSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: coachTypeSchema,
  weeklyCost: z.number(),
  unlockRequirement: z.object({
    reputation: z.number().optional(),
    bowlingAverage: z.number().optional(),
  }),
  effects: z.object({
    statBonus: z.record(z.string(), z.number()).optional(),
    trainingEnergyCostReduction: z.number().optional(),
    spareConversionBoost: z.number().optional(),
    strikeBoost: z.number().optional(),
    mentalBoost: z.number().optional(),
  }),
});

export type Coach = z.infer<typeof coachSchema>;

export const AVAILABLE_COACHES: Coach[] = [
  { id: "power-coach", name: "Mike 'Thunder' Johnson", type: "power", weeklyCost: 150, unlockRequirement: { reputation: 10 }, effects: { statBonus: { throwPower: 3, revRate: 2 }, strikeBoost: 5 } },
  { id: "accuracy-coach", name: "Sarah Chen", type: "accuracy", weeklyCost: 175, unlockRequirement: { bowlingAverage: 140 }, effects: { statBonus: { accuracy: 3, consistency: 2 }, trainingEnergyCostReduction: 5 } },
  { id: "spare-coach", name: "Bob 'Clean Sheet' Miller", type: "spare", weeklyCost: 125, unlockRequirement: { reputation: 15 }, effects: { statBonus: { spareShooting: 4 }, spareConversionBoost: 10 } },
  { id: "mental-coach", name: "Dr. Emily Park", type: "mental", weeklyCost: 200, unlockRequirement: { bowlingAverage: 160 }, effects: { statBonus: { mentalToughness: 4 }, mentalBoost: 8 } },
  { id: "lane-coach", name: "Pete Reynolds", type: "lane-reading", weeklyCost: 150, unlockRequirement: { reputation: 20 }, effects: { statBonus: { laneReading: 4, equipmentKnowledge: 2 } } },
  { id: "conditioning-coach", name: "Coach Martinez", type: "conditioning", weeklyCost: 100, unlockRequirement: { reputation: 5 }, effects: { statBonus: { stamina: 3 }, trainingEnergyCostReduction: 8 } },
];

// ============================================
// INJURY / SLUMP SYSTEM
// ============================================
export const effectTypeSchema = z.enum(["injury", "slump"]);
export type EffectType = z.infer<typeof effectTypeSchema>;

export const activeEffectSchema = z.object({
  id: z.string(),
  type: effectTypeSchema,
  name: z.string(),
  description: z.string(),
  weeksRemaining: z.number(),
  statPenalties: z.record(z.string(), z.number()),
});

export type ActiveEffect = z.infer<typeof activeEffectSchema>;

export const POSSIBLE_EFFECTS: Omit<ActiveEffect, "id" | "weeksRemaining">[] = [
  { type: "injury", name: "Sore Wrist", description: "Minor wrist strain from overuse", statPenalties: { accuracy: -3, hookControl: -2 } },
  { type: "injury", name: "Back Strain", description: "Lower back tightness affecting form", statPenalties: { throwPower: -3, consistency: -2 } },
  { type: "injury", name: "Finger Irritation", description: "Blistering on bowling fingers", statPenalties: { revRate: -3, control: -2 } },
  { type: "slump", name: "Mental Block", description: "Struggling with confidence", statPenalties: { mentalToughness: -4, consistency: -3 } },
  { type: "slump", name: "Timing Issues", description: "Approach timing feels off", statPenalties: { accuracy: -3, speedControl: -2 } },
  { type: "slump", name: "Lane Reading Struggles", description: "Difficulty reading oil patterns", statPenalties: { laneReading: -4, equipmentKnowledge: -2 } },
];

export const recoveryActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  moneyCost: z.number(),
  energyCost: z.number(),
  weeksReduction: z.number(),
  applicableTo: z.array(effectTypeSchema),
});

export type RecoveryAction = z.infer<typeof recoveryActionSchema>;

export const RECOVERY_ACTIONS: RecoveryAction[] = [
  { id: "rest-week", name: "Rest Week", description: "Take it easy and recover naturally", moneyCost: 0, energyCost: 30, weeksReduction: 1, applicableTo: ["injury", "slump"] },
  { id: "physical-therapy", name: "Physical Therapy", description: "Professional treatment for injuries", moneyCost: 300, energyCost: 10, weeksReduction: 2, applicableTo: ["injury"] },
  { id: "mental-reset", name: "Mental Reset", description: "Work with a sports psychologist", moneyCost: 250, energyCost: 15, weeksReduction: 2, applicableTo: ["slump"] },
];

// ============================================
// PRESTIGE / LEGACY SYSTEM
// ============================================
export const hallOfFameEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  seasons: z.number(),
  careerAverage: z.number(),
  totalTitles: z.number(),
  totalEarnings: z.number(),
  perfectGames: z.number(),
  retiredAt: z.string(),
  // Expanded career summary fields
  highGame: z.number().optional(),
  highSeries: z.number().optional(),
  totalGamesPlayed: z.number().optional(),
  leagueWins: z.number().optional(),
  tournamentWins: z.number().optional(),
  longestStrikeStreak: z.number().optional(),
  strikePercentage: z.number().optional(),
  sparePercentage: z.number().optional(),
  rivalRecord: z.object({
    wins: z.number(),
    losses: z.number(),
  }).optional(),
  achievementsEarned: z.number().optional(),
  cosmeticsCollected: z.number().optional(),
  trait: z.string().optional(),
  bowlingStyle: z.string().optional(),
  legacyPointsAwarded: z.number().optional(),
});

export type HallOfFameEntry = z.infer<typeof hallOfFameEntrySchema>;

export const legacyBonusSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  cost: z.number(),
  effect: z.object({
    startingStatBonus: z.number().optional(),
    maxEnergyBonus: z.number().optional(),
    startingCash: z.number().optional(),
    reputationBonus: z.number().optional(),
  }),
});

export type LegacyBonus = z.infer<typeof legacyBonusSchema>;

export const LEGACY_BONUSES: LegacyBonus[] = [
  { id: "stat-boost-5", name: "Natural Talent", description: "+5 to all starting stats", cost: 10, effect: { startingStatBonus: 5 } },
  { id: "energy-boost-10", name: "Peak Fitness", description: "+10 max weekly energy", cost: 8, effect: { maxEnergyBonus: 10 } },
  { id: "starting-cash", name: "Family Savings", description: "+$2,000 starting cash", cost: 5, effect: { startingCash: 2000 } },
  { id: "reputation-boost", name: "Famous Lineage", description: "+10 starting reputation", cost: 7, effect: { reputationBonus: 10 } },
];

export const legacyDataSchema = z.object({
  legacyPoints: z.number().default(0),
  hallOfFame: z.array(hallOfFameEntrySchema).default([]),
  activeBonuses: z.array(z.string()).default([]),
});

export type LegacyData = z.infer<typeof legacyDataSchema>;

// ============================================
// WEEKLY CHALLENGES
// ============================================
export const weeklyChallengeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  target: z.number(),
  progress: z.number().default(0),
  reward: z.object({
    cash: z.number().optional(),
    reputation: z.number().optional(),
    energy: z.number().optional(),
    cosmeticToken: z.number().optional(),
  }),
  claimed: z.boolean().default(false),
});

export type WeeklyChallenge = z.infer<typeof weeklyChallengeSchema>;

export const CHALLENGE_TEMPLATES = [
  { id: "games-180", name: "High Scorer", description: "Bowl 3 games over 180", target: 3, reward: { cash: 500 } },
  { id: "spares-5", name: "Spare Master", description: "Convert 5 spares", target: 5, reward: { reputation: 3 } },
  { id: "trainings-2", name: "Dedicated Athlete", description: "Complete 2 training sessions", target: 2, reward: { energy: 15 } },
  { id: "strikes-10", name: "Strike Force", description: "Bowl 10 strikes", target: 10, reward: { cash: 300 } },
  { id: "league-win", name: "League Victory", description: "Win a league night", target: 1, reward: { reputation: 5, cash: 200 } },
  { id: "tournament-top3", name: "Podium Finish", description: "Finish top 3 in a tournament", target: 1, reward: { cash: 750 } },
  { id: "games-4", name: "Active Bowler", description: "Bowl 4 games this week", target: 4, reward: { cash: 200, reputation: 2 } },
  { id: "perfect-frame", name: "Strike Streak", description: "Get 3 strikes in a row", target: 1, reward: { cosmeticToken: 1 } },
];

export const weeklyChallengeStateSchema = z.object({
  challenges: z.array(weeklyChallengeSchema),
  weekGenerated: z.number(),
  seasonGenerated: z.number(),
});

export type WeeklyChallengeState = z.infer<typeof weeklyChallengeStateSchema>;

// ============================================
// COSMETIC SYSTEM
// ============================================
export const cosmeticCategorySchema = z.enum(["shoes", "gloves", "outfit", "ball-skin", "ui-theme"]);
export type CosmeticCategory = z.infer<typeof cosmeticCategorySchema>;

export const cosmeticUnlockMethodSchema = z.enum(["achievement", "challenge", "reputation", "purchase", "legacy"]);
export type CosmeticUnlockMethod = z.infer<typeof cosmeticUnlockMethodSchema>;

export const cosmeticItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: cosmeticCategorySchema,
  description: z.string(),
  icon: z.string(), // Lucide icon name
  rarity: z.enum(["common", "uncommon", "rare", "legendary"]),
  unlockMethod: cosmeticUnlockMethodSchema,
  unlockRequirement: z.object({
    achievementId: z.string().optional(),
    challengeReward: z.boolean().optional(),
    reputationRequired: z.number().optional(),
    price: z.number().optional(),
    legacyPointsCost: z.number().optional(),
  }),
});

export type CosmeticItem = z.infer<typeof cosmeticItemSchema>;

export const equippedCosmeticsSchema = z.object({
  shoes: z.string().nullable().default(null),
  gloves: z.string().nullable().default(null),
  outfit: z.string().nullable().default(null),
  ballSkin: z.string().nullable().default(null),
  uiTheme: z.string().nullable().default(null),
});

export type EquippedCosmetics = z.infer<typeof equippedCosmeticsSchema>;

export const AVAILABLE_COSMETICS: CosmeticItem[] = [
  // Shoes
  { id: "shoes-classic", name: "Classic Leather", category: "shoes", description: "Traditional bowling shoes", icon: "Footprints", rarity: "common", unlockMethod: "purchase", unlockRequirement: { price: 500 } },
  { id: "shoes-pro", name: "Pro Performance", category: "shoes", description: "High-performance bowling shoes", icon: "Footprints", rarity: "uncommon", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 30 } },
  { id: "shoes-gold", name: "Golden Steps", category: "shoes", description: "Luxurious gold-trimmed shoes", icon: "Footprints", rarity: "rare", unlockMethod: "achievement", unlockRequirement: { achievementId: "money_maker" } },
  { id: "shoes-legend", name: "Hall of Fame Edition", category: "shoes", description: "Reserved for legends only", icon: "Footprints", rarity: "legendary", unlockMethod: "legacy", unlockRequirement: { legacyPointsCost: 15 } },
  // Gloves
  { id: "gloves-basic", name: "Starter Grip", category: "gloves", description: "Basic bowling glove", icon: "Hand", rarity: "common", unlockMethod: "purchase", unlockRequirement: { price: 300 } },
  { id: "gloves-power", name: "Power Grip", category: "gloves", description: "Enhanced grip for power throws", icon: "Hand", rarity: "uncommon", unlockMethod: "challenge", unlockRequirement: { challengeReward: true } },
  { id: "gloves-chrome", name: "Chrome Finish", category: "gloves", description: "Sleek metallic gloves", icon: "Hand", rarity: "rare", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 50 } },
  { id: "gloves-fire", name: "Flame Master", category: "gloves", description: "For the hottest bowlers", icon: "Hand", rarity: "legendary", unlockMethod: "achievement", unlockRequirement: { achievementId: "first_300_game" } },
  // Outfits
  { id: "outfit-casual", name: "Casual Friday", category: "outfit", description: "Relaxed bowling attire", icon: "Shirt", rarity: "common", unlockMethod: "purchase", unlockRequirement: { price: 750 } },
  { id: "outfit-team", name: "Team Jersey", category: "outfit", description: "Official league jersey", icon: "Shirt", rarity: "uncommon", unlockMethod: "achievement", unlockRequirement: { achievementId: "first_league_championship" } },
  { id: "outfit-pro", name: "Pro Tour Uniform", category: "outfit", description: "Professional tour outfit", icon: "Shirt", rarity: "rare", unlockMethod: "achievement", unlockRequirement: { achievementId: "went_pro" } },
  { id: "outfit-champion", name: "Champion's Robe", category: "outfit", description: "The mark of a true champion", icon: "Shirt", rarity: "legendary", unlockMethod: "legacy", unlockRequirement: { legacyPointsCost: 20 } },
  // Ball Skins
  { id: "ball-classic", name: "Classic Black", category: "ball-skin", description: "Traditional black finish", icon: "Circle", rarity: "common", unlockMethod: "purchase", unlockRequirement: { price: 400 } },
  { id: "ball-flames", name: "Fire Pattern", category: "ball-skin", description: "Blazing flame design", icon: "Circle", rarity: "uncommon", unlockMethod: "challenge", unlockRequirement: { challengeReward: true } },
  { id: "ball-galaxy", name: "Galaxy Swirl", category: "ball-skin", description: "Cosmic galaxy pattern", icon: "Circle", rarity: "rare", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 60 } },
  { id: "ball-diamond", name: "Diamond Edition", category: "ball-skin", description: "Sparkling diamond finish", icon: "Circle", rarity: "legendary", unlockMethod: "achievement", unlockRequirement: { achievementId: "first_perfect_game" } },
  // UI Themes
  { id: "theme-purple", name: "Violet Storm", category: "ui-theme", description: "Deep purple accent theme", icon: "Palette", rarity: "common", unlockMethod: "purchase", unlockRequirement: { price: 200 } },
  { id: "theme-green", name: "Emerald Lane", category: "ui-theme", description: "Fresh green accent theme", icon: "Palette", rarity: "uncommon", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 25 } },
  { id: "theme-gold", name: "Golden Era", category: "ui-theme", description: "Luxurious gold accent theme", icon: "Palette", rarity: "rare", unlockMethod: "achievement", unlockRequirement: { achievementId: "first_tournament_win" } },
  { id: "theme-rainbow", name: "Strike Spectrum", category: "ui-theme", description: "Animated rainbow theme", icon: "Palette", rarity: "legendary", unlockMethod: "legacy", unlockRequirement: { legacyPointsCost: 10 } },
];

// ============================================
// SPONSORSHIP NEGOTIATION SYSTEM
// ============================================
export const sponsorTierSchema = z.enum(["local", "regional", "national", "elite"]);
export type SponsorTier = z.infer<typeof sponsorTierSchema>;

export const negotiatedSponsorSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: sponsorTierSchema,
  weeklyStipend: z.number(),
  tournamentBonus: z.number(), // Percentage of winnings
  requirements: z.object({
    minAverage: z.number(),
    minReputation: z.number(),
    tournamentsPerSeason: z.number(),
  }),
  penalties: z.object({
    repLossPerWeek: z.number(), // Rep lost if requirements not met
    canBeFired: z.boolean(),
  }),
  weeksRemaining: z.number(),
  tournamentsEntered: z.number().default(0),
  requirementsMet: z.boolean().default(true),
  warningGiven: z.boolean().default(false),
});

export type NegotiatedSponsor = z.infer<typeof negotiatedSponsorSchema>;

export const sponsorOfferSchema = z.object({
  sponsor: z.object({
    id: z.string(),
    name: z.string(),
    tier: sponsorTierSchema,
  }),
  safeOffer: z.object({
    weeklyStipend: z.number(),
    tournamentBonus: z.number(),
    requirements: z.object({
      minAverage: z.number(),
      minReputation: z.number(),
      tournamentsPerSeason: z.number(),
    }),
    contractWeeks: z.number(),
  }),
  negotiatedOffer: z.object({
    weeklyStipend: z.number(),
    tournamentBonus: z.number(),
    requirements: z.object({
      minAverage: z.number(),
      minReputation: z.number(),
      tournamentsPerSeason: z.number(),
    }),
    contractWeeks: z.number(),
    negotiationSuccessChance: z.number(), // 0-100
  }),
});

export type SponsorOffer = z.infer<typeof sponsorOfferSchema>;

export const SPONSOR_TEMPLATES: Array<{ id: string; name: string; tier: SponsorTier; baseStipend: number; baseBonus: number; baseReqs: { avg: number; rep: number; tournaments: number } }> = [
  { id: "local-lanes", name: "Local Lanes Alley", tier: "local", baseStipend: 100, baseBonus: 5, baseReqs: { avg: 140, rep: 15, tournaments: 1 } },
  { id: "bowling-supply-co", name: "Bowling Supply Co.", tier: "local", baseStipend: 150, baseBonus: 8, baseReqs: { avg: 150, rep: 20, tournaments: 2 } },
  { id: "regional-sports", name: "Regional Sports Network", tier: "regional", baseStipend: 300, baseBonus: 10, baseReqs: { avg: 170, rep: 30, tournaments: 3 } },
  { id: "strike-zone-gear", name: "Strike Zone Gear", tier: "regional", baseStipend: 400, baseBonus: 12, baseReqs: { avg: 180, rep: 35, tournaments: 3 } },
  { id: "national-bowling", name: "National Bowling League", tier: "national", baseStipend: 750, baseBonus: 15, baseReqs: { avg: 200, rep: 50, tournaments: 4 } },
  { id: "pro-tour-sponsors", name: "Pro Tour Sponsors Inc.", tier: "national", baseStipend: 1000, baseBonus: 18, baseReqs: { avg: 210, rep: 60, tournaments: 5 } },
  { id: "elite-sports-mgmt", name: "Elite Sports Management", tier: "elite", baseStipend: 2000, baseBonus: 25, baseReqs: { avg: 220, rep: 75, tournaments: 6 } },
  { id: "championship-brands", name: "Championship Brands", tier: "elite", baseStipend: 3000, baseBonus: 30, baseReqs: { avg: 230, rep: 85, tournaments: 8 } },
];

// ============================================
// GAME SETTINGS
// ============================================
export const gameSettingsSchema = z.object({
  celebrationsEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  darkMode: z.boolean().default(true),
  enableAnimations: z.boolean().default(true),
});

export type GameSettings = z.infer<typeof gameSettingsSchema>;

// ============================================
// CAREER STATS / RECORDS (expanded)
// ============================================
export const careerStatsSchema = z.object({
  // Game Records
  highGame: z.number().default(0),
  highSeries: z.number().default(0), // Best 3-game series
  longestStrikeStreak: z.number().default(0),
  // Counts
  totalStrikes: z.number().default(0),
  totalSpares: z.number().default(0),
  totalOpens: z.number().default(0),
  totalSplits: z.number().default(0),
  splitsConverted: z.number().default(0),
  totalTurkeys: z.number().default(0),
  totalDoubles: z.number().default(0),
  perfectGames: z.number().default(0),
  // Competition Records
  leagueWins: z.number().default(0),
  tournamentWins: z.number().default(0),
  bestTournamentFinish: z.number().default(0), // 1 = 1st place, 0 = never competed
  totalTitles: z.number().default(0), // leagues + tournaments
  // Financial
  totalEarnings: z.number().default(0),
  // Rivalries
  rivalWins: z.number().default(0),
  rivalLosses: z.number().default(0),
  // Percentages are calculated dynamically, but we track the frame counts
  totalFrames: z.number().default(0),
  strikeFrames: z.number().default(0),
  spareFrames: z.number().default(0),
});

export type CareerStats = z.infer<typeof careerStatsSchema>;

// ============================================
// ACTIVE EVENT STATE
// ============================================
export const activeEventSchema = z.object({
  competitionId: z.string(),
  competition: competitionSchema,
  opponents: z.array(opponentSchema),
  currentGameIndex: z.number(),
  playerSeriesScores: z.array(z.number()),
  opponentSeriesScores: z.array(z.array(z.number())),
  isComplete: z.boolean(),
  finalPlacement: z.number().optional(),
  prizeWon: z.number().optional(),
});

export type ActiveEvent = z.infer<typeof activeEventSchema>;

// ============================================
// GAME HISTORY
// ============================================
export const gameResultSchema = z.object({
  id: z.string(),
  week: z.number(),
  season: z.number(),
  score: z.number(),
  strikes: z.number(),
  spares: z.number(),
  opens: z.number(),
  competitionId: z.string().optional(),
  competitionName: z.string().optional(),
  oilPattern: oilPatternSchema,
  frames: z.array(z.object({
    throw1: z.number(),
    throw2: z.number().optional(),
    throw3: z.number().optional(),
    score: z.number(),
  })),
});

export type GameResult = z.infer<typeof gameResultSchema>;

// ============================================
// PLAYER PROFILE
// ============================================
export const playerProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  bowlingStyle: bowlingStyleSchema,
  handedness: handednessSchema,
  isProfessional: z.boolean(),
  stats: playerStatsSchema,
  money: z.number(),
  energy: z.number(),
  maxEnergy: z.number().optional(), // Can be boosted via purchases
  currentWeek: z.number(),
  currentSeason: z.number(),
  bowlingAverage: z.number(),
  totalGamesPlayed: z.number(),
  recentGameScores: z.array(z.number()),
  ownedBalls: z.array(bowlingBallSchema),
  activeBallId: z.string().nullable(),
  currentJob: jobSchema.nullable(),
  relationships: z.array(relationshipSchema),
  currentProperty: propertySchema.nullable(),
  activeSponsors: z.array(sponsorSchema),
  gameHistory: z.array(gameResultSchema),
  achievements: z.array(z.string()),
  // New fields for expanded features (all optional for backward compatibility)
  trait: bowlingTraitSchema.optional(),
  rivalries: z.array(rivalrySchema).optional(),
  earnedAchievements: z.array(achievementSchema).optional(),
  purchases: z.array(purchaseRecordSchema).optional(),
  settings: gameSettingsSchema.optional(),
  careerStats: careerStatsSchema.optional(),
  // Coach system
  activeCoach: coachSchema.nullable().optional(),
  // Injury/Slump system
  activeEffects: z.array(activeEffectSchema).optional(),
  // Weekly challenges
  weeklyChallenges: weeklyChallengeStateSchema.optional(),
  // Cosmetic tokens (earned from challenges)
  cosmeticTokens: z.number().optional(),
  // Cosmetics system
  unlockedCosmetics: z.array(z.string()).optional(),
  equippedCosmetics: equippedCosmeticsSchema.optional(),
  // Sponsorship negotiation system (for pros)
  negotiatedSponsor: negotiatedSponsorSchema.nullable().optional(),
  // Season tracking for sponsor requirements
  tournamentsThisSeason: z.number().optional(),
});

export type PlayerProfile = z.infer<typeof playerProfileSchema>;

// ============================================
// SAVE SLOT
// ============================================
export const saveSlotSchema = z.object({
  slotId: z.number().min(1).max(3),
  isEmpty: z.boolean(),
  profile: playerProfileSchema.nullable(),
  lastSaved: z.string().nullable(),
});

export type SaveSlot = z.infer<typeof saveSlotSchema>;

// ============================================
// GAME STATE
// ============================================
export const gameStateSchema = z.object({
  currentSlot: z.number().nullable(),
  saves: z.array(saveSlotSchema),
  legacyData: legacyDataSchema.optional(),
});

export type GameState = z.infer<typeof gameStateSchema>;

// ============================================
// FRAME RESULT (for simulation)
// ============================================
export const frameResultSchema = z.object({
  frameNumber: z.number().min(1).max(10),
  throw1: z.number().min(0).max(10),
  throw2: z.number().min(0).max(10).optional(),
  throw3: z.number().min(0).max(10).optional(),
  isStrike: z.boolean(),
  isSpare: z.boolean(),
  isOpen: z.boolean(),
  pinsRemaining: z.number(),
  frameScore: z.number(),
  runningTotal: z.number(),
});

export type FrameResult = z.infer<typeof frameResultSchema>;

// Keep existing user schema for compatibility
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
