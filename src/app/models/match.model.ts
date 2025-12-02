import { Player } from './player.model';

/**
 * Represents a football match
 */
export interface Match {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    date: Date;
    venue: string;
    competition: string;
    // Video file URL or blob
    videoUrl?: string;
    videoFile?: File;
    // Match duration in seconds
    duration: number;
    status: MatchStatus;
    // Current video timestamp in seconds
    currentTimestamp: number;
}

export interface Team {
    id: string;
    name: string;
    logo?: string;
    players: Player[];
    formation: string; // e.g., "4-3-3", "4-4-2"
}

export type MatchStatus =
    | 'not_started'
    | 'first_half'
    | 'half_time'
    | 'second_half'
    | 'extra_time_first_half'
    | 'extra_time_second_half'
    | 'penalty_shootout'
    | 'finished';
