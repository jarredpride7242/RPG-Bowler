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
});

export type Opponent = z.infer<typeof opponentSchema>;

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
