import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { 
  GameState, 
  SaveSlot, 
  PlayerProfile, 
  PlayerStats, 
  BowlingStyle, 
  Handedness,
  BowlingBall,
  Job,
  Relationship,
  Property,
  GameResult,
  Sponsor,
  BowlingTrait,
  Rivalry,
  Achievement,
  AchievementId,
  PurchaseId,
  PurchaseRecord,
  GameSettings,
  CareerStats,
  Coach,
  ActiveEffect,
  WeeklyChallenge,
  WeeklyChallengeState,
  LegacyData,
  HallOfFameEntry,
  RecoveryAction,
  CosmeticItem,
  CosmeticCategory,
  EquippedCosmetics,
  NegotiatedSponsor,
  SponsorOffer,
  SponsorTier
} from "@shared/schema";
import { 
  GAME_CONSTANTS, 
  IAP_PRODUCTS, 
  ACHIEVEMENT_INFO, 
  AVAILABLE_COACHES, 
  POSSIBLE_EFFECTS, 
  RECOVERY_ACTIONS,
  CHALLENGE_TEMPLATES,
  LEGACY_BONUSES,
  AVAILABLE_COSMETICS,
  SPONSOR_TEMPLATES
} from "@shared/schema";

const STORAGE_KEY = "strike-force-game-state";

function getDefaultCareerStats(): import("@shared/schema").CareerStats {
  return {
    highGame: 0,
    highSeries: 0,
    longestStrikeStreak: 0,
    totalStrikes: 0,
    totalSpares: 0,
    totalOpens: 0,
    totalSplits: 0,
    splitsConverted: 0,
    totalTurkeys: 0,
    totalDoubles: 0,
    perfectGames: 0,
    leagueWins: 0,
    tournamentWins: 0,
    bestTournamentFinish: 0,
    totalTitles: 0,
    totalEarnings: 0,
    rivalWins: 0,
    rivalLosses: 0,
    totalFrames: 0,
    strikeFrames: 0,
    spareFrames: 0,
  };
}

function generateStarterBall(): BowlingBall {
  return {
    id: "starter-ball",
    name: "Beginner's Choice",
    type: "plastic",
    coreType: "symmetric",
    hookPotential: 2,
    control: 7,
    backendReaction: 2,
    oilHandling: 3,
    forgiveness: 8,
    price: 0,
    owned: true,
  };
}

function generateStarterStats(): PlayerStats {
  return {
    throwPower: 35 + Math.floor(Math.random() * 10),
    accuracy: 30 + Math.floor(Math.random() * 10),
    hookControl: 25 + Math.floor(Math.random() * 10),
    revRate: 30 + Math.floor(Math.random() * 10),
    speedControl: 35 + Math.floor(Math.random() * 10),
    consistency: 30 + Math.floor(Math.random() * 10),
    spareShooting: 35 + Math.floor(Math.random() * 10),
    mentalToughness: 40 + Math.floor(Math.random() * 10),
    laneReading: 25 + Math.floor(Math.random() * 10),
    equipmentKnowledge: 20 + Math.floor(Math.random() * 5),
    stamina: 50 + Math.floor(Math.random() * 10),
    charisma: 30 + Math.floor(Math.random() * 15),
    reputation: 5,
  };
}

function createEmptySaveSlots(): SaveSlot[] {
  return [1, 2, 3].map(slotId => ({
    slotId,
    isEmpty: true,
    profile: null,
    lastSaved: null,
  }));
}

function migrateBowlingBall(ball: BowlingBall): BowlingBall {
  const needsMigration = ball.rarity === undefined || ball.visualSeed === undefined;
  if (!needsMigration) return ball;
  
  const idHash = ball.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const totalStats = ball.hookPotential + ball.backendReaction + ball.oilHandling;
  
  let rarity: "common" | "rare" | "epic" | "legendary" = "common";
  if (totalStats >= 24 || ball.price >= 350) rarity = "legendary";
  else if (totalStats >= 20 || ball.price >= 250) rarity = "epic";
  else if (totalStats >= 15 || ball.price >= 150) rarity = "rare";
  
  const conditionMap: Record<string, "dry" | "medium" | "heavy"> = {
    plastic: "dry",
    urethane: "medium",
    "reactive-solid": "heavy",
    "reactive-pearl": "medium",
    "reactive-hybrid": "heavy",
  };
  
  return {
    ...ball,
    rarity: ball.rarity ?? rarity,
    visualSeed: ball.visualSeed ?? idHash,
    rg: ball.rg ?? Number((2.4 + (idHash % 40) / 100).toFixed(3)),
    differential: ball.differential ?? Number((0.01 + (idHash % 50) / 1000).toFixed(3)),
    recommendedCondition: ball.recommendedCondition ?? conditionMap[ball.type] ?? "medium",
    series: ball.series ?? "Classic Collection",
    tagline: ball.tagline ?? "A reliable performer for any skill level.",
  };
}

function migratePlayerProfile(profile: PlayerProfile): PlayerProfile {
  const migratedBalls = profile.ownedBalls.map(migrateBowlingBall);
  const ballsNeedUpdate = profile.ownedBalls.some((b, i) => b !== migratedBalls[i]);
  
  const migratedProfile: PlayerProfile = {
    ...profile,
    ownedBalls: migratedBalls,
    activeLeague: profile.activeLeague ?? null,
    activeTournament: profile.activeTournament ?? null,
    tournamentHistory: profile.tournamentHistory ?? [],
    leagueChampionships: profile.leagueChampionships ?? 0,
  };
  
  return migratedProfile;
}

function loadGameState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state: GameState = JSON.parse(stored);
      
      state.saves = state.saves.map(slot => {
        if (slot.profile) {
          return {
            ...slot,
            profile: migratePlayerProfile(slot.profile),
          };
        }
        return slot;
      });
      
      return state;
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
  return {
    currentSlot: null,
    saves: createEmptySaveSlots(),
  };
}

function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save game state:", e);
  }
}

interface GameContextType {
  gameState: GameState;
  currentProfile: PlayerProfile | null;
  currentSlot: number | null;
  isPlaying: boolean;
  
  createNewGame: (slotId: number, firstName: string, lastName: string, style: BowlingStyle, handedness: Handedness, trait?: BowlingTrait) => void;
  loadGame: (slotId: number) => void;
  saveCurrentGame: () => void;
  deleteGame: (slotId: number) => void;
  exitToMenu: () => void;
  
  updateProfile: (updates: Partial<PlayerProfile>) => void;
  updateStats: (updates: Partial<PlayerStats>) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  useEnergy: (amount: number) => boolean;
  advanceWeek: () => void;
  
  addBowlingBall: (ball: BowlingBall) => void;
  setActiveBall: (ballId: string) => void;
  
  setCurrentJob: (job: Job | null) => void;
  
  addGameResult: (result: GameResult) => void;
  
  goProfessional: () => boolean;
  
  // New feature handlers
  setTrait: (trait: BowlingTrait) => void;
  makePurchase: (purchaseId: PurchaseId) => boolean;
  hasPurchased: (purchaseId: PurchaseId) => boolean;
  restorePurchases: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  getSettings: () => GameSettings;
  getMaxEnergy: () => number;
  updateRivalry: (opponentId: string, opponentName: string, won: boolean) => void;
  checkAndAwardAchievements: () => void;
  hasAchievement: (achievementId: AchievementId) => boolean;
  updateCareerStats: (updates: Partial<CareerStats>) => void;
  
  // Coach system
  hireCoach: (coachId: string) => boolean;
  fireCoach: () => void;
  getActiveCoach: () => Coach | null;
  canHireCoach: (coach: Coach) => boolean;
  
  // Injury/Slump system
  getActiveEffects: () => ActiveEffect[];
  applyRecoveryAction: (actionId: string, effectId: string) => boolean;
  
  // Weekly Challenges
  getWeeklyChallenges: () => WeeklyChallenge[];
  updateChallengeProgress: (challengeId: string, amount: number) => void;
  claimChallengeReward: (challengeId: string) => boolean;
  
  // Legacy/Prestige
  getLegacyData: () => LegacyData;
  canRetire: () => boolean;
  retire: () => number;
  applyLegacyBonus: (bonusId: string) => boolean;
  
  // Cosmetics system
  getAvailableCosmetics: () => CosmeticItem[];
  getUnlockedCosmetics: () => string[];
  getEquippedCosmetics: () => EquippedCosmetics;
  canUnlockCosmetic: (cosmeticId: string) => boolean;
  unlockCosmetic: (cosmeticId: string) => boolean;
  equipCosmetic: (cosmeticId: string | null, category: CosmeticCategory) => void;
  
  // Sponsorship negotiation system
  getAvailableSponsorOffers: () => SponsorOffer[];
  getNegotiatedSponsor: () => NegotiatedSponsor | null;
  acceptSponsorOffer: (offer: SponsorOffer, negotiated: boolean) => boolean;
  cancelSponsorContract: () => void;
  incrementTournamentCount: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  
  const currentSlot = gameState.currentSlot;
  const currentProfile = currentSlot !== null 
    ? gameState.saves.find(s => s.slotId === currentSlot)?.profile ?? null
    : null;
  const isPlaying = currentProfile !== null;

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const createNewGame = useCallback((
    slotId: number, 
    firstName: string, 
    lastName: string, 
    style: BowlingStyle, 
    handedness: Handedness,
    trait?: BowlingTrait
  ) => {
    const starterBall = generateStarterBall();
    const newProfile: PlayerProfile = {
      firstName,
      lastName,
      bowlingStyle: style,
      handedness,
      isProfessional: false,
      stats: generateStarterStats(),
      money: GAME_CONSTANTS.STARTING_MONEY,
      energy: GAME_CONSTANTS.STARTING_ENERGY,
      maxEnergy: GAME_CONSTANTS.MAX_ENERGY,
      currentWeek: 1,
      currentSeason: 1,
      bowlingAverage: 0,
      totalGamesPlayed: 0,
      recentGameScores: [],
      ownedBalls: [starterBall],
      activeBallId: starterBall.id,
      currentJob: null,
      relationships: [],
      currentProperty: null,
      activeSponsors: [],
      gameHistory: [],
      achievements: [],
      trait: trait || "tweener",
      rivalries: [],
      earnedAchievements: [],
      purchases: [],
      settings: {
        celebrationsEnabled: true,
        soundEnabled: true,
        darkMode: true,
        enableAnimations: true,
      },
      careerStats: getDefaultCareerStats(),
      unlockedCosmetics: [],
      equippedCosmetics: {
        shoes: null,
        gloves: null,
        outfit: null,
        ballSkin: null,
        uiTheme: null,
      },
      negotiatedSponsor: null,
      tournamentsThisSeason: 0,
    };

    setGameState(prev => ({
      ...prev,
      currentSlot: slotId,
      saves: prev.saves.map(s => 
        s.slotId === slotId 
          ? { ...s, isEmpty: false, profile: newProfile, lastSaved: new Date().toISOString() }
          : s
      ),
    }));
  }, []);

  const loadGame = useCallback((slotId: number) => {
    setGameState(prev => ({
      ...prev,
      currentSlot: slotId,
    }));
  }, []);

  const saveCurrentGame = useCallback(() => {
    if (currentSlot === null || !currentProfile) return;
    
    setGameState(prev => ({
      ...prev,
      saves: prev.saves.map(s =>
        s.slotId === currentSlot
          ? { ...s, profile: currentProfile, lastSaved: new Date().toISOString() }
          : s
      ),
    }));
  }, [currentSlot, currentProfile]);

  const deleteGame = useCallback((slotId: number) => {
    setGameState(prev => ({
      ...prev,
      currentSlot: prev.currentSlot === slotId ? null : prev.currentSlot,
      saves: prev.saves.map(s =>
        s.slotId === slotId
          ? { slotId, isEmpty: true, profile: null, lastSaved: null }
          : s
      ),
    }));
  }, []);

  const exitToMenu = useCallback(() => {
    saveCurrentGame();
    setGameState(prev => ({
      ...prev,
      currentSlot: null,
    }));
  }, [saveCurrentGame]);

  const updateProfile = useCallback((updates: Partial<PlayerProfile>) => {
    if (currentSlot === null) return;
    
    setGameState(prev => ({
      ...prev,
      saves: prev.saves.map(s =>
        s.slotId === currentSlot && s.profile
          ? { ...s, profile: { ...s.profile, ...updates }, lastSaved: new Date().toISOString() }
          : s
      ),
    }));
  }, [currentSlot]);

  const updateStats = useCallback((updates: Partial<PlayerStats>) => {
    if (currentSlot === null || !currentProfile) return;
    
    const newStats = { ...currentProfile.stats };
    for (const [key, value] of Object.entries(updates)) {
      const statKey = key as keyof PlayerStats;
      newStats[statKey] = Math.min(GAME_CONSTANTS.STAT_MAX, Math.max(GAME_CONSTANTS.STAT_MIN, value as number));
    }
    
    updateProfile({ stats: newStats });
  }, [currentSlot, currentProfile, updateProfile]);

  const addMoney = useCallback((amount: number) => {
    if (!currentProfile) return;
    updateProfile({ money: currentProfile.money + amount });
  }, [currentProfile, updateProfile]);

  const spendMoney = useCallback((amount: number): boolean => {
    if (!currentProfile || currentProfile.money < amount) return false;
    updateProfile({ money: currentProfile.money - amount });
    return true;
  }, [currentProfile, updateProfile]);

  const useEnergy = useCallback((amount: number): boolean => {
    if (!currentProfile || currentProfile.energy < amount) return false;
    updateProfile({ energy: currentProfile.energy - amount });
    return true;
  }, [currentProfile, updateProfile]);

  const advanceWeek = useCallback(() => {
    if (!currentProfile) return;
    
    let newWeek = currentProfile.currentWeek + 1;
    let newSeason = currentProfile.currentSeason;
    
    if (newWeek > 52) {
      newWeek = 1;
      newSeason += 1;
    }
    
    // Calculate max energy (base + purchased boosts + property bonus)
    let maxEnergy = currentProfile.maxEnergy ?? GAME_CONSTANTS.MAX_ENERGY;
    if (currentProfile.currentProperty) {
      maxEnergy += currentProfile.currentProperty.energyBonus;
    }
    
    // Reset energy to max at start of week
    let newEnergy = maxEnergy;
    let newMoney = currentProfile.money;
    
    // ========================================
    // applyWeeklyUpdates() - all weekly processing
    // ========================================
    
    // 1. Apply job weekly energy cost and pay
    let newJob = currentProfile.currentJob;
    if (currentProfile.currentJob) {
      newMoney += currentProfile.currentJob.weeklyPay;
      newEnergy -= currentProfile.currentJob.energyCost;
      
      if (currentProfile.currentJob.weeksRemaining !== undefined) {
        const weeksRemaining = currentProfile.currentJob.weeksRemaining - 1;
        if (weeksRemaining <= 0) {
          newJob = null;
        } else {
          newJob = { ...currentProfile.currentJob, weeksRemaining };
        }
      }
    }
    
    // 2. Coach weekly fee
    const activeCoach = currentProfile.activeCoach;
    if (activeCoach) {
      newMoney -= activeCoach.weeklyCost;
    }
    
    // 3. Sponsor stipend
    let newSponsors = [...currentProfile.activeSponsors];
    for (const sponsor of currentProfile.activeSponsors) {
      if (sponsor.active) {
        newMoney += sponsor.weeklyPay;
      }
      if (sponsor.weeksRemaining !== undefined) {
        const remaining = sponsor.weeksRemaining - 1;
        if (remaining <= 0) {
          newSponsors = newSponsors.filter(s => s.id !== sponsor.id);
        } else {
          newSponsors = newSponsors.map(s => 
            s.id === sponsor.id ? { ...s, weeksRemaining: remaining } : s
          );
        }
      }
    }
    
    // 4. Injury/slump countdown
    let newEffects = [...(currentProfile.activeEffects ?? [])];
    newEffects = newEffects
      .map(e => ({ ...e, weeksRemaining: e.weeksRemaining - 1 }))
      .filter(e => e.weeksRemaining > 0);
    
    // 5. Check for new injury/slump if energy was very low at end of week
    const wasLowEnergy = currentProfile.energy <= 10;
    if (wasLowEnergy && newEffects.length < 2) {
      const triggerChance = currentProfile.energy <= 0 ? 0.4 : 0.2;
      if (Math.random() < triggerChance) {
        const available = POSSIBLE_EFFECTS.filter(e => 
          !newEffects.some(existing => existing.name === e.name)
        );
        if (available.length > 0) {
          const selected = available[Math.floor(Math.random() * available.length)];
          newEffects.push({
            ...selected,
            id: Date.now().toString(),
            weeksRemaining: 1 + Math.floor(Math.random() * 4), // 1-4 weeks
          });
        }
      }
    }
    
    // 6. Weekly challenges reset happens automatically in getWeeklyChallenges
    // when week/season changes, so no action needed here
    
    // 7. Negotiated sponsor processing
    let newNegotiatedSponsor = currentProfile.negotiatedSponsor;
    let newStats = { ...currentProfile.stats };
    if (newNegotiatedSponsor) {
      // Pay weekly stipend
      newMoney += newNegotiatedSponsor.weeklyStipend;
      
      // Decrease weeks remaining
      const weeksRemaining = newNegotiatedSponsor.weeksRemaining - 1;
      
      // Check if requirements are being met
      const meetsAvg = currentProfile.bowlingAverage >= newNegotiatedSponsor.requirements.minAverage;
      const meetsRep = currentProfile.stats.reputation >= newNegotiatedSponsor.requirements.minReputation;
      const meetsTournaments = newNegotiatedSponsor.tournamentsEntered >= newNegotiatedSponsor.requirements.tournamentsPerSeason;
      const requirementsMet = meetsAvg && meetsRep;
      
      if (weeksRemaining <= 0) {
        // Contract expired
        if (!meetsTournaments && newNegotiatedSponsor.penalties.canBeFired) {
          newStats.reputation = Math.max(0, newStats.reputation - 10);
        }
        newNegotiatedSponsor = null;
      } else {
        // Apply weekly penalty if not meeting requirements
        if (!requirementsMet) {
          if (newNegotiatedSponsor.warningGiven && newNegotiatedSponsor.penalties.canBeFired) {
            // Drop the sponsor after warning
            newStats.reputation = Math.max(0, newStats.reputation - newNegotiatedSponsor.penalties.repLossPerWeek * 2);
            newNegotiatedSponsor = null;
          } else {
            // Issue warning and apply penalty
            newStats.reputation = Math.max(0, newStats.reputation - newNegotiatedSponsor.penalties.repLossPerWeek);
            newNegotiatedSponsor = {
              ...newNegotiatedSponsor,
              weeksRemaining,
              requirementsMet: false,
              warningGiven: true,
            };
          }
        } else {
          newNegotiatedSponsor = {
            ...newNegotiatedSponsor,
            weeksRemaining,
            requirementsMet: true,
            warningGiven: false,
          };
        }
      }
    }
    
    // 8. Reset tournament count if new season
    let newTournamentsThisSeason = currentProfile.tournamentsThisSeason ?? 0;
    if (newSeason !== currentProfile.currentSeason) {
      newTournamentsThisSeason = 0;
      if (newNegotiatedSponsor) {
        newNegotiatedSponsor = {
          ...newNegotiatedSponsor,
          tournamentsEntered: 0,
        };
      }
    }
    
    // Clamp energy to minimum 0
    newEnergy = Math.max(0, newEnergy);
    
    updateProfile({
      currentWeek: newWeek,
      currentSeason: newSeason,
      energy: newEnergy,
      money: newMoney,
      currentJob: newJob,
      activeSponsors: newSponsors,
      activeEffects: newEffects,
      negotiatedSponsor: newNegotiatedSponsor,
      stats: newStats,
      tournamentsThisSeason: newTournamentsThisSeason,
    });
  }, [currentProfile, updateProfile]);

  const addBowlingBall = useCallback((ball: BowlingBall) => {
    if (!currentProfile) return;
    updateProfile({
      ownedBalls: [...currentProfile.ownedBalls, { ...ball, owned: true }],
    });
  }, [currentProfile, updateProfile]);

  const setActiveBall = useCallback((ballId: string) => {
    updateProfile({ activeBallId: ballId });
  }, [updateProfile]);

  const setCurrentJob = useCallback((job: Job | null) => {
    updateProfile({ currentJob: job });
  }, [updateProfile]);

  const addGameResult = useCallback((result: GameResult) => {
    if (!currentProfile) return;
    
    const newHistory = [...currentProfile.gameHistory, result];
    const newRecentScores = [...currentProfile.recentGameScores, result.score].slice(-30);
    const newTotalGames = currentProfile.totalGamesPlayed + 1;
    const newAverage = newRecentScores.length > 0 
      ? Math.round(newRecentScores.reduce((a, b) => a + b, 0) / newRecentScores.length)
      : result.score;
    
    updateProfile({
      gameHistory: newHistory,
      recentGameScores: newRecentScores,
      totalGamesPlayed: newTotalGames,
      bowlingAverage: newAverage,
    });
  }, [currentProfile, updateProfile]);

  const goProfessional = useCallback((): boolean => {
    if (!currentProfile) return false;
    
    if (currentProfile.recentGameScores.length < GAME_CONSTANTS.PRO_GAMES_REQUIRED) {
      return false;
    }
    
    if (currentProfile.bowlingAverage < GAME_CONSTANTS.PRO_AVERAGE_THRESHOLD) {
      return false;
    }
    
    if (currentProfile.money < GAME_CONSTANTS.PRO_APPLICATION_COST) {
      return false;
    }
    
    if (currentProfile.energy < GAME_CONSTANTS.PRO_APPLICATION_ENERGY) {
      return false;
    }
    
    updateProfile({
      isProfessional: true,
      money: currentProfile.money - GAME_CONSTANTS.PRO_APPLICATION_COST,
      energy: currentProfile.energy - GAME_CONSTANTS.PRO_APPLICATION_ENERGY,
    });
    
    return true;
  }, [currentProfile, updateProfile]);

  // ============================================
  // NEW FEATURE HANDLERS
  // ============================================

  const setTrait = useCallback((trait: BowlingTrait) => {
    updateProfile({ trait });
  }, [updateProfile]);

  const getMaxEnergy = useCallback((): number => {
    if (!currentProfile) return GAME_CONSTANTS.MAX_ENERGY;
    
    let maxEnergy = currentProfile.maxEnergy ?? GAME_CONSTANTS.MAX_ENERGY;
    
    if (currentProfile.currentProperty) {
      maxEnergy += currentProfile.currentProperty.energyBonus;
    }
    
    return maxEnergy;
  }, [currentProfile]);

  const hasPurchased = useCallback((purchaseId: PurchaseId): boolean => {
    if (!currentProfile) return false;
    const purchases = currentProfile.purchases ?? [];
    return purchases.some(p => p.purchaseId === purchaseId);
  }, [currentProfile]);

  const makePurchase = useCallback((purchaseId: PurchaseId): boolean => {
    if (!currentProfile) return false;
    
    const product = IAP_PRODUCTS[purchaseId];
    if (!product) return false;
    
    // Check if already purchased (for permanent items)
    if (product.type === "permanent" && hasPurchased(purchaseId)) {
      return false;
    }
    
    // TODO: Here is where Google Play / Apple IAP integration would hook in
    // The actual payment flow would be:
    // 1. Call platform-specific purchase API
    // 2. Wait for confirmation
    // 3. Validate receipt server-side
    // 4. Then apply the purchase effect
    // For now, we simulate successful purchase
    
    const newPurchase: PurchaseRecord = {
      purchaseId,
      purchasedAt: new Date().toISOString(),
      quantity: 1,
    };
    
    const purchases = [...(currentProfile.purchases ?? []), newPurchase];
    
    // Apply effects
    let updates: Partial<PlayerProfile> = { purchases };
    
    if ("maxEnergyBoost" in product.effect) {
      const currentMax = currentProfile.maxEnergy ?? GAME_CONSTANTS.MAX_ENERGY;
      updates.maxEnergy = currentMax + product.effect.maxEnergyBoost;
    }
    
    if ("cashBoost" in product.effect) {
      updates.money = currentProfile.money + product.effect.cashBoost;
    }
    
    updateProfile(updates);
    return true;
  }, [currentProfile, hasPurchased, updateProfile]);

  const restorePurchases = useCallback(() => {
    // TODO: This is where platform-specific restore purchases logic would go
    // For Google Play: Call BillingClient.queryPurchasesAsync()
    // For Apple: Call SKPaymentQueue.restoreCompletedTransactions()
    // Then iterate through valid purchases and re-apply effects
    console.log("Restore purchases placeholder - would connect to IAP API here");
  }, []);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    if (!currentProfile) return;
    const currentSettings: GameSettings = currentProfile.settings ?? {
      celebrationsEnabled: true,
      soundEnabled: true,
      darkMode: true,
      enableAnimations: true,
    };
    updateProfile({ settings: { ...currentSettings, ...settings } });
  }, [currentProfile, updateProfile]);

  const getSettings = useCallback((): GameSettings => {
    const defaultSettings: GameSettings = {
      celebrationsEnabled: true,
      soundEnabled: true,
      darkMode: true,
      enableAnimations: true,
    };
    if (!currentProfile?.settings) return defaultSettings;
    return { ...defaultSettings, ...currentProfile.settings };
  }, [currentProfile]);

  const updateRivalry = useCallback((opponentId: string, opponentName: string, won: boolean) => {
    if (!currentProfile) return;
    
    const rivalries = [...(currentProfile.rivalries ?? [])];
    const existingIndex = rivalries.findIndex(r => r.opponentId === opponentId);
    
    if (existingIndex >= 0) {
      const existing = rivalries[existingIndex];
      rivalries[existingIndex] = {
        ...existing,
        wins: won ? existing.wins + 1 : existing.wins,
        losses: won ? existing.losses : existing.losses + 1,
        lastMatchWeek: currentProfile.currentWeek,
        lastMatchSeason: currentProfile.currentSeason,
      };
    } else {
      rivalries.push({
        opponentId,
        opponentName,
        wins: won ? 1 : 0,
        losses: won ? 0 : 1,
        lastMatchWeek: currentProfile.currentWeek,
        lastMatchSeason: currentProfile.currentSeason,
      });
    }
    
    // Update career stats if won against rival
    const careerStats = currentProfile.careerStats ?? getDefaultCareerStats();
    if (won) {
      updateProfile({
        rivalries,
        careerStats: { ...careerStats, rivalWins: careerStats.rivalWins + 1 },
      });
    } else {
      updateProfile({ 
        rivalries,
        careerStats: { ...careerStats, rivalLosses: careerStats.rivalLosses + 1 },
      });
    }
  }, [currentProfile, updateProfile]);

  const hasAchievement = useCallback((achievementId: AchievementId): boolean => {
    if (!currentProfile) return false;
    const earned = currentProfile.earnedAchievements ?? [];
    return earned.some(a => a.id === achievementId && a.earnedAt);
  }, [currentProfile]);

  const updateCareerStats = useCallback((updates: Partial<CareerStats>) => {
    if (!currentProfile) return;
    const current = currentProfile.careerStats ?? getDefaultCareerStats();
    updateProfile({ careerStats: { ...current, ...updates } });
  }, [currentProfile, updateProfile]);

  const checkAndAwardAchievements = useCallback(() => {
    if (!currentProfile) return;
    
    const earned = [...(currentProfile.earnedAchievements ?? [])];
    const careerStats = currentProfile.careerStats ?? getDefaultCareerStats();
    
    const awardIfNotEarned = (id: AchievementId, condition: boolean) => {
      const existing = earned.find(a => a.id === id);
      if (!existing?.earnedAt && condition) {
        const idx = earned.findIndex(a => a.id === id);
        if (idx >= 0) {
          earned[idx] = { ...earned[idx], earnedAt: new Date().toISOString() };
        } else {
          earned.push({ id, earnedAt: new Date().toISOString() });
        }
      }
    };
    
    // Check each achievement
    awardIfNotEarned("first_200_average", currentProfile.bowlingAverage >= 200);
    awardIfNotEarned("first_300_game", careerStats.highGame >= 300);
    awardIfNotEarned("went_pro", currentProfile.isProfessional);
    awardIfNotEarned("grinder", currentProfile.totalGamesPlayed >= 100);
    awardIfNotEarned("veteran", currentProfile.totalGamesPlayed >= 500);
    awardIfNotEarned("turkey_master", careerStats.totalTurkeys >= 10);
    awardIfNotEarned("double_specialist", careerStats.totalDoubles >= 25);
    awardIfNotEarned("money_maker", careerStats.totalEarnings >= 100000);
    awardIfNotEarned("rival_nemesis", careerStats.rivalWins >= 5);
    awardIfNotEarned("first_league_championship", careerStats.leagueWins >= 1);
    awardIfNotEarned("first_tournament_win", careerStats.tournamentWins >= 1);
    
    updateProfile({ earnedAchievements: earned });
  }, [currentProfile, updateProfile]);

  // ============================================
  // COACH SYSTEM
  // ============================================
  const getActiveCoach = useCallback((): Coach | null => {
    return currentProfile?.activeCoach ?? null;
  }, [currentProfile]);

  const canHireCoach = useCallback((coach: Coach): boolean => {
    if (!currentProfile) return false;
    const { reputation, bowlingAverage } = coach.unlockRequirement;
    if (reputation && currentProfile.stats.reputation < reputation) return false;
    if (bowlingAverage && currentProfile.bowlingAverage < bowlingAverage) return false;
    if (currentProfile.money < coach.weeklyCost) return false;
    return true;
  }, [currentProfile]);

  const hireCoach = useCallback((coachId: string): boolean => {
    if (!currentProfile) return false;
    const coach = AVAILABLE_COACHES.find(c => c.id === coachId);
    if (!coach || !canHireCoach(coach)) return false;
    updateProfile({ activeCoach: coach });
    return true;
  }, [currentProfile, canHireCoach, updateProfile]);

  const fireCoach = useCallback(() => {
    updateProfile({ activeCoach: null });
  }, [updateProfile]);

  // ============================================
  // INJURY/SLUMP SYSTEM
  // ============================================
  const getActiveEffects = useCallback((): ActiveEffect[] => {
    return currentProfile?.activeEffects ?? [];
  }, [currentProfile]);

  const applyRecoveryAction = useCallback((actionId: string, effectId: string): boolean => {
    if (!currentProfile) return false;
    const action = RECOVERY_ACTIONS.find(a => a.id === actionId);
    const effects = currentProfile.activeEffects ?? [];
    const effectIndex = effects.findIndex(e => e.id === effectId);
    
    if (!action || effectIndex === -1) return false;
    const effect = effects[effectIndex];
    if (!action.applicableTo.includes(effect.type)) return false;
    if (currentProfile.money < action.moneyCost) return false;
    if (currentProfile.energy < action.energyCost) return false;
    
    const newEffects = [...effects];
    const newWeeks = effect.weeksRemaining - action.weeksReduction;
    if (newWeeks <= 0) {
      newEffects.splice(effectIndex, 1);
    } else {
      newEffects[effectIndex] = { ...effect, weeksRemaining: newWeeks };
    }
    
    updateProfile({
      activeEffects: newEffects,
      money: currentProfile.money - action.moneyCost,
      energy: currentProfile.energy - action.energyCost,
    });
    return true;
  }, [currentProfile, updateProfile]);

  // ============================================
  // WEEKLY CHALLENGES
  // ============================================
  const generateWeeklyChallenges = useCallback((): WeeklyChallenge[] => {
    const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(t => ({
      ...t,
      progress: 0,
      claimed: false,
    }));
  }, []);

  const getWeeklyChallenges = useCallback((): WeeklyChallenge[] => {
    if (!currentProfile) return [];
    const state = currentProfile.weeklyChallenges;
    if (!state || state.weekGenerated !== currentProfile.currentWeek || state.seasonGenerated !== currentProfile.currentSeason) {
      // Generate new challenges for this week
      const newChallenges = generateWeeklyChallenges();
      const newState: WeeklyChallengeState = {
        challenges: newChallenges,
        weekGenerated: currentProfile.currentWeek,
        seasonGenerated: currentProfile.currentSeason,
      };
      updateProfile({ weeklyChallenges: newState });
      return newChallenges;
    }
    return state.challenges;
  }, [currentProfile, generateWeeklyChallenges, updateProfile]);

  const updateChallengeProgress = useCallback((challengeId: string, amount: number) => {
    if (!currentProfile) return;
    const state = currentProfile.weeklyChallenges;
    if (!state) return;
    
    const challenges = state.challenges.map(c => 
      c.id === challengeId && !c.claimed
        ? { ...c, progress: Math.min(c.target, c.progress + amount) }
        : c
    );
    updateProfile({ weeklyChallenges: { ...state, challenges } });
  }, [currentProfile, updateProfile]);

  const claimChallengeReward = useCallback((challengeId: string): boolean => {
    if (!currentProfile) return false;
    const state = currentProfile.weeklyChallenges;
    if (!state) return false;
    
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.claimed || challenge.progress < challenge.target) return false;
    
    const challenges = state.challenges.map(c =>
      c.id === challengeId ? { ...c, claimed: true } : c
    );
    
    let moneyBonus = challenge.reward.cash ?? 0;
    let energyBonus = challenge.reward.energy ?? 0;
    let repBonus = challenge.reward.reputation ?? 0;
    let tokenBonus = challenge.reward.cosmeticToken ?? 0;
    
    const newStats = { ...currentProfile.stats };
    if (repBonus > 0) {
      newStats.reputation = Math.min(100, newStats.reputation + repBonus);
    }
    
    updateProfile({
      weeklyChallenges: { ...state, challenges },
      money: currentProfile.money + moneyBonus,
      energy: Math.min(currentProfile.maxEnergy ?? GAME_CONSTANTS.MAX_ENERGY, currentProfile.energy + energyBonus),
      stats: newStats,
      cosmeticTokens: (currentProfile.cosmeticTokens ?? 0) + tokenBonus,
    });
    return true;
  }, [currentProfile, updateProfile]);

  // ============================================
  // LEGACY/PRESTIGE SYSTEM
  // ============================================
  const getLegacyData = useCallback((): LegacyData => {
    return gameState.legacyData ?? { legacyPoints: 0, hallOfFame: [], activeBonuses: [] };
  }, [gameState]);

  const canRetire = useCallback((): boolean => {
    if (!currentProfile) return false;
    const careerStats = currentProfile.careerStats ?? { leagueWins: 0, tournamentWins: 0 };
    // Can retire if: Season 10+ OR won a major (tournament/league) OR high reputation (80+)
    return currentProfile.currentSeason >= 10 ||
           careerStats.leagueWins >= 1 ||
           careerStats.tournamentWins >= 1 ||
           currentProfile.stats.reputation >= 80;
  }, [currentProfile]);

  const retire = useCallback((): number => {
    if (!currentProfile || !canRetire()) return 0;
    
    const careerStats = currentProfile.careerStats ?? getDefaultCareerStats();
    
    // Calculate legacy points
    let points = 0;
    points += currentProfile.currentSeason * 2;
    points += careerStats.leagueWins * 5;
    points += careerStats.tournamentWins * 10;
    points += careerStats.perfectGames * 15;
    points += Math.floor(careerStats.totalEarnings / 10000);
    points += currentProfile.isProfessional ? 20 : 0;
    
    // Calculate percentages for expanded HoF
    const strikePercentage = careerStats.totalFrames > 0 
      ? Math.round((careerStats.strikeFrames / careerStats.totalFrames) * 100) 
      : 0;
    const sparePercentage = careerStats.totalFrames > 0 
      ? Math.round((careerStats.spareFrames / careerStats.totalFrames) * 100) 
      : 0;
    
    // Calculate rival record
    const rivalRecord = { wins: careerStats.rivalWins, losses: careerStats.rivalLosses };
    
    // Count achievements and cosmetics
    const achievementsEarned = (currentProfile.earnedAchievements ?? []).filter(a => a.earnedAt).length;
    const cosmeticsCollected = (currentProfile.unlockedCosmetics ?? []).length;
    
    const hofEntry: HallOfFameEntry = {
      id: Date.now().toString(),
      name: `${currentProfile.firstName} ${currentProfile.lastName}`,
      seasons: currentProfile.currentSeason,
      careerAverage: currentProfile.bowlingAverage,
      totalTitles: careerStats.leagueWins + careerStats.tournamentWins,
      totalEarnings: careerStats.totalEarnings,
      perfectGames: careerStats.perfectGames,
      retiredAt: new Date().toISOString(),
      highGame: careerStats.highGame,
      highSeries: careerStats.highSeries,
      totalGamesPlayed: currentProfile.totalGamesPlayed,
      leagueWins: careerStats.leagueWins,
      tournamentWins: careerStats.tournamentWins,
      longestStrikeStreak: careerStats.longestStrikeStreak,
      strikePercentage,
      sparePercentage,
      rivalRecord,
      achievementsEarned,
      cosmeticsCollected,
      trait: currentProfile.trait,
      bowlingStyle: currentProfile.bowlingStyle,
      legacyPointsAwarded: points,
    };
    
    const legacy = getLegacyData();
    setGameState(prev => ({
      ...prev,
      legacyData: {
        legacyPoints: legacy.legacyPoints + points,
        hallOfFame: [...legacy.hallOfFame, hofEntry],
        activeBonuses: legacy.activeBonuses,
      },
    }));
    
    // Delete the current save slot
    if (currentSlot !== null) {
      setGameState(prev => ({
        ...prev,
        currentSlot: null,
        saves: prev.saves.map(s =>
          s.slotId === currentSlot
            ? { slotId: s.slotId, isEmpty: true, profile: null, lastSaved: null }
            : s
        ),
      }));
    }
    
    return points;
  }, [currentProfile, currentSlot, canRetire, getLegacyData, setGameState]);

  const applyLegacyBonus = useCallback((bonusId: string): boolean => {
    const legacy = getLegacyData();
    const bonus = LEGACY_BONUSES.find(b => b.id === bonusId);
    if (!bonus || legacy.legacyPoints < bonus.cost) return false;
    if (legacy.activeBonuses.includes(bonusId)) return false;
    
    setGameState(prev => ({
      ...prev,
      legacyData: {
        ...legacy,
        legacyPoints: legacy.legacyPoints - bonus.cost,
        activeBonuses: [...legacy.activeBonuses, bonusId],
      },
    }));
    return true;
  }, [getLegacyData, setGameState]);

  // ============================================
  // COSMETICS SYSTEM
  // ============================================
  const getAvailableCosmetics = useCallback((): CosmeticItem[] => {
    return AVAILABLE_COSMETICS;
  }, []);

  const getUnlockedCosmetics = useCallback((): string[] => {
    return currentProfile?.unlockedCosmetics ?? [];
  }, [currentProfile]);

  const getEquippedCosmetics = useCallback((): EquippedCosmetics => {
    return currentProfile?.equippedCosmetics ?? {
      shoes: null,
      gloves: null,
      outfit: null,
      ballSkin: null,
      uiTheme: null,
    };
  }, [currentProfile]);

  const canUnlockCosmetic = useCallback((cosmeticId: string): boolean => {
    if (!currentProfile) return false;
    const cosmetic = AVAILABLE_COSMETICS.find(c => c.id === cosmeticId);
    if (!cosmetic) return false;
    
    const unlocked = currentProfile.unlockedCosmetics ?? [];
    if (unlocked.includes(cosmeticId)) return false;
    
    const { unlockMethod, unlockRequirement } = cosmetic;
    
    switch (unlockMethod) {
      case "purchase":
        return currentProfile.money >= (unlockRequirement.price ?? 0);
      case "reputation":
        return currentProfile.stats.reputation >= (unlockRequirement.reputationRequired ?? 0);
      case "achievement":
        return hasAchievement(unlockRequirement.achievementId as AchievementId);
      case "challenge":
        return (currentProfile.cosmeticTokens ?? 0) >= 1;
      case "legacy":
        return getLegacyData().legacyPoints >= (unlockRequirement.legacyPointsCost ?? 0);
      default:
        return false;
    }
  }, [currentProfile, hasAchievement, getLegacyData]);

  const unlockCosmetic = useCallback((cosmeticId: string): boolean => {
    if (!currentProfile || !canUnlockCosmetic(cosmeticId)) return false;
    
    const cosmetic = AVAILABLE_COSMETICS.find(c => c.id === cosmeticId);
    if (!cosmetic) return false;
    
    const { unlockMethod, unlockRequirement } = cosmetic;
    const unlocked = [...(currentProfile.unlockedCosmetics ?? []), cosmeticId];
    
    switch (unlockMethod) {
      case "purchase":
        updateProfile({
          unlockedCosmetics: unlocked,
          money: currentProfile.money - (unlockRequirement.price ?? 0),
        });
        return true;
      case "challenge":
        updateProfile({
          unlockedCosmetics: unlocked,
          cosmeticTokens: (currentProfile.cosmeticTokens ?? 0) - 1,
        });
        return true;
      case "legacy":
        const legacy = getLegacyData();
        setGameState(prev => ({
          ...prev,
          legacyData: {
            ...legacy,
            legacyPoints: legacy.legacyPoints - (unlockRequirement.legacyPointsCost ?? 0),
          },
        }));
        updateProfile({ unlockedCosmetics: unlocked });
        return true;
      case "reputation":
      case "achievement":
        updateProfile({ unlockedCosmetics: unlocked });
        return true;
      default:
        return false;
    }
  }, [currentProfile, canUnlockCosmetic, updateProfile, getLegacyData, setGameState]);

  const equipCosmetic = useCallback((cosmeticId: string | null, category: CosmeticCategory) => {
    if (!currentProfile) return;
    
    const equipped = currentProfile.equippedCosmetics ?? {
      shoes: null,
      gloves: null,
      outfit: null,
      ballSkin: null,
      uiTheme: null,
    };
    
    const categoryKey = category === "ball-skin" ? "ballSkin" : 
                        category === "ui-theme" ? "uiTheme" : category;
    
    updateProfile({
      equippedCosmetics: {
        ...equipped,
        [categoryKey]: cosmeticId,
      },
    });
  }, [currentProfile, updateProfile]);

  // ============================================
  // SPONSORSHIP NEGOTIATION SYSTEM
  // ============================================
  const getAvailableSponsorOffers = useCallback((): SponsorOffer[] => {
    if (!currentProfile || !currentProfile.isProfessional) return [];
    if (currentProfile.negotiatedSponsor) return [];
    
    const playerAvg = currentProfile.bowlingAverage;
    const playerRep = currentProfile.stats.reputation;
    
    return SPONSOR_TEMPLATES
      .filter(t => playerAvg >= t.baseReqs.avg * 0.8 && playerRep >= t.baseReqs.rep * 0.7)
      .map(t => ({
        sponsor: { id: t.id, name: t.name, tier: t.tier },
        safeOffer: {
          weeklyStipend: Math.floor(t.baseStipend * 0.7),
          tournamentBonus: Math.floor(t.baseBonus * 0.8),
          requirements: {
            minAverage: Math.floor(t.baseReqs.avg * 0.85),
            minReputation: Math.floor(t.baseReqs.rep * 0.8),
            tournamentsPerSeason: Math.max(1, t.baseReqs.tournaments - 1),
          },
          contractWeeks: 26,
        },
        negotiatedOffer: {
          weeklyStipend: Math.floor(t.baseStipend * 1.3),
          tournamentBonus: Math.floor(t.baseBonus * 1.2),
          requirements: {
            minAverage: t.baseReqs.avg,
            minReputation: t.baseReqs.rep,
            tournamentsPerSeason: t.baseReqs.tournaments + 1,
          },
          contractWeeks: 52,
          negotiationSuccessChance: Math.min(90, 50 + currentProfile.stats.charisma),
        },
      }));
  }, [currentProfile]);

  const getNegotiatedSponsor = useCallback((): NegotiatedSponsor | null => {
    return currentProfile?.negotiatedSponsor ?? null;
  }, [currentProfile]);

  const acceptSponsorOffer = useCallback((offer: SponsorOffer, negotiated: boolean): boolean => {
    if (!currentProfile || currentProfile.negotiatedSponsor) return false;
    
    if (negotiated) {
      const success = Math.random() * 100 < offer.negotiatedOffer.negotiationSuccessChance;
      if (!success) return false;
    }
    
    const terms = negotiated ? offer.negotiatedOffer : offer.safeOffer;
    
    const sponsor: NegotiatedSponsor = {
      id: offer.sponsor.id,
      name: offer.sponsor.name,
      tier: offer.sponsor.tier,
      weeklyStipend: terms.weeklyStipend,
      tournamentBonus: terms.tournamentBonus,
      requirements: terms.requirements,
      penalties: {
        repLossPerWeek: offer.sponsor.tier === "elite" ? 5 : 
                        offer.sponsor.tier === "national" ? 3 : 
                        offer.sponsor.tier === "regional" ? 2 : 1,
        canBeFired: offer.sponsor.tier !== "local",
      },
      weeksRemaining: terms.contractWeeks,
      tournamentsEntered: currentProfile.tournamentsThisSeason ?? 0,
      requirementsMet: true,
      warningGiven: false,
    };
    
    updateProfile({ negotiatedSponsor: sponsor });
    return true;
  }, [currentProfile, updateProfile]);

  const cancelSponsorContract = useCallback(() => {
    if (!currentProfile) return;
    updateProfile({ negotiatedSponsor: null });
  }, [currentProfile, updateProfile]);

  const incrementTournamentCount = useCallback(() => {
    if (!currentProfile) return;
    const count = (currentProfile.tournamentsThisSeason ?? 0) + 1;
    updateProfile({ tournamentsThisSeason: count });
    
    // Also update negotiated sponsor tracking
    if (currentProfile.negotiatedSponsor) {
      updateProfile({
        negotiatedSponsor: {
          ...currentProfile.negotiatedSponsor,
          tournamentsEntered: (currentProfile.negotiatedSponsor.tournamentsEntered ?? 0) + 1,
        },
      });
    }
  }, [currentProfile, updateProfile]);

  return (
    <GameContext.Provider value={{
      gameState,
      currentProfile,
      currentSlot,
      isPlaying,
      createNewGame,
      loadGame,
      saveCurrentGame,
      deleteGame,
      exitToMenu,
      updateProfile,
      updateStats,
      addMoney,
      spendMoney,
      useEnergy,
      advanceWeek,
      addBowlingBall,
      setActiveBall,
      setCurrentJob,
      addGameResult,
      goProfessional,
      setTrait,
      makePurchase,
      hasPurchased,
      restorePurchases,
      updateSettings,
      getSettings,
      getMaxEnergy,
      updateRivalry,
      checkAndAwardAchievements,
      hasAchievement,
      updateCareerStats,
      // Coach system
      hireCoach,
      fireCoach,
      getActiveCoach,
      canHireCoach,
      // Injury/Slump system
      getActiveEffects,
      applyRecoveryAction,
      // Weekly Challenges
      getWeeklyChallenges,
      updateChallengeProgress,
      claimChallengeReward,
      // Legacy/Prestige
      getLegacyData,
      canRetire,
      retire,
      applyLegacyBonus,
      // Cosmetics system
      getAvailableCosmetics,
      getUnlockedCosmetics,
      getEquippedCosmetics,
      canUnlockCosmetic,
      unlockCosmetic,
      equipCosmetic,
      // Sponsorship negotiation
      getAvailableSponsorOffers,
      getNegotiatedSponsor,
      acceptSponsorOffer,
      cancelSponsorContract,
      incrementTournamentCount,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
