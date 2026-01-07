import type { 
  LeagueType, 
  ActiveLeague, 
  LeagueStanding,
  TournamentTier,
  TournamentFormat,
  ActiveTournament,
  TournamentEntrant,
  BracketMatch,
  Opponent,
  OilPattern,
  PlayerStats,
  TournamentResult,
} from "@shared/schema";
import { 
  LEAGUE_DEFINITIONS, 
  TOURNAMENT_DEFINITIONS,
  GAME_CONSTANTS,
  OIL_PATTERN_DETAILS,
} from "@shared/schema";

const FIRST_NAMES = [
  "Mike", "Dave", "Tom", "Chris", "Steve", "Bob", "Jim", "Dan", "Joe", "Pete",
  "Ryan", "Matt", "Kevin", "Brian", "Jason", "Eric", "Mark", "Tony", "Jeff", "Scott",
  "Sam", "Nick", "Alex", "Tyler", "Jake", "Adam", "Chad", "Derek", "Kyle", "Sean",
  "Lisa", "Sarah", "Emily", "Amy", "Katie", "Jen", "Ashley", "Kelly", "Nicole", "Rachel"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Wilson", "Taylor", "Anderson", "Thomas",
  "Jackson", "White", "Harris", "Martin", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis",
  "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Hill", "Scott", "Green",
  "Baker", "Adams", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell"
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateOpponentName(seed: number): { firstName: string; lastName: string } {
  const rng = seededRandom(seed);
  return {
    firstName: FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)],
    lastName: LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)],
  };
}

function generateOpponentStats(avgMin: number, avgMax: number, seed: number): { stats: PlayerStats; bowlingAverage: number } {
  const rng = seededRandom(seed);
  const bowlingAverage = Math.floor(avgMin + rng() * (avgMax - avgMin));
  
  const skillFactor = (bowlingAverage - 100) / 150;
  const baseMin = 25 + skillFactor * 50;
  const baseMax = 45 + skillFactor * 45;
  
  const randStat = () => Math.floor(baseMin + rng() * (baseMax - baseMin));
  
  return {
    stats: {
      throwPower: randStat(),
      accuracy: randStat(),
      hookControl: randStat(),
      revRate: randStat(),
      speedControl: randStat(),
      consistency: randStat(),
      spareShooting: randStat(),
      mentalToughness: randStat(),
      laneReading: randStat(),
      equipmentKnowledge: randStat(),
      stamina: randStat(),
      charisma: randStat(),
      reputation: Math.floor(rng() * 50),
    },
    bowlingAverage,
  };
}

export function generateLeagueOpponents(leagueType: LeagueType, seed: number): Opponent[] {
  const definition = LEAGUE_DEFINITIONS[leagueType];
  const tierSkill = GAME_CONSTANTS.OPPONENT_SKILL_BY_TIER[definition.tier];
  const opponents: Opponent[] = [];
  
  for (let i = 0; i < definition.fieldSize - 1; i++) {
    const oppSeed = seed * 1000 + i * 137;
    const name = generateOpponentName(oppSeed);
    const { stats, bowlingAverage } = generateOpponentStats(tierSkill.avgMin, tierSkill.avgMax, oppSeed + 500);
    
    opponents.push({
      id: `league-opp-${seed}-${i}`,
      firstName: name.firstName,
      lastName: name.lastName,
      bowlingStyle: Math.random() > 0.3 ? "one-handed" : "two-handed",
      handedness: Math.random() > 0.1 ? "right" : "left",
      stats,
      bowlingAverage,
    });
  }
  
  return opponents;
}

export function createActiveLeague(leagueType: LeagueType, playerName: string, currentWeek: number): ActiveLeague {
  const seed = currentWeek * 10000 + Date.now() % 10000;
  const definition = LEAGUE_DEFINITIONS[leagueType];
  const opponents = generateLeagueOpponents(leagueType, seed);
  
  const standings: LeagueStanding[] = [
    {
      bowlerId: "player",
      name: playerName,
      isPlayer: true,
      wins: 0,
      losses: 0,
      totalPins: 0,
      gamesPlayed: 0,
      highGame: 0,
      highSeries: 0,
      average: 0,
      points: 0,
    },
    ...opponents.map(opp => ({
      bowlerId: opp.id,
      name: `${opp.firstName} ${opp.lastName}`,
      isPlayer: false,
      wins: 0,
      losses: 0,
      totalPins: 0,
      gamesPlayed: 0,
      highGame: 0,
      highSeries: 0,
      average: opp.bowlingAverage,
      points: 0,
    })),
  ];
  
  return {
    id: `league-${leagueType}-${seed}`,
    leagueType,
    name: definition.name,
    currentWeek: 1,
    seasonLength: definition.seasonLength,
    standings,
    weeklyResults: [],
    isPlayoffs: false,
    isComplete: false,
    startedWeek: currentWeek,
    oilPattern: definition.oilPattern,
  };
}

export function simulateOpponentLeagueGame(average: number, oilPattern: OilPattern): number {
  const oilDetails = OIL_PATTERN_DETAILS[oilPattern];
  const difficulty = oilDetails.difficulty;
  
  const variance = 30 + GAME_CONSTANTS.UPSET_FACTOR * 20;
  const difficultyPenalty = (difficulty - 1) * 8;
  
  const baseScore = average - difficultyPenalty;
  const score = Math.round(baseScore + (Math.random() - 0.5) * variance);
  
  return Math.max(80, Math.min(300, score));
}

export function simulateLeagueWeek(league: ActiveLeague, playerScores: number[]): ActiveLeague {
  const playerTotal = playerScores.reduce((a, b) => a + b, 0);
  const playerHighGame = Math.max(...playerScores);
  
  const nonPlayerStandings = league.standings.filter(s => !s.isPlayer);
  const sortedByIdForSchedule = [...nonPlayerStandings].sort((a, b) => a.bowlerId.localeCompare(b.bowlerId));
  const opponentIndex = (league.currentWeek - 1) % sortedByIdForSchedule.length;
  const opponent = sortedByIdForSchedule[opponentIndex];
  
  const opponentScores = [0, 0, 0].map(() => 
    simulateOpponentLeagueGame(opponent.average || 150, league.oilPattern)
  );
  const opponentTotal = opponentScores.reduce((a, b) => a + b, 0);
  
  const playerWon = playerTotal > opponentTotal;
  const pointsEarned = playerWon ? 2 : (playerTotal === opponentTotal ? 1 : 0);
  
  // Create matchups for all non-player opponents (excluding the one playing the player)
  const opponentsNotPlayingPlayer = nonPlayerStandings.filter(s => s.bowlerId !== opponent.bowlerId);
  
  // Pair up opponents for head-to-head matches
  // Use a round-robin style pairing based on current week
  const matchups: Map<string, { opponentId: string; won: boolean; tied: boolean; pointsWon: number; total: number; scores: number[] }> = new Map();
  
  // Shuffle opponents deterministically based on week for varied matchups
  const shuffledOpponents = [...opponentsNotPlayingPlayer].sort((a, b) => {
    const hashA = (a.bowlerId.charCodeAt(0) + league.currentWeek * 7) % 100;
    const hashB = (b.bowlerId.charCodeAt(0) + league.currentWeek * 7) % 100;
    return hashA - hashB;
  });
  
  // Pair opponents: first plays second, third plays fourth, etc.
  for (let i = 0; i < shuffledOpponents.length - 1; i += 2) {
    const bowler1 = shuffledOpponents[i];
    const bowler2 = shuffledOpponents[i + 1];
    
    const scores1 = [0, 0, 0].map(() => simulateOpponentLeagueGame(bowler1.average || 150, league.oilPattern));
    const scores2 = [0, 0, 0].map(() => simulateOpponentLeagueGame(bowler2.average || 150, league.oilPattern));
    const total1 = scores1.reduce((a, b) => a + b, 0);
    const total2 = scores2.reduce((a, b) => a + b, 0);
    
    const bowler1Won = total1 > total2;
    const bowler2Won = total2 > total1;
    const tie = total1 === total2;
    
    matchups.set(bowler1.bowlerId, { 
      opponentId: bowler2.bowlerId, 
      won: bowler1Won, 
      tied: tie,
      pointsWon: bowler1Won ? 2 : (tie ? 1 : 0),
      total: total1,
      scores: scores1
    });
    matchups.set(bowler2.bowlerId, { 
      opponentId: bowler1.bowlerId, 
      won: bowler2Won, 
      tied: tie,
      pointsWon: bowler2Won ? 2 : (tie ? 1 : 0),
      total: total2,
      scores: scores2
    });
  }
  
  // Handle odd opponent (gets a bye - still bowls but auto-wins)
  if (shuffledOpponents.length % 2 === 1) {
    const byeBowler = shuffledOpponents[shuffledOpponents.length - 1];
    const byeScores = [0, 0, 0].map(() => simulateOpponentLeagueGame(byeBowler.average || 150, league.oilPattern));
    const byeTotal = byeScores.reduce((a, b) => a + b, 0);
    matchups.set(byeBowler.bowlerId, { 
      opponentId: 'bye', 
      won: true, 
      tied: false,
      pointsWon: 2,
      total: byeTotal,
      scores: byeScores
    });
  }
  
  const newStandings = league.standings.map(standing => {
    if (standing.isPlayer) {
      const newTotalPins = standing.totalPins + playerTotal;
      const newGamesPlayed = standing.gamesPlayed + 3;
      return {
        ...standing,
        totalPins: newTotalPins,
        gamesPlayed: newGamesPlayed,
        highGame: Math.max(standing.highGame, playerHighGame),
        highSeries: Math.max(standing.highSeries, playerTotal),
        average: Math.round(newTotalPins / newGamesPlayed),
        points: standing.points + pointsEarned,
        wins: standing.wins + (playerWon ? 1 : 0),
        losses: standing.losses + (playerWon ? 0 : 1),
      };
    }
    
    if (standing.bowlerId === opponent.bowlerId) {
      const newTotalPins = standing.totalPins + opponentTotal;
      const newGamesPlayed = standing.gamesPlayed + 3;
      return {
        ...standing,
        totalPins: newTotalPins,
        gamesPlayed: newGamesPlayed,
        highGame: Math.max(standing.highGame, Math.max(...opponentScores)),
        highSeries: Math.max(standing.highSeries, opponentTotal),
        average: Math.round(newTotalPins / newGamesPlayed),
        points: standing.points + (playerWon ? 0 : 2),
        wins: standing.wins + (playerWon ? 0 : 1),
        losses: standing.losses + (playerWon ? 1 : 0),
      };
    }
    
    // Use simulated matchup results for this opponent
    const matchResult = matchups.get(standing.bowlerId);
    if (matchResult) {
      const newTotalPins = standing.totalPins + matchResult.total;
      const newGamesPlayed = standing.gamesPlayed + 3;
      const highGameThisWeek = Math.max(...matchResult.scores);
      
      return {
        ...standing,
        totalPins: newTotalPins,
        gamesPlayed: newGamesPlayed,
        highGame: Math.max(standing.highGame, highGameThisWeek),
        highSeries: Math.max(standing.highSeries, matchResult.total),
        average: Math.round(newTotalPins / newGamesPlayed),
        points: standing.points + matchResult.pointsWon,
        wins: standing.wins + (matchResult.won ? 1 : 0),
        losses: standing.losses + (matchResult.won || matchResult.tied ? 0 : 1),
      };
    }
    
    // Fallback (shouldn't happen)
    return standing;
  });
  
  newStandings.sort((a, b) => b.points - a.points || b.totalPins - a.totalPins);
  
  const newWeeklyResult = {
    week: league.currentWeek,
    playerScores,
    playerTotal,
    opponentName: opponent.name,
    opponentScores,
    opponentTotal,
    won: playerWon,
    pointsEarned,
  };
  
  const isSeasonComplete = league.currentWeek >= league.seasonLength;
  
  return {
    ...league,
    currentWeek: league.currentWeek + 1,
    standings: newStandings,
    weeklyResults: [...league.weeklyResults, newWeeklyResult],
    isComplete: isSeasonComplete,
    isPlayoffs: isSeasonComplete && !league.isPlayoffs,
  };
}

export function getLeaguePrize(league: ActiveLeague, leagueType: LeagueType): number {
  const definition = LEAGUE_DEFINITIONS[leagueType];
  const playerStanding = league.standings.find(s => s.isPlayer);
  const position = league.standings.indexOf(playerStanding!) + 1;
  
  if (position === 1) return definition.weeklyPrize * 10;
  if (position === 2) return definition.weeklyPrize * 5;
  if (position === 3) return definition.weeklyPrize * 3;
  if (position <= 4) return definition.weeklyPrize * 2;
  return definition.weeklyPrize;
}

export function generateTournamentField(tier: TournamentTier, playerName: string, playerAverage: number, seed: number): TournamentEntrant[] {
  const definition = TOURNAMENT_DEFINITIONS[tier];
  const tierKey = tier === "local" ? "amateur-local" : tier === "regional" ? "amateur-regional" : "pro-regional";
  const tierSkill = GAME_CONSTANTS.OPPONENT_SKILL_BY_TIER[tierKey];
  
  const entrants: TournamentEntrant[] = [
    {
      id: "player",
      name: playerName,
      isPlayer: true,
      bowlingAverage: playerAverage,
      scores: [],
      totalPins: 0,
      eliminated: false,
    },
  ];
  
  for (let i = 0; i < definition.fieldSize - 1; i++) {
    const oppSeed = seed * 1000 + i * 137;
    const name = generateOpponentName(oppSeed);
    const { bowlingAverage } = generateOpponentStats(tierSkill.avgMin, tierSkill.avgMax, oppSeed + 500);
    
    entrants.push({
      id: `tournament-opp-${seed}-${i}`,
      name: `${name.firstName} ${name.lastName}`,
      isPlayer: false,
      bowlingAverage,
      scores: [],
      totalPins: 0,
      eliminated: false,
    });
  }
  
  return entrants;
}

export function createActiveTournament(
  tier: TournamentTier, 
  format: TournamentFormat, 
  playerName: string, 
  playerAverage: number, 
  currentWeek: number
): ActiveTournament {
  const seed = currentWeek * 10000 + Date.now() % 10000;
  const definition = TOURNAMENT_DEFINITIONS[tier];
  const entrants = generateTournamentField(tier, playerName, playerAverage, seed);
  
  let bracket: BracketMatch[] | undefined;
  if (format === "bracket") {
    bracket = generateBracket(entrants.length);
  }
  
  return {
    id: `tournament-${tier}-${format}-${seed}`,
    tier,
    format,
    name: definition.name,
    entrants,
    currentRound: 1,
    currentGame: 0,
    totalGames: definition.gamesCount,
    bracket,
    qualifyingCutline: format === "bracket" ? Math.min(8, Math.floor(entrants.length / 2)) : undefined,
    isQualifying: true,
    isFinals: false,
    isComplete: false,
    startedWeek: currentWeek,
    oilPattern: definition.oilPattern,
    prizePool: definition.prizePool,
    entryFee: definition.entryFee,
  };
}

function generateBracket(entrantCount: number): BracketMatch[] {
  const rounds = Math.ceil(Math.log2(entrantCount));
  const matches: BracketMatch[] = [];
  
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
      matches.push({
        round,
        matchIndex,
        entrant1Id: null,
        entrant2Id: null,
        winnerId: null,
        isComplete: false,
      });
    }
  }
  
  return matches;
}

export function simulateTournamentGame(tournament: ActiveTournament, playerScore: number): ActiveTournament {
  const updatedEntrants = tournament.entrants.map(entrant => {
    if (entrant.isPlayer) {
      const newScores = [...entrant.scores, playerScore];
      return {
        ...entrant,
        scores: newScores,
        totalPins: entrant.totalPins + playerScore,
      };
    }
    
    if (!entrant.eliminated) {
      const opponentScore = simulateOpponentLeagueGame(entrant.bowlingAverage, tournament.oilPattern);
      const newScores = [...entrant.scores, opponentScore];
      return {
        ...entrant,
        scores: newScores,
        totalPins: entrant.totalPins + opponentScore,
      };
    }
    
    return entrant;
  });
  
  const newCurrentGame = tournament.currentGame + 1;
  const qualifyingComplete = newCurrentGame >= tournament.totalGames;
  
  let finalEntrants = updatedEntrants;
  let isFinals = tournament.isFinals;
  let isComplete = tournament.isComplete;
  let currentRound = tournament.currentRound;
  
  if (qualifyingComplete && tournament.format === "series") {
    finalEntrants.sort((a, b) => b.totalPins - a.totalPins);
    finalEntrants = finalEntrants.map((e, idx) => ({
      ...e,
      placement: idx + 1,
    }));
    isComplete = true;
  }
  
  if (tournament.format === "bracket") {
    if (qualifyingComplete && !tournament.isFinals) {
      finalEntrants.sort((a, b) => b.totalPins - a.totalPins);
      const cutline = tournament.qualifyingCutline || 8;
      finalEntrants = finalEntrants.map((e, idx) => ({
        ...e,
        eliminated: idx >= cutline,
      }));
      isFinals = true;
      currentRound = 1;
    } else if (tournament.isFinals) {
      const remaining = finalEntrants.filter(e => !e.eliminated);
      
      if (remaining.length <= 1) {
        finalEntrants = finalEntrants.map(e => ({
          ...e,
          placement: e.eliminated ? 0 : 1,
        }));
        finalEntrants.sort((a, b) => b.totalPins - a.totalPins);
        finalEntrants = finalEntrants.map((e, idx) => ({
          ...e,
          placement: idx + 1,
        }));
        isComplete = true;
      } else {
        const playerInRemaining = remaining.find(e => e.isPlayer);
        if (playerInRemaining) {
          const otherRemaining = remaining.filter(e => !e.isPlayer);
          if (otherRemaining.length > 0) {
            const opponentIdx = (currentRound - 1) % otherRemaining.length;
            const opponent = otherRemaining[opponentIdx];
            
            const playerLatestScore = playerInRemaining.scores[playerInRemaining.scores.length - 1] || 0;
            const oppLatestScore = opponent.scores[opponent.scores.length - 1] || 0;
            
            if (playerLatestScore < oppLatestScore) {
              finalEntrants = finalEntrants.map(e => 
                e.isPlayer ? { ...e, eliminated: true, placement: remaining.length } : e
              );
              finalEntrants.sort((a, b) => b.totalPins - a.totalPins);
              finalEntrants = finalEntrants.map((e, idx) => ({
                ...e,
                placement: idx + 1,
              }));
              isComplete = true;
            } else {
              finalEntrants = finalEntrants.map(e => 
                e.id === opponent.id ? { ...e, eliminated: true, placement: remaining.length } : e
              );
            }
            currentRound++;
          }
        } else {
          for (let i = 0; i < remaining.length - 1; i += 2) {
            const e1 = remaining[i];
            const e2 = remaining[i + 1];
            if (e1 && e2) {
              const s1 = e1.scores[e1.scores.length - 1] || 0;
              const s2 = e2.scores[e2.scores.length - 1] || 0;
              const loser = s1 < s2 ? e1 : e2;
              finalEntrants = finalEntrants.map(e => 
                e.id === loser.id ? { ...e, eliminated: true, placement: remaining.length } : e
              );
            }
          }
          currentRound++;
        }
        
        const newRemaining = finalEntrants.filter(e => !e.eliminated);
        if (newRemaining.length <= 1) {
          finalEntrants.sort((a, b) => b.totalPins - a.totalPins);
          finalEntrants = finalEntrants.map((e, idx) => ({
            ...e,
            placement: idx + 1,
          }));
          isComplete = true;
        }
      }
    }
  }
  
  return {
    ...tournament,
    entrants: finalEntrants,
    currentGame: newCurrentGame,
    currentRound,
    isQualifying: !qualifyingComplete,
    isFinals,
    isComplete,
  };
}

export function getTournamentPrize(placement: number, prizePool: number, totalEntrants: number): number {
  if (placement === 1) return Math.floor(prizePool * 0.40);
  if (placement === 2) return Math.floor(prizePool * 0.25);
  if (placement === 3) return Math.floor(prizePool * 0.15);
  if (placement === 4) return Math.floor(prizePool * 0.10);
  if (placement <= 8) return Math.floor(prizePool * 0.02);
  return 0;
}

export function createTournamentResult(tournament: ActiveTournament, week: number): TournamentResult {
  const playerEntrant = tournament.entrants.find(e => e.isPlayer);
  const placement = playerEntrant?.placement || tournament.entrants.length;
  
  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    tier: tournament.tier,
    format: tournament.format,
    placement,
    totalEntrants: tournament.entrants.length,
    totalPins: playerEntrant?.totalPins || 0,
    gamesPlayed: playerEntrant?.scores.length || 0,
    prizeMoney: getTournamentPrize(placement, tournament.prizePool, tournament.entrants.length),
    week,
  };
}

export function canJoinLeague(
  leagueType: LeagueType, 
  playerAverage: number, 
  isProfessional: boolean
): { canJoin: boolean; reason?: string } {
  const definition = LEAGUE_DEFINITIONS[leagueType];
  
  if (definition.requiresPro && !isProfessional) {
    return { canJoin: false, reason: "Professional status required" };
  }
  
  if (definition.minAverage > 0 && playerAverage < definition.minAverage) {
    return { canJoin: false, reason: `Minimum ${definition.minAverage} average required` };
  }
  
  return { canJoin: true };
}

export function canJoinTournament(
  tier: TournamentTier,
  playerAverage: number,
  playerReputation: number,
  isProfessional: boolean
): { canJoin: boolean; reason?: string } {
  const definition = TOURNAMENT_DEFINITIONS[tier];
  
  if (definition.requiresPro && !isProfessional) {
    return { canJoin: false, reason: "Professional status required" };
  }
  
  if (definition.minAverage > 0 && playerAverage < definition.minAverage) {
    return { canJoin: false, reason: `Minimum ${definition.minAverage} average required` };
  }
  
  if (definition.minReputation > 0 && playerReputation < definition.minReputation) {
    return { canJoin: false, reason: `Minimum ${definition.minReputation} reputation required` };
  }
  
  return { canJoin: true };
}
