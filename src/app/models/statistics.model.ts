/**
 * Match statistics computed from all events
 */
export interface MatchStatistics {
    matchId: string;
    homeTeam: TeamStatistics;
    awayTeam: TeamStatistics;
    computedAt: Date;
}

export interface TeamStatistics {
    teamId: string;
    // Possession
    possession: number; // Percentage 0-100

    // Passing
    totalPasses: number;
    successfulPasses: number;
    passAccuracy: number; // Percentage
    forwardPasses: number;
    backwardPasses: number;
    longPasses: number;
    shortPasses: number;

    // Shooting
    shots: number;
    shotsOnTarget: number;
    shotsOffTarget: number;
    blockedShots: number;
    goals: number;
    xG: number; // Total expected goals

    // Attacking
    crosses: number;
    successfulCrosses: number;
    corners: number;
    offsides: number;
    dribbles: number;
    successfulDribbles: number;

    // Defending
    tackles: number;
    successfulTackles: number;
    interceptions: number;
    clearances: number;

    // Discipline
    fouls: number;
    foulsSuffered: number;
    yellowCards: number;
    redCards: number;

    // Duels
    aerialDuels: number;
    aerialDuelsWon: number;
    groundDuels: number;
    groundDuelsWon: number;

    // Set Pieces
    freeKicks: number;
    penalties: number;
    penaltiesScored: number;
    throwIns: number;
    goalKicks: number;
}

/**
 * Player statistics
 */
export interface PlayerStatistics {
    playerId: string;
    matchId: string;
    minutesPlayed: number;

    // Passing
    passes: number;
    passesCompleted: number;
    passAccuracy: number;
    keyPasses: number;
    assists: number;

    // Shooting
    shots: number;
    shotsOnTarget: number;
    goals: number;
    xG: number;

    // Defending
    tackles: number;
    interceptions: number;
    clearances: number;

    // Attacking
    dribbles: number;
    successfulDribbles: number;
    crosses: number;

    // Discipline
    fouls: number;
    foulsSuffered: number;
    yellowCards: number;
    redCards: number;

    // Duels
    duelsWon: number;
    duelsLost: number;
    aerialDuelsWon: number;

    // Touches
    touches: number;
    touchesInBox: number;

    // Distance
    distanceCovered?: number; // In kilometers
}

/**
 * Heat map data for a player
 */
export interface HeatMapData {
    playerId: string;
    matchId: string;
    // Grid-based heat map (field divided into zones)
    zones: HeatMapZone[];
}

export interface HeatMapZone {
    x: number; // Zone x coordinate (0-100)
    y: number; // Zone y coordinate (0-100)
    width: number; // Zone width
    height: number; // Zone height
    touches: number; // Number of touches in this zone
    intensity: number; // 0-1 normalized intensity
}
