import { LiveEvent } from './event.model';

/**
 * Validation rule definition
 */
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    category: ValidationCategory;
    validate: (context: ValidationContext) => ValidationResult;
}

export type ValidationCategory =
    | 'data_consistency'
    | 'logical_constraint'
    | 'field_boundary'
    | 'team_assignment'
    | 'temporal'
    | 'statistical';

export interface ValidationContext {
    event?: LiveEvent;
    allEvents: LiveEvent[];
    matchData: any; // Match context
    statistics?: any; // Current statistics
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    ruleId: string;
    message: string;
    field?: string;
    severity: 'error';
}

export interface ValidationWarning {
    ruleId: string;
    message: string;
    field?: string;
    severity: 'warning' | 'info';
}

/**
 * Predefined validation rules
 */
export const VALIDATION_RULES: ValidationRule[] = [
    {
        id: 'passes_consistency',
        name: 'Pass Consistency',
        description: 'Successful passes must be less than or equal to total passes',
        severity: 'error',
        category: 'data_consistency',
        validate: (context: ValidationContext): ValidationResult => {
            const stats = context.statistics;
            const errors: ValidationError[] = [];

            if (stats?.homeTeam.successfulPasses > stats?.homeTeam.totalPasses) {
                errors.push({
                    ruleId: 'passes_consistency',
                    message: 'Home team successful passes exceed total passes',
                    severity: 'error'
                });
            }

            if (stats?.awayTeam.successfulPasses > stats?.awayTeam.totalPasses) {
                errors.push({
                    ruleId: 'passes_consistency',
                    message: 'Away team successful passes exceed total passes',
                    severity: 'error'
                });
            }

            return { valid: errors.length === 0, errors, warnings: [] };
        }
    },
    {
        id: 'shots_consistency',
        name: 'Shots Consistency',
        description: 'Shots on target must be less than or equal to total shots',
        severity: 'error',
        category: 'data_consistency',
        validate: (context: ValidationContext): ValidationResult => {
            const stats = context.statistics;
            const errors: ValidationError[] = [];

            if (stats?.homeTeam.shotsOnTarget > stats?.homeTeam.shots) {
                errors.push({
                    ruleId: 'shots_consistency',
                    message: 'Home team shots on target exceed total shots',
                    severity: 'error'
                });
            }

            if (stats?.awayTeam.shotsOnTarget > stats?.awayTeam.shots) {
                errors.push({
                    ruleId: 'shots_consistency',
                    message: 'Away team shots on target exceed total shots',
                    severity: 'error'
                });
            }

            return { valid: errors.length === 0, errors, warnings: [] };
        }
    },
    {
        id: 'possession_total',
        name: 'Possession Total',
        description: 'Home and away possession must sum to 100%',
        severity: 'error',
        category: 'statistical',
        validate: (context: ValidationContext): ValidationResult => {
            const stats = context.statistics;
            const errors: ValidationError[] = [];

            const total = (stats?.homeTeam.possession || 0) + (stats?.awayTeam.possession || 0);
            if (Math.abs(total - 100) > 0.1) { // Allow 0.1% tolerance
                errors.push({
                    ruleId: 'possession_total',
                    message: `Possession totals ${total}% instead of 100%`,
                    severity: 'error'
                });
            }

            return { valid: errors.length === 0, errors, warnings: [] };
        }
    },
    {
        id: 'field_boundaries',
        name: 'Field Boundaries',
        description: 'Event coordinates must be within field boundaries (0-100)',
        severity: 'error',
        category: 'field_boundary',
        validate: (context: ValidationContext): ValidationResult => {
            const event = context.event;
            const errors: ValidationError[] = [];

            if (event) {
                const { x, y } = event.coordinates;
                if (x < 0 || x > 100 || y < 0 || y > 100) {
                    errors.push({
                        ruleId: 'field_boundaries',
                        message: `Event coordinates (${x}, ${y}) are outside field boundaries`,
                        field: 'coordinates',
                        severity: 'error'
                    });
                }
            }

            return { valid: errors.length === 0, errors, warnings: [] };
        }
    },
    {
        id: 'player_team_assignment',
        name: 'Player Team Assignment',
        description: 'Player must belong to the team specified in the event',
        severity: 'error',
        category: 'team_assignment',
        validate: (context: ValidationContext): ValidationResult => {
            const event = context.event;
            const matchData = context.matchData;
            const errors: ValidationError[] = [];

            if (event && matchData) {
                const team = event.team === 'home' ? matchData.homeTeam : matchData.awayTeam;
                const player = team.players.find((p: any) => p.id === event.playerId);

                if (!player) {
                    errors.push({
                        ruleId: 'player_team_assignment',
                        message: `Player ${event.playerId} not found in ${event.team} team`,
                        field: 'playerId',
                        severity: 'error'
                    });
                }
            }

            return { valid: errors.length === 0, errors, warnings: [] };
        }
    },
    {
        id: 'temporal_order',
        name: 'Temporal Order',
        description: 'Event timestamp must be within match duration',
        severity: 'warning',
        category: 'temporal',
        validate: (context: ValidationContext): ValidationResult => {
            const event = context.event;
            const matchData = context.matchData;
            const warnings: ValidationWarning[] = [];

            if (event && matchData) {
                if (event.timestamp < 0 || event.timestamp > matchData.duration) {
                    warnings.push({
                        ruleId: 'temporal_order',
                        message: `Event timestamp ${event.timestamp}s is outside match duration`,
                        field: 'timestamp',
                        severity: 'warning'
                    });
                }
            }

            return { valid: true, errors: [], warnings };
        }
    },
    {
        id: 'goals_vs_shots',
        name: 'Goals vs Shots',
        description: 'Goals must be less than or equal to shots',
        severity: 'error',
        category: 'logical_constraint',
        validate: (context: ValidationContext): ValidationResult => {
            const stats = context.statistics;
            const errors: ValidationError[] = [];

            if (stats?.homeTeam.goals > stats?.homeTeam.shots) {
                errors.push({
                    ruleId: 'goals_vs_shots',
                    message: 'Home team goals exceed total shots',
                    severity: 'error'
                });
            }

            if (stats?.awayTeam.goals > stats?.awayTeam.shots) {
                errors.push({
                    ruleId: 'goals_vs_shots',
                    message: 'Away team goals exceed total shots',
                    severity: 'error'
                });
            }

            return { valid: errors.length === 0, errors, warnings: [] };
        }
    }
];
