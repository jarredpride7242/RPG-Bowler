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
  Sponsor
} from "@shared/schema";
import { GAME_CONSTANTS } from "@shared/schema";

const STORAGE_KEY = "strike-force-game-state";

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

function loadGameState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
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
  
  createNewGame: (slotId: number, firstName: string, lastName: string, style: BowlingStyle, handedness: Handedness) => void;
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
    handedness: Handedness
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
    
    // Calculate max energy (base + property bonus)
    let maxEnergy = GAME_CONSTANTS.MAX_ENERGY;
    if (currentProfile.currentProperty) {
      maxEnergy += currentProfile.currentProperty.energyBonus;
    }
    
    // Reset energy to max at start of week
    let newEnergy = maxEnergy;
    
    // Apply job weekly energy cost and pay
    let jobPay = 0;
    let newJob = currentProfile.currentJob;
    
    if (currentProfile.currentJob) {
      jobPay = currentProfile.currentJob.weeklyPay;
      // Subtract job energy cost once at week start
      newEnergy -= currentProfile.currentJob.energyCost;
      
      // Handle contract duration
      if (currentProfile.currentJob.weeksRemaining !== undefined) {
        const weeksRemaining = currentProfile.currentJob.weeksRemaining - 1;
        if (weeksRemaining <= 0) {
          newJob = null;
        } else {
          newJob = { ...currentProfile.currentJob, weeksRemaining };
        }
      }
    }
    
    // Clamp energy to minimum 0
    newEnergy = Math.max(0, newEnergy);
    
    updateProfile({
      currentWeek: newWeek,
      currentSeason: newSeason,
      energy: newEnergy,
      money: currentProfile.money + jobPay,
      currentJob: newJob,
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
