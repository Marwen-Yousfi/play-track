import { FieldCoordinates } from './player.model';

/**
 * Base interface for all match events
 */
export interface LiveEvent {
    id: string;
    matchId: string;
    timestamp: number; // Video timestamp in seconds
    eventType: EventType;
    team: 'home' | 'away';
    playerId: string; // Primary player involved
    secondaryPlayerIds?: string[]; // Additional players involved
    coordinates: FieldCoordinates; // Where the event occurred (origin for dual-position events)

    // Dual-position event fields (for passes, shots, crosses, etc.)
    originCoordinates?: FieldCoordinates; // Starting position of the event
    destinationCoordinates?: FieldCoordinates; // Ending position of the event
    receiverId?: string; // Player who received the pass/ball
    distance?: number; // Distance in meters (calculated)
    direction?: number; // Direction in degrees 0-360 (calculated)

    outcome: EventOutcome;
    period: MatchPeriod;
    minute: number; // Match minute
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>; // Extensible metadata
}

export type EventType =
    | 'pass'
    | 'duel'
    | 'defensive_action'
    | 'dribbling'
    | 'progressive_carry'
    | 'reception'
    | 'press'
    | 'shot'
    | 'shot_direction'
    | 'shot_under_pressure'
    | 'turn_over'
    | 'foul'
    | 'sub'
    | 'free_kick'
    | 'corner'
    | 'goalkeeper_action'
    | 'gk_distribution'
    | 'card'
    | 'game_event'
    | 'counter_attack'
    | 'penalty'
    // legacy
    | 'goal'
    | 'save'
    | 'tackle'
    | 'interception'
    | 'clearance'
    | 'cross'
    | 'throw_in'
    | 'goal_kick'
    | 'offside'
    | 'yellow_card'
    | 'red_card'
    | 'substitution'
    | 'dribble'
    | 'aerial_duel'
    | 'ball_recovery';

export type EventOutcome =
    | 'successful'
    | 'unsuccessful'
    | 'neutral';

export type MatchPeriod =
    | 'first_half'
    | 'second_half'
    | 'extra_time_first'
    | 'extra_time_second'
    | 'penalty_shootout';

/**
 * Pass Event - extends LiveEvent with pass-specific data
 */
export interface PassEvent extends LiveEvent {
    eventType: 'pass';
    passType: 'short' | 'long' | 'through_ball' | 'cross' | 'back_pass';
    endCoordinates: FieldCoordinates; // Where the pass ended
    receiverId?: string; // Player who received the pass
    distance: number; // Pass distance in meters
    progressive: boolean; // Did it progress the ball significantly?
}

/**
 * Base interface for shooting events (Shot and Goal)
 */
export interface BaseShotEvent extends LiveEvent {
    bodyPart: 'right_foot' | 'left_foot' | 'head' | 'chest' | 'other';
    onTarget: boolean;
    goalMouthLocation?: GoalMouthLocation;
    xG: number;
    distance: number;
}

/**
 * Shot Event
 */
export interface ShotEvent extends BaseShotEvent {
    eventType: 'shot';
    blocked: boolean;
}

/**
 * Goal Event
 */
export interface GoalEvent extends BaseShotEvent {
    eventType: 'goal';
    assistPlayerId?: string;
    goalType: 'open_play' | 'penalty' | 'free_kick' | 'corner' | 'own_goal';
}

/**
 * Tackle Event
 */
export interface TackleEvent extends LiveEvent {
    eventType: 'tackle';
    tackleType: 'standing' | 'sliding';
    wonPossession: boolean;
    foul: boolean;
}

/**
 * Dribble Event
 */
export interface DribbleEvent extends LiveEvent {
    eventType: 'dribble';
    opponentId?: string; // Defender beaten
    progressive: boolean;
}

/**
 * Foul Event
 */
export interface FoulEvent extends LiveEvent {
    eventType: 'foul';
    foulType: 'standard' | 'dangerous' | 'violent_conduct';
    cardGiven?: 'yellow' | 'red';
    victimPlayerId: string;
}

/**
 * Substitution Event
 */
export interface SubstitutionEvent extends LiveEvent {
    eventType: 'substitution';
    playerOutId: string;
    playerInId: string;
    reason?: 'tactical' | 'injury' | 'disciplinary';
}

/**
 * Goal mouth location (3x3 grid)
 */
export interface GoalMouthLocation {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'middle' | 'bottom';
}

/**
 * Type guard functions
 */
export function isPassEvent(event: LiveEvent): event is PassEvent {
    return event.eventType === 'pass';
}

export function isShotEvent(event: LiveEvent): event is ShotEvent | GoalEvent {
    return event.eventType === 'shot' || event.eventType === 'goal';
}

export function isGoalEvent(event: LiveEvent): event is GoalEvent {
    return event.eventType === 'goal';
}

export function isTackleEvent(event: LiveEvent): event is TackleEvent {
    return event.eventType === 'tackle';
}

export function isFoulEvent(event: LiveEvent): event is FoulEvent {
    return event.eventType === 'foul';
}

/**
 * Check if an event type requires dual-position tracking (origin + destination)
 */
export function requiresDualPosition(eventType: EventType): boolean {
    const dualPositionEvents: EventType[] = [
        'pass',
        'shot',
        'goal',
        'cross',
        'corner',
        'throw_in',
        'free_kick',
        'penalty'
    ];
    return dualPositionEvents.includes(eventType);
}
