/**
 * Represents a football player in the match
 */
export interface Player {
    id: string;
    name: string;
    jerseyNumber: number;
    team: 'home' | 'away';
    position: PlayerPosition;
    // Current position on the field (x, y coordinates in percentage 0-100)
    fieldPosition: FieldCoordinates;
}

export type PlayerPosition =
    | 'GK'  // Goalkeeper
    | 'CB'  // Center Back
    | 'LB'  // Left Back
    | 'RB'  // Right Back
    | 'CDM' // Defensive Midfielder
    | 'CM'  // Central Midfielder
    | 'CAM' // Attacking Midfielder
    | 'LW'  // Left Winger
    | 'RW'  // Right Winger
    | 'ST'; // Striker

/**
 * Field coordinates in percentage (0-100)
 * Origin (0,0) is top-left corner
 * (100, 100) is bottom-right corner
 */
export interface FieldCoordinates {
    x: number; // 0-100 (left to right)
    y: number; // 0-100 (top to bottom)
}
