import { FieldCoordinates } from '../../../core/models/player.model';

/**
 * Formation template interface
 */
export interface FormationTemplate {
    name: string;
    description: string;
    positions: FormationPositions;
}

/**
 * Formation positions by role
 */
export interface FormationPositions {
    GK: FieldCoordinates;
    DEF: FieldCoordinates[];
    MID: FieldCoordinates[];
    FWD: FieldCoordinates[];
}

/**
 * Pre-defined football formations
 */
export const FORMATIONS: Record<string, FormationTemplate> = {
    '4-4-2': {
        name: '4-4-2',
        description: 'Classic balanced formation',
        positions: {
            GK: { x: 10, y: 50 },
            DEF: [
                { x: 25, y: 15 },  // Right back
                { x: 25, y: 35 },  // Right center back
                { x: 25, y: 65 },  // Left center back
                { x: 25, y: 85 }   // Left back
            ],
            MID: [
                { x: 50, y: 15 },  // Right midfielder
                { x: 50, y: 35 },  // Right center mid
                { x: 50, y: 65 },  // Left center mid
                { x: 50, y: 85 }   // Left midfielder
            ],
            FWD: [
                { x: 75, y: 40 },  // Right forward
                { x: 75, y: 60 }   // Left forward
            ]
        }
    },
    '4-3-3': {
        name: '4-3-3',
        description: 'Attacking formation',
        positions: {
            GK: { x: 10, y: 50 },
            DEF: [
                { x: 25, y: 15 },
                { x: 25, y: 35 },
                { x: 25, y: 65 },
                { x: 25, y: 85 }
            ],
            MID: [
                { x: 50, y: 25 },  // Right midfielder
                { x: 50, y: 50 },  // Center midfielder
                { x: 50, y: 75 }   // Left midfielder
            ],
            FWD: [
                { x: 75, y: 20 },  // Right winger
                { x: 75, y: 50 },  // Striker
                { x: 75, y: 80 }   // Left winger
            ]
        }
    },
    '3-5-2': {
        name: '3-5-2',
        description: 'Defensive with wing-backs',
        positions: {
            GK: { x: 10, y: 50 },
            DEF: [
                { x: 25, y: 25 },  // Right center back
                { x: 25, y: 50 },  // Center back
                { x: 25, y: 75 }   // Left center back
            ],
            MID: [
                { x: 45, y: 10 },  // Right wing-back
                { x: 50, y: 30 },  // Right midfielder
                { x: 50, y: 50 },  // Center midfielder
                { x: 50, y: 70 },  // Left midfielder
                { x: 45, y: 90 }   // Left wing-back
            ],
            FWD: [
                { x: 75, y: 40 },  // Right striker
                { x: 75, y: 60 }   // Left striker
            ]
        }
    },
    '4-2-3-1': {
        name: '4-2-3-1',
        description: 'Modern balanced formation',
        positions: {
            GK: { x: 10, y: 50 },
            DEF: [
                { x: 25, y: 15 },
                { x: 25, y: 35 },
                { x: 25, y: 65 },
                { x: 25, y: 85 }
            ],
            MID: [
                { x: 45, y: 35 },  // Right defensive mid
                { x: 45, y: 65 },  // Left defensive mid
                { x: 65, y: 20 },  // Right attacking mid
                { x: 65, y: 50 },  // Center attacking mid
                { x: 65, y: 80 }   // Left attacking mid
            ],
            FWD: [
                { x: 80, y: 50 }   // Striker
            ]
        }
    },
    '5-3-2': {
        name: '5-3-2',
        description: 'Ultra defensive formation',
        positions: {
            GK: { x: 10, y: 50 },
            DEF: [
                { x: 25, y: 10 },  // Right wing-back
                { x: 25, y: 30 },  // Right center back
                { x: 25, y: 50 },  // Center back
                { x: 25, y: 70 },  // Left center back
                { x: 25, y: 90 }   // Left wing-back
            ],
            MID: [
                { x: 50, y: 30 },  // Right midfielder
                { x: 50, y: 50 },  // Center midfielder
                { x: 50, y: 70 }   // Left midfielder
            ],
            FWD: [
                { x: 75, y: 40 },  // Right striker
                { x: 75, y: 60 }   // Left striker
            ]
        }
    }
};

/**
 * Get list of available formations
 */
export function getFormationList(): string[] {
    return Object.keys(FORMATIONS);
}

/**
 * Get formation by name
 */
export function getFormation(name: string): FormationTemplate | undefined {
    return FORMATIONS[name];
}
