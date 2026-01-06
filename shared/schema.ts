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
  // Weekly Random Events
  EVENT_RATE: 0.65, // 65% chance any event happens weekly
  MAJOR_EVENT_RATE: 0.15, // 15% chance the event is a major one
  // Dating system
  DATE_ENERGY_COST: 15,
  DATE_BASE_MONEY_COST: 50,
  RELATIONSHIP_PERK_THRESHOLDS: { tier1: 25, tier2: 50, tier3: 75 },
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
export const ballRaritySchema = z.enum(["common", "rare", "epic", "legendary"]);
export const laneConditionSchema = z.enum(["dry", "medium", "heavy"]);

export type BallRarity = z.infer<typeof ballRaritySchema>;
export type LaneCondition = z.infer<typeof laneConditionSchema>;

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
  rarity: ballRaritySchema.optional(),
  visualSeed: z.number().optional(),
  rg: z.number().min(2.4).max(2.8).optional(),
  differential: z.number().min(0.01).max(0.06).optional(),
  recommendedCondition: laneConditionSchema.optional(),
  series: z.string().optional(),
  tagline: z.string().optional(),
});

export type BowlingBall = z.infer<typeof bowlingBallSchema>;

// Ball rarity weights for generation
export const BALL_RARITY_WEIGHTS: Record<BallRarity, number> = {
  common: 50,
  rare: 30,
  epic: 15,
  legendary: 5,
};

// Price multipliers by rarity
export const BALL_RARITY_PRICE_MULTIPLIER: Record<BallRarity, number> = {
  common: 1,
  rare: 1.5,
  epic: 2.5,
  legendary: 4,
};

// Stat bonus ranges by rarity
export const BALL_RARITY_STAT_BONUS: Record<BallRarity, { min: number; max: number }> = {
  common: { min: 0, max: 1 },
  rare: { min: 1, max: 2 },
  epic: { min: 2, max: 3 },
  legendary: { min: 3, max: 4 },
};

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
// RELATIONSHIP (Legacy - keeping for compatibility)
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
// WEEKLY RANDOM EVENTS SYSTEM
// ============================================
export const weeklyEventCategorySchema = z.enum([
  "performance", "money", "equipment", "bowling", "social"
]);
export type WeeklyEventCategory = z.infer<typeof weeklyEventCategorySchema>;

export const eventChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  cost: z.object({
    money: z.number().optional(),
    energy: z.number().optional(),
  }).optional(),
  outcome: z.object({
    money: z.number().optional(),
    energy: z.number().optional(),
    reputation: z.number().optional(),
    statBonus: z.object({
      stat: z.string(),
      amount: z.number(),
      weeks: z.number(),
    }).optional(),
    statPenalty: z.object({
      stat: z.string(),
      amount: z.number(),
      weeks: z.number(),
    }).optional(),
    relationshipChange: z.number().optional(),
  }),
});

export type EventChoice = z.infer<typeof eventChoiceSchema>;

export const weeklyEventTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: weeklyEventCategorySchema,
  weight: z.number(), // Higher = more common
  isMajor: z.boolean(),
  choices: z.array(eventChoiceSchema),
  requiresPro: z.boolean().optional(),
  requiresRelationship: z.boolean().optional(),
});

export type WeeklyEventTemplate = z.infer<typeof weeklyEventTemplateSchema>;

export const triggeredEventSchema = z.object({
  eventId: z.string(),
  title: z.string(),
  description: z.string(),
  category: weeklyEventCategorySchema,
  choices: z.array(eventChoiceSchema),
  weekTriggered: z.number(),
  resolved: z.boolean(),
  choiceMade: z.string().optional(),
  isMajorEvent: z.boolean().optional(),
});

export type TriggeredEvent = z.infer<typeof triggeredEventSchema>;

export const activeEventEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  effectType: z.enum(["buff", "debuff"]),
  stat: z.string().optional(),
  amount: z.number(),
  weeksRemaining: z.number(),
  sourceEventId: z.string(),
});

export type ActiveEventEffect = z.infer<typeof activeEventEffectSchema>;

// ============================================
// ENHANCED DATING SYSTEM
// ============================================
export const datingStatusSchema = z.enum(["none", "talking", "dating", "exclusive", "broken-up"]);
export type DatingStatus = z.infer<typeof datingStatusSchema>;

export const datingMatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  bio: z.string(),
  compatibilityTags: z.array(z.string()),
  avatarSeed: z.number(), // For procedural avatar generation
  personality: z.enum(["outgoing", "reserved", "adventurous", "homebody", "ambitious", "laid-back"]),
  interests: z.array(z.string()),
  matchScore: z.number(), // 0-100 based on player charisma
});

export type DatingMatch = z.infer<typeof datingMatchSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(["player", "match"]),
  text: z.string(),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  relationshipChange: z.number(),
  nextMessageId: z.string().optional(),
  unlocksDate: z.boolean().optional(),
  isFlirty: z.boolean().optional(),
  requiresCharisma: z.number().optional(),
});

export type ChatChoice = z.infer<typeof chatChoiceSchema>;

export const chatStepSchema = z.object({
  id: z.string(),
  matchMessage: z.string(),
  playerChoices: z.array(chatChoiceSchema),
  isTerminal: z.boolean().optional(),
});

export type ChatStep = z.infer<typeof chatStepSchema>;

export const activeDatingProfileSchema = z.object({
  matchId: z.string(),
  match: datingMatchSchema,
  status: datingStatusSchema,
  relationshipLevel: z.number().min(0).max(100),
  chatHistory: z.array(chatMessageSchema),
  currentChatStep: z.string().optional(),
  datesTaken: z.number(),
  lastInteractionWeek: z.number(),
  isCurrentPartner: z.boolean(),
  jealousyLevel: z.number().min(0).max(100).optional(),
  weekStarted: z.number(),
});

export type ActiveDatingProfile = z.infer<typeof activeDatingProfileSchema>;

export const dateOutcomeSchema = z.enum(["great", "good", "neutral", "bad", "disaster"]);
export type DateOutcome = z.infer<typeof dateOutcomeSchema>;

export const datingSystemStateSchema = z.object({
  availableMatches: z.array(datingMatchSchema),
  activeProfiles: z.array(activeDatingProfileSchema),
  currentPartnerId: z.string().nullable(),
  relationshipHistory: z.array(z.object({
    matchId: z.string(),
    matchName: z.string(),
    peakLevel: z.number(),
    weekStarted: z.number(),
    weekEnded: z.number().optional(),
    endReason: z.string().optional(),
  })),
  lastMatchRefreshWeek: z.number(),
});

export type DatingSystemState = z.infer<typeof datingSystemStateSchema>;

// Weekly Event Templates (12+ events across categories)
export const WEEKLY_EVENT_TEMPLATES: WeeklyEventTemplate[] = [
  // PERFORMANCE EVENTS
  {
    id: "hot-streak",
    title: "Hot Streak!",
    description: "You're in the zone! Your practice sessions have been exceptional lately.",
    category: "performance",
    weight: 15,
    isMajor: false,
    choices: [
      {
        id: "capitalize",
        label: "Capitalize (+5 Accuracy for 3 weeks)",
        outcome: { statBonus: { stat: "accuracy", amount: 5, weeks: 3 } },
      },
      {
        id: "rest",
        label: "Take it easy (recover 20 energy)",
        outcome: { energy: 20 },
      },
    ],
  },
  {
    id: "slump",
    title: "Rough Patch",
    description: "Nothing is clicking. Your throws feel off and confidence is shaken.",
    category: "performance",
    weight: 12,
    isMajor: false,
    choices: [
      {
        id: "push-through",
        label: "Push through (risk: -3 consistency, 2 weeks)",
        outcome: { statPenalty: { stat: "consistency", amount: 3, weeks: 2 } },
      },
      {
        id: "take-break",
        label: "Take a mental break (-15 energy, clear head)",
        cost: { energy: 15 },
        outcome: { statBonus: { stat: "mentalToughness", amount: 3, weeks: 2 } },
      },
    ],
  },
  {
    id: "clutch-confidence",
    title: "Clutch Moment",
    description: "A tough spare in practice gives you a confidence boost!",
    category: "performance",
    weight: 10,
    isMajor: false,
    choices: [
      {
        id: "embrace",
        label: "Embrace the feeling (+4 Mental Toughness, 2 weeks)",
        outcome: { statBonus: { stat: "mentalToughness", amount: 4, weeks: 2 } },
      },
    ],
  },
  {
    id: "spare-focus",
    title: "Spare Practice Breakthrough",
    description: "Your spare shooting practice has paid off!",
    category: "performance",
    weight: 10,
    isMajor: false,
    choices: [
      {
        id: "continue",
        label: "Keep practicing (+5 Spare Shooting, 3 weeks)",
        cost: { energy: 10 },
        outcome: { statBonus: { stat: "spareShooting", amount: 5, weeks: 3 } },
      },
      {
        id: "skip",
        label: "Save energy for competition",
        outcome: {},
      },
    ],
  },
  // MONEY/JOBS EVENTS
  {
    id: "side-gig",
    title: "Side Gig Offer",
    description: "A local bowling alley wants you to help coach beginners for extra cash.",
    category: "money",
    weight: 12,
    isMajor: false,
    choices: [
      {
        id: "accept",
        label: "Accept (+$150, -20 energy)",
        cost: { energy: 20 },
        outcome: { money: 150, reputation: 2 },
      },
      {
        id: "decline",
        label: "Decline (focus on your game)",
        outcome: {},
      },
    ],
  },
  {
    id: "pay-raise",
    title: "Job Performance Review",
    description: "Your employer notices your dedication. A raise might be on the table.",
    category: "money",
    weight: 8,
    isMajor: true,
    choices: [
      {
        id: "negotiate",
        label: "Negotiate hard (50% chance of +$100/week or nothing)",
        outcome: { money: 100 },
      },
      {
        id: "grateful",
        label: "Accept graciously (+$50 bonus, +reputation)",
        outcome: { money: 50, reputation: 3 },
      },
    ],
  },
  {
    id: "unexpected-bill",
    title: "Unexpected Expense",
    description: "Car trouble! You need to pay for repairs.",
    category: "money",
    weight: 10,
    isMajor: false,
    choices: [
      {
        id: "pay-full",
        label: "Pay in full (-$200)",
        outcome: { money: -200 },
      },
      {
        id: "defer",
        label: "Defer repairs (-10 energy/week, 2 weeks)",
        outcome: { statPenalty: { stat: "stamina", amount: 5, weeks: 2 } },
      },
    ],
  },
  // EQUIPMENT EVENTS
  {
    id: "pro-shop-discount",
    title: "Pro Shop Sale!",
    description: "The local pro shop is having a flash sale on equipment.",
    category: "equipment",
    weight: 10,
    isMajor: false,
    choices: [
      {
        id: "browse",
        label: "Check it out (shop discount this week)",
        outcome: { money: 50 },
      },
      {
        id: "pass",
        label: "Not interested",
        outcome: {},
      },
    ],
  },
  {
    id: "ball-maintenance",
    title: "Ball Maintenance Needed",
    description: "Your ball needs resurfacing to maintain performance.",
    category: "equipment",
    weight: 8,
    isMajor: false,
    choices: [
      {
        id: "resurface",
        label: "Get it resurfaced (-$75, +3 Control, 4 weeks)",
        cost: { money: 75 },
        outcome: { statBonus: { stat: "hookControl", amount: 3, weeks: 4 } },
      },
      {
        id: "delay",
        label: "Bowl as-is (-2 Control, 2 weeks)",
        outcome: { statPenalty: { stat: "hookControl", amount: 2, weeks: 2 } },
      },
    ],
  },
  // BOWLING EVENTS
  {
    id: "lane-surprise",
    title: "Lane Condition Change",
    description: "The lanes at your regular alley have been freshly oiled!",
    category: "bowling",
    weight: 10,
    isMajor: false,
    choices: [
      {
        id: "adapt",
        label: "Practice adapting (+4 Lane Reading, 2 weeks)",
        cost: { energy: 15 },
        outcome: { statBonus: { stat: "laneReading", amount: 4, weeks: 2 } },
      },
      {
        id: "wait",
        label: "Wait for normal conditions",
        outcome: {},
      },
    ],
  },
  {
    id: "clinic-invite",
    title: "Local Clinic Invitation",
    description: "A pro bowler is hosting a clinic nearby!",
    category: "bowling",
    weight: 6,
    isMajor: true,
    choices: [
      {
        id: "attend",
        label: "Attend (-$100, -25 energy, major stat boost)",
        cost: { money: 100, energy: 25 },
        outcome: { statBonus: { stat: "accuracy", amount: 6, weeks: 4 }, reputation: 5 },
      },
      {
        id: "skip",
        label: "Can't make it",
        outcome: {},
      },
    ],
  },
  {
    id: "rivalry-challenge",
    title: "Rival Challenge!",
    description: "A local bowler has called you out for a head-to-head match!",
    category: "bowling",
    weight: 8,
    isMajor: true,
    choices: [
      {
        id: "accept-challenge",
        label: "Accept the challenge (+reputation if you win)",
        cost: { energy: 20 },
        outcome: { reputation: 5 },
      },
      {
        id: "ignore",
        label: "Ignore them (-2 reputation)",
        outcome: { reputation: -2 },
      },
    ],
  },
  // SOCIAL EVENTS
  {
    id: "new-match",
    title: "New Dating Match!",
    description: "Someone new has shown interest in you!",
    category: "social",
    weight: 8,
    isMajor: false,
    choices: [
      {
        id: "explore",
        label: "Check them out",
        outcome: {},
      },
      {
        id: "focus-bowling",
        label: "Too busy with bowling",
        outcome: {},
      },
    ],
  },
  {
    id: "partner-support",
    title: "Supportive Partner",
    description: "Your partner shows up to support you at practice!",
    category: "social",
    weight: 8,
    isMajor: false,
    requiresRelationship: true,
    choices: [
      {
        id: "appreciate",
        label: "Show appreciation (+5 Mental Toughness, 2 weeks)",
        outcome: { statBonus: { stat: "mentalToughness", amount: 5, weeks: 2 }, relationshipChange: 5 },
      },
    ],
  },
  {
    id: "relationship-drama",
    title: "Relationship Tension",
    description: "Your partner is upset you've been spending so much time bowling.",
    category: "social",
    weight: 6,
    isMajor: false,
    requiresRelationship: true,
    choices: [
      {
        id: "apologize",
        label: "Apologize and make time (-15 energy)",
        cost: { energy: 15 },
        outcome: { relationshipChange: 10 },
      },
      {
        id: "explain",
        label: "Explain your passion (50/50 outcome)",
        outcome: { relationshipChange: -5 },
      },
      {
        id: "dismiss",
        label: "Dismiss concerns (-15 relationship)",
        outcome: { relationshipChange: -15 },
      },
    ],
  },
];

// Dating conversation templates
export const DATING_CHAT_TEMPLATES: ChatStep[] = [
  {
    id: "intro",
    matchMessage: "Hey! I saw we matched. What got you into bowling?",
    playerChoices: [
      { id: "passionate", text: "It's my passion! I've been bowling competitively for years.", relationshipChange: 3, nextMessageId: "passionate-response" },
      { id: "casual", text: "Just a fun hobby that turned into something more.", relationshipChange: 2, nextMessageId: "casual-response" },
      { id: "flirty", text: "Looking for strikes on and off the lanes.", relationshipChange: 4, isFlirty: true, requiresCharisma: 50, nextMessageId: "flirty-response" },
    ],
  },
  {
    id: "passionate-response",
    matchMessage: "That's awesome! I love people who are dedicated to their craft. What's your highest score?",
    playerChoices: [
      { id: "humble", text: "I've had some good games, still working to improve!", relationshipChange: 2, nextMessageId: "date-ask" },
      { id: "confident", text: "I've rolled a few great ones. Maybe I can show you sometime?", relationshipChange: 4, unlocksDate: true, nextMessageId: "date-ask" },
    ],
  },
  {
    id: "casual-response",
    matchMessage: "That's cool! I've always wanted to try it. Maybe you could teach me?",
    playerChoices: [
      { id: "offer", text: "I'd love to show you the basics!", relationshipChange: 4, unlocksDate: true, nextMessageId: "date-ask" },
      { id: "shy", text: "Sure, if you're interested sometime.", relationshipChange: 2, nextMessageId: "date-ask" },
    ],
  },
  {
    id: "flirty-response",
    matchMessage: "Smooth! I like confidence. When can we hang out?",
    playerChoices: [
      { id: "soon", text: "How about this weekend?", relationshipChange: 5, unlocksDate: true, nextMessageId: "date-ask" },
      { id: "play-cool", text: "Let's chat a bit more first.", relationshipChange: 2, nextMessageId: "date-ask" },
    ],
  },
  {
    id: "date-ask",
    matchMessage: "I'd really like to see you in person. Want to grab coffee or something?",
    playerChoices: [
      { id: "yes", text: "I'd love that!", relationshipChange: 5, unlocksDate: true },
      { id: "bowling-date", text: "How about a bowling date instead?", relationshipChange: 6, unlocksDate: true },
      { id: "not-yet", text: "Maybe soon, still getting to know you.", relationshipChange: 1 },
    ],
    isTerminal: true,
  },
];

// Names for procedural match generation
export const DATING_FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery",
  "Jamie", "Sam", "Charlie", "Drew", "Skyler", "Reese", "Parker", "Blake"
];

export const DATING_INTERESTS = [
  "sports", "music", "movies", "travel", "food", "fitness", "gaming", "art",
  "reading", "hiking", "cooking", "photography", "dancing", "animals", "nature"
];

export const DATING_COMPATIBILITY_TAGS = [
  "competitive", "laid-back", "adventurous", "homebody", "social", "quiet",
  "ambitious", "creative", "athletic", "intellectual", "romantic", "practical"
];

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
export type CompetitionTier = z.infer<typeof competitionTierSchema>;

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
// EXPANDED LEAGUE SYSTEM
// ============================================
export const leagueTypeSchema = z.enum(["casual", "competitive", "pro"]);
export type LeagueType = z.infer<typeof leagueTypeSchema>;

export const LEAGUE_DEFINITIONS: Record<LeagueType, { 
  name: string; 
  description: string; 
  entryFee: number; 
  energyCost: number; 
  weeklyPrize: number;
  seasonLength: number;
  oilPattern: OilPattern;
  tier: CompetitionTier;
  minAverage: number;
  requiresPro: boolean;
  fieldSize: number;
}> = {
  casual: {
    name: "Casual House League",
    description: "Relaxed weekly bowling with friendly competition",
    entryFee: 20,
    energyCost: 12,
    weeklyPrize: 100,
    seasonLength: 10,
    oilPattern: "house",
    tier: "amateur-local",
    minAverage: 0,
    requiresPro: false,
    fieldSize: 8,
  },
  competitive: {
    name: "Competitive Sport League",
    description: "Challenging sport patterns with bigger payouts",
    entryFee: 50,
    energyCost: 18,
    weeklyPrize: 300,
    seasonLength: 12,
    oilPattern: "sport",
    tier: "amateur-regional",
    minAverage: 160,
    requiresPro: false,
    fieldSize: 12,
  },
  pro: {
    name: "Professional League",
    description: "Elite competition for professional bowlers",
    entryFee: 200,
    energyCost: 25,
    weeklyPrize: 1000,
    seasonLength: 14,
    oilPattern: "long",
    tier: "pro-regional",
    minAverage: 200,
    requiresPro: true,
    fieldSize: 16,
  },
};

export const leagueStandingSchema = z.object({
  bowlerId: z.string(),
  name: z.string(),
  isPlayer: z.boolean(),
  wins: z.number(),
  losses: z.number(),
  totalPins: z.number(),
  gamesPlayed: z.number(),
  highGame: z.number(),
  highSeries: z.number(),
  average: z.number(),
  points: z.number(),
});

export type LeagueStanding = z.infer<typeof leagueStandingSchema>;

export const activeLeagueSchema = z.object({
  id: z.string(),
  leagueType: leagueTypeSchema,
  name: z.string(),
  currentWeek: z.number(),
  seasonLength: z.number(),
  standings: z.array(leagueStandingSchema),
  weeklyResults: z.array(z.object({
    week: z.number(),
    playerScores: z.array(z.number()),
    playerTotal: z.number(),
    opponentName: z.string(),
    opponentScores: z.array(z.number()),
    opponentTotal: z.number(),
    won: z.boolean(),
    pointsEarned: z.number(),
  })),
  isPlayoffs: z.boolean().default(false),
  playoffRound: z.number().optional(),
  isComplete: z.boolean().default(false),
  startedWeek: z.number(),
  oilPattern: oilPatternSchema,
});

export type ActiveLeague = z.infer<typeof activeLeagueSchema>;

// ============================================
// EXPANDED TOURNAMENT SYSTEM
// ============================================
export const tournamentTierSchema = z.enum(["local", "regional", "major"]);
export type TournamentTier = z.infer<typeof tournamentTierSchema>;

export const tournamentFormatSchema = z.enum(["series", "bracket"]);
export type TournamentFormat = z.infer<typeof tournamentFormatSchema>;

export const TOURNAMENT_DEFINITIONS: Record<TournamentTier, {
  name: string;
  description: string;
  entryFee: number;
  energyCost: number;
  prizePool: number;
  gamesCount: number;
  fieldSize: number;
  oilPattern: OilPattern;
  minAverage: number;
  minReputation: number;
  requiresPro: boolean;
}> = {
  local: {
    name: "Local Open",
    description: "Entry-level tournament open to all skill levels",
    entryFee: 50,
    energyCost: 20,
    prizePool: 500,
    gamesCount: 4,
    fieldSize: 16,
    oilPattern: "house",
    minAverage: 0,
    minReputation: 0,
    requiresPro: false,
  },
  regional: {
    name: "Regional Championship",
    description: "Competitive tournament with sport conditions",
    entryFee: 150,
    energyCost: 35,
    prizePool: 2500,
    gamesCount: 6,
    fieldSize: 24,
    oilPattern: "sport",
    minAverage: 170,
    minReputation: 15,
    requiresPro: false,
  },
  major: {
    name: "Major Pro Tournament",
    description: "Elite competition for professional bowlers",
    entryFee: 500,
    energyCost: 50,
    prizePool: 15000,
    gamesCount: 8,
    fieldSize: 32,
    oilPattern: "long",
    minAverage: 205,
    minReputation: 40,
    requiresPro: true,
  },
};

export const tournamentEntrantSchema = z.object({
  id: z.string(),
  name: z.string(),
  isPlayer: z.boolean(),
  bowlingAverage: z.number(),
  scores: z.array(z.number()),
  totalPins: z.number(),
  eliminated: z.boolean().default(false),
  placement: z.number().optional(),
});

export type TournamentEntrant = z.infer<typeof tournamentEntrantSchema>;

export const bracketMatchSchema = z.object({
  round: z.number(),
  matchIndex: z.number(),
  entrant1Id: z.string().nullable(),
  entrant2Id: z.string().nullable(),
  entrant1Score: z.number().optional(),
  entrant2Score: z.number().optional(),
  winnerId: z.string().nullable(),
  isComplete: z.boolean(),
});

export type BracketMatch = z.infer<typeof bracketMatchSchema>;

export const activeTournamentSchema = z.object({
  id: z.string(),
  tier: tournamentTierSchema,
  format: tournamentFormatSchema,
  name: z.string(),
  entrants: z.array(tournamentEntrantSchema),
  currentRound: z.number(),
  currentGame: z.number(),
  totalGames: z.number(),
  bracket: z.array(bracketMatchSchema).optional(),
  qualifyingCutline: z.number().optional(),
  isQualifying: z.boolean().default(true),
  isFinals: z.boolean().default(false),
  isComplete: z.boolean().default(false),
  startedWeek: z.number(),
  oilPattern: oilPatternSchema,
  prizePool: z.number(),
  entryFee: z.number(),
  playerGameScores: z.array(z.number()).optional(),
});

export type ActiveTournament = z.infer<typeof activeTournamentSchema>;

// ============================================
// TOURNAMENT HISTORY
// ============================================
export const tournamentResultSchema = z.object({
  tournamentId: z.string(),
  tournamentName: z.string(),
  tier: tournamentTierSchema,
  format: tournamentFormatSchema,
  placement: z.number(),
  totalEntrants: z.number(),
  totalPins: z.number(),
  gamesPlayed: z.number(),
  prizeMoney: z.number(),
  week: z.number(),
});

export type TournamentResult = z.infer<typeof tournamentResultSchema>;

// ============================================
// OIL PATTERN DETAILS
// ============================================
export const OIL_PATTERN_DETAILS: Record<OilPattern, {
  name: string;
  description: string;
  difficulty: number;
  transitionRate: number;
  hookEffect: number;
}> = {
  house: {
    name: "House Pattern",
    description: "Forgiving recreational pattern with generous margins",
    difficulty: 1,
    transitionRate: 0.8,
    hookEffect: 1.0,
  },
  short: {
    name: "Short Pattern",
    description: "Quick-hooking pattern that rewards precision",
    difficulty: 2,
    transitionRate: 1.2,
    hookEffect: 1.3,
  },
  sport: {
    name: "Sport Pattern",
    description: "Challenging flat pattern requiring accuracy",
    difficulty: 3,
    transitionRate: 1.0,
    hookEffect: 0.9,
  },
  long: {
    name: "Long Pattern",
    description: "Extended oil pattern demanding power and control",
    difficulty: 3,
    transitionRate: 0.7,
    hookEffect: 0.8,
  },
  heavy: {
    name: "Heavy Oil",
    description: "Dense oil requiring strong equipment and revs",
    difficulty: 4,
    transitionRate: 0.5,
    hookEffect: 0.6,
  },
  dry: {
    name: "Dry Lanes",
    description: "Minimal oil with aggressive ball reaction",
    difficulty: 2,
    transitionRate: 1.5,
    hookEffect: 1.5,
  },
};

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
// BOWLING ALLEY ENVIRONMENT CUSTOMIZATION
// ============================================
export const laneStyleSchema = z.enum(["classic-wood", "modern-synthetic", "neon-glow", "retro-arcade", "luxury-marble", "cosmic-galaxy"]);
export type LaneStyle = z.infer<typeof laneStyleSchema>;

export const lightingStyleSchema = z.enum(["standard", "dim-ambient", "cosmic-bowling", "spotlight", "sunset-warm", "ice-blue"]);
export type LightingStyle = z.infer<typeof lightingStyleSchema>;

export const seatingStyleSchema = z.enum(["basic-bench", "leather-lounge", "retro-booth", "premium-suite", "minimalist-modern", "vip-private"]);
export type SeatingStyle = z.infer<typeof seatingStyleSchema>;

export const decorationSchema = z.enum(["none", "trophies", "vintage-signs", "neon-signs", "plants", "sports-memorabilia", "championship-banners"]);
export type Decoration = z.infer<typeof decorationSchema>;

export const floorStyleSchema = z.enum(["carpet-standard", "carpet-galaxy", "hardwood", "polished-concrete", "retro-checkered", "luxury-tile"]);
export type FloorStyle = z.infer<typeof floorStyleSchema>;

export const alleyEnvironmentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["lane", "lighting", "seating", "decoration", "floor", "ambient"]),
  description: z.string(),
  icon: z.string(),
  rarity: z.enum(["common", "uncommon", "rare", "legendary"]),
  unlockMethod: z.enum(["default", "purchase", "reputation", "achievement", "legacy", "pro-status"]),
  unlockRequirement: z.object({
    price: z.number().optional(),
    reputationRequired: z.number().optional(),
    achievementId: z.string().optional(),
    legacyPointsCost: z.number().optional(),
    requiresPro: z.boolean().optional(),
  }),
});

export type AlleyEnvironmentItem = z.infer<typeof alleyEnvironmentItemSchema>;

export const alleyEnvironmentSchema = z.object({
  laneStyle: z.string().default("classic-wood"),
  lightingStyle: z.string().default("standard"),
  seatingStyle: z.string().default("basic-bench"),
  decoration: z.string().default("none"),
  floorStyle: z.string().default("carpet-standard"),
  ambientEffect: z.string().default("none"),
  unlockedItems: z.array(z.string()).default([]),
  alleyName: z.string().default("My Bowling Alley"),
});

export type AlleyEnvironment = z.infer<typeof alleyEnvironmentSchema>;

export const ALLEY_ENVIRONMENT_ITEMS: AlleyEnvironmentItem[] = [
  // Lanes
  { id: "lane-classic-wood", name: "Classic Wood", category: "lane", description: "Traditional maple wood lanes", icon: "Layers", rarity: "common", unlockMethod: "default", unlockRequirement: {} },
  { id: "lane-modern-synthetic", name: "Modern Synthetic", category: "lane", description: "Sleek synthetic lanes", icon: "Layers", rarity: "common", unlockMethod: "purchase", unlockRequirement: { price: 1000 } },
  { id: "lane-neon-glow", name: "Neon Glow", category: "lane", description: "UV-reactive glowing lanes", icon: "Layers", rarity: "uncommon", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 25 } },
  { id: "lane-retro-arcade", name: "Retro Arcade", category: "lane", description: "80s arcade-style lanes", icon: "Layers", rarity: "rare", unlockMethod: "purchase", unlockRequirement: { price: 3500 } },
  { id: "lane-luxury-marble", name: "Luxury Marble", category: "lane", description: "Premium marble-finish lanes", icon: "Layers", rarity: "rare", unlockMethod: "achievement", unlockRequirement: { achievementId: "went_pro" } },
  { id: "lane-cosmic-galaxy", name: "Cosmic Galaxy", category: "lane", description: "Starfield galaxy lanes", icon: "Layers", rarity: "legendary", unlockMethod: "legacy", unlockRequirement: { legacyPointsCost: 25 } },
  // Lighting
  { id: "light-standard", name: "Standard", category: "lighting", description: "Bright standard lighting", icon: "Lightbulb", rarity: "common", unlockMethod: "default", unlockRequirement: {} },
  { id: "light-dim-ambient", name: "Dim Ambient", category: "lighting", description: "Soft ambient glow", icon: "Lightbulb", rarity: "common", unlockMethod: "purchase", unlockRequirement: { price: 500 } },
  { id: "light-cosmic-bowling", name: "Cosmic Bowling", category: "lighting", description: "Blacklight UV effects", icon: "Lightbulb", rarity: "uncommon", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 20 } },
  { id: "light-spotlight", name: "Spotlight", category: "lighting", description: "Dramatic lane spotlights", icon: "Lightbulb", rarity: "uncommon", unlockMethod: "purchase", unlockRequirement: { price: 1500 } },
  { id: "light-sunset-warm", name: "Sunset Warm", category: "lighting", description: "Golden hour ambiance", icon: "Lightbulb", rarity: "rare", unlockMethod: "achievement", unlockRequirement: { achievementId: "first_tournament_win" } },
  { id: "light-ice-blue", name: "Ice Blue", category: "lighting", description: "Cool blue illumination", icon: "Lightbulb", rarity: "legendary", unlockMethod: "pro-status", unlockRequirement: { requiresPro: true } },
  // Seating
  { id: "seat-basic-bench", name: "Basic Bench", category: "seating", description: "Standard bowling benches", icon: "Armchair", rarity: "common", unlockMethod: "default", unlockRequirement: {} },
  { id: "seat-leather-lounge", name: "Leather Lounge", category: "seating", description: "Comfortable leather chairs", icon: "Armchair", rarity: "common", unlockMethod: "purchase", unlockRequirement: { price: 800 } },
  { id: "seat-retro-booth", name: "Retro Booth", category: "seating", description: "Classic diner-style booths", icon: "Armchair", rarity: "uncommon", unlockMethod: "purchase", unlockRequirement: { price: 1800 } },
  { id: "seat-premium-suite", name: "Premium Suite", category: "seating", description: "Luxury recliner seating", icon: "Armchair", rarity: "rare", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 50 } },
  { id: "seat-minimalist-modern", name: "Minimalist Modern", category: "seating", description: "Sleek modern design", icon: "Armchair", rarity: "rare", unlockMethod: "purchase", unlockRequirement: { price: 3000 } },
  { id: "seat-vip-private", name: "VIP Private", category: "seating", description: "Exclusive private booth", icon: "Armchair", rarity: "legendary", unlockMethod: "legacy", unlockRequirement: { legacyPointsCost: 15 } },
  // Decorations
  { id: "deco-none", name: "None", category: "decoration", description: "Clean, minimal look", icon: "Square", rarity: "common", unlockMethod: "default", unlockRequirement: {} },
  { id: "deco-trophies", name: "Trophy Display", category: "decoration", description: "Your tournament trophies", icon: "Trophy", rarity: "common", unlockMethod: "achievement", unlockRequirement: { achievementId: "first_tournament_win" } },
  { id: "deco-vintage-signs", name: "Vintage Signs", category: "decoration", description: "Classic bowling signs", icon: "Image", rarity: "uncommon", unlockMethod: "purchase", unlockRequirement: { price: 600 } },
  { id: "deco-neon-signs", name: "Neon Signs", category: "decoration", description: "Glowing neon artwork", icon: "Zap", rarity: "uncommon", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 30 } },
  { id: "deco-plants", name: "Indoor Plants", category: "decoration", description: "Lush greenery accents", icon: "Leaf", rarity: "rare", unlockMethod: "purchase", unlockRequirement: { price: 1200 } },
  { id: "deco-sports-memorabilia", name: "Sports Memorabilia", category: "decoration", description: "Signed bowling artifacts", icon: "Medal", rarity: "rare", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 60 } },
  { id: "deco-championship-banners", name: "Championship Banners", category: "decoration", description: "Your championship banners", icon: "Flag", rarity: "legendary", unlockMethod: "achievement", unlockRequirement: { achievementId: "first_league_championship" } },
  // Floors
  { id: "floor-carpet-standard", name: "Standard Carpet", category: "floor", description: "Classic bowling alley carpet", icon: "Grid3X3", rarity: "common", unlockMethod: "default", unlockRequirement: {} },
  { id: "floor-carpet-galaxy", name: "Galaxy Carpet", category: "floor", description: "Space-themed carpet", icon: "Grid3X3", rarity: "uncommon", unlockMethod: "purchase", unlockRequirement: { price: 1000 } },
  { id: "floor-hardwood", name: "Hardwood", category: "floor", description: "Premium hardwood floors", icon: "Grid3X3", rarity: "uncommon", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 35 } },
  { id: "floor-polished-concrete", name: "Polished Concrete", category: "floor", description: "Modern industrial style", icon: "Grid3X3", rarity: "rare", unlockMethod: "purchase", unlockRequirement: { price: 2000 } },
  { id: "floor-retro-checkered", name: "Retro Checkered", category: "floor", description: "Classic checkered pattern", icon: "Grid3X3", rarity: "rare", unlockMethod: "purchase", unlockRequirement: { price: 2500 } },
  { id: "floor-luxury-tile", name: "Luxury Tile", category: "floor", description: "Elegant marble tiles", icon: "Grid3X3", rarity: "legendary", unlockMethod: "legacy", unlockRequirement: { legacyPointsCost: 20 } },
  // Ambient Effects
  { id: "ambient-none", name: "No Effect", category: "ambient", description: "Standard atmosphere", icon: "Circle", rarity: "common", unlockMethod: "default", unlockRequirement: {} },
  { id: "ambient-fog", name: "Light Fog", category: "ambient", description: "Subtle fog machine", icon: "Cloud", rarity: "uncommon", unlockMethod: "purchase", unlockRequirement: { price: 750 } },
  { id: "ambient-laser", name: "Laser Show", category: "ambient", description: "Moving laser patterns", icon: "Sparkles", rarity: "rare", unlockMethod: "reputation", unlockRequirement: { reputationRequired: 45 } },
  { id: "ambient-confetti", name: "Celebration Confetti", category: "ambient", description: "Confetti on strikes", icon: "PartyPopper", rarity: "rare", unlockMethod: "achievement", unlockRequirement: { achievementId: "first_300_game" } },
  { id: "ambient-fireworks", name: "Mini Fireworks", category: "ambient", description: "Firework effects", icon: "Flame", rarity: "legendary", unlockMethod: "legacy", unlockRequirement: { legacyPointsCost: 30 } },
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
// OWNED BOWLING ALLEY
// ============================================
export const BOWLING_ALLEY_CONSTANTS = {
  PURCHASE_COST: 1000000,
  BASE_WEEKLY_PROFIT: 5000,
  MAX_UPGRADE_LEVEL: 5,
  UPGRADE_COSTS: [0, 100000, 250000, 500000, 750000, 1000000],
  PROFIT_MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 4],
};

export const ownedBowlingAlleySchema = z.object({
  name: z.string(),
  purchaseWeek: z.number(),
  purchaseSeason: z.number(),
  upgradeLevel: z.number().min(0).max(5),
  totalProfitEarned: z.number(),
  weeklyProfit: z.number(),
});

export type OwnedBowlingAlley = z.infer<typeof ownedBowlingAlleySchema>;

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
  // Expanded competition system
  activeLeague: activeLeagueSchema.nullable().optional(),
  activeTournament: activeTournamentSchema.nullable().optional(),
  tournamentHistory: z.array(tournamentResultSchema).optional(),
  leagueChampionships: z.number().optional(),
  // Bowling alley environment customization
  alleyEnvironment: alleyEnvironmentSchema.optional(),
  // Weekly random events system
  weeklyEventHistory: z.array(triggeredEventSchema).optional(),
  activeEventEffects: z.array(activeEventEffectSchema).optional(),
  pendingEvent: triggeredEventSchema.nullable().optional(),
  lastEventWeek: z.number().optional(),
  // Enhanced dating system
  datingState: datingSystemStateSchema.optional(),
  // Owned bowling alley (pro-only, $1M purchase)
  ownedBowlingAlley: ownedBowlingAlleySchema.nullable().optional(),
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
