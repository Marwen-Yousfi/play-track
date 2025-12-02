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
    coordinates: FieldCoordinates; // Where the event occurred
    outcome: EventOutcome;
    period: MatchPeriod;
    minute: number; // Match minute
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>; // Extensible metadata
}

export type EventType =
    | 'pass'
    | 'shot'
    | 'goal'
    | 'save'
    | 'tackle'
    | 'interception'
    | 'clearance'
    | 'cross'
    | 'corner'
    | 'free_kick'
    | 'penalty'
    | 'throw_in'
    | 'goal_kick'
    | 'offside'
    | 'foul'
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
