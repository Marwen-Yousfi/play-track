import { Injectable } from '@angular/core';
import { LiveEvent, ShotEvent, isShotEvent } from '../models/event.model';
import { MatchStatistics, TeamStatistics, PlayerStatistics } from '../models/statistics.model';
import { Match } from '../models/match.model';

/**
 * Service for computing match and player statistics from events
 */
@Injectable({
    providedIn: 'root'
})
export class StatisticsService {

    /**
     * Compute complete match statistics from all events
     */
    computeMatchStatistics(match: Match, events: LiveEvent[]): MatchStatistics {
        const homeStats = this.computeTeamStatistics('home', events, match);
        const awayStats = this.computeTeamStatistics('away', events, match);

        // Calculate possession based on successful passes
        const totalPasses = homeStats.successfulPasses + awayStats.successfulPasses;
        if (totalPasses > 0) {
            homeStats.possession = (homeStats.successfulPasses / totalPasses) * 100;
            awayStats.possession = (awayStats.successfulPasses / totalPasses) * 100;
        }

        return {
            matchId: match.id,
            homeTeam: homeStats,
            awayTeam: awayStats,
            computedAt: new Date()
        };
    }

    /**
     * Compute team statistics
     */
    private computeTeamStatistics(
        team: 'home' | 'away',
        events: LiveEvent[],
        match: Match
    ): TeamStatistics {
        const teamEvents = events.filter(e => e.team === team);

        const stats: TeamStatistics = {
            teamId: team === 'home' ? match.homeTeam.id : match.awayTeam.id,
            possession: 0,

            // Passing
            totalPasses: this.countEvents(teamEvents, 'pass'),
            successfulPasses: this.countSuccessfulEvents(teamEvents, 'pass'),
            passAccuracy: 0,
            forwardPasses: 0,
            backwardPasses: 0,
            longPasses: 0,
            shortPasses: 0,

            // Shooting
            shots: this.countEvents(teamEvents, 'shot') + this.countEvents(teamEvents, 'goal'),
            shotsOnTarget: this.countShotsOnTarget(teamEvents),
            shotsOffTarget: 0,
            blockedShots: this.countBlockedShots(teamEvents),
            goals: this.countEvents(teamEvents, 'goal'),
            xG: this.sumExpectedGoals(teamEvents),

            // Attacking
            crosses: this.countEvents(teamEvents, 'cross'),
            successfulCrosses: this.countSuccessfulEvents(teamEvents, 'cross'),
            corners: this.countEvents(teamEvents, 'corner'),
            offsides: this.countEvents(teamEvents, 'offside'),
            dribbles: this.countEvents(teamEvents, 'dribble'),
            successfulDribbles: this.countSuccessfulEvents(teamEvents, 'dribble'),

            // Defending
            tackles: this.countEvents(teamEvents, 'tackle'),
            successfulTackles: this.countSuccessfulEvents(teamEvents, 'tackle'),
            interceptions: this.countEvents(teamEvents, 'interception'),
            clearances: this.countEvents(teamEvents, 'clearance'),

            // Discipline
            fouls: this.countEvents(teamEvents, 'foul'),
            foulsSuffered: this.countFoulsSuffered(events, team),
            yellowCards: this.countEvents(teamEvents, 'yellow_card'),
            redCards: this.countEvents(teamEvents, 'red_card'),

            // Duels
            aerialDuels: this.countEvents(teamEvents, 'aerial_duel'),
            aerialDuelsWon: this.countSuccessfulEvents(teamEvents, 'aerial_duel'),
            groundDuels: 0,
            groundDuelsWon: 0,

            // Set Pieces
            freeKicks: this.countEvents(teamEvents, 'free_kick'),
            penalties: this.countEvents(teamEvents, 'penalty'),
            penaltiesScored: this.countSuccessfulEvents(teamEvents, 'penalty'),
            throwIns: this.countEvents(teamEvents, 'throw_in'),
            goalKicks: this.countEvents(teamEvents, 'goal_kick')
        };

        // Calculate pass accuracy
        if (stats.totalPasses > 0) {
            stats.passAccuracy = (stats.successfulPasses / stats.totalPasses) * 100;
        }

        // Calculate shots off target
        stats.shotsOffTarget = stats.shots - stats.shotsOnTarget - stats.blockedShots;

        return stats;
    }

    /**
     * Compute player statistics
     */
    computePlayerStatistics(playerId: string, matchId: string, events: LiveEvent[]): PlayerStatistics {
        const playerEvents = events.filter(e => e.playerId === playerId);

        const passes = playerEvents.filter(e => e.eventType === 'pass');
        const passesCompleted = passes.filter(e => e.outcome === 'successful').length;

        const shots = playerEvents.filter(e => e.eventType === 'shot' || e.eventType === 'goal');
        const shotsOnTarget = shots.filter(e => (e as any).onTarget === true).length;

        return {
            playerId,
            matchId,
            minutesPlayed: 90, // TODO: Calculate from substitution events

            // Passing
            passes: passes.length,
            passesCompleted,
            passAccuracy: passes.length > 0 ? (passesCompleted / passes.length) * 100 : 0,
            keyPasses: 0, // TODO: Implement key pass detection
            assists: this.countAssists(playerId, events),

            // Shooting
            shots: shots.length,
            shotsOnTarget,
            goals: playerEvents.filter(e => e.eventType === 'goal').length,
            xG: this.sumExpectedGoalsForPlayer(playerEvents),

            // Defending
            tackles: playerEvents.filter(e => e.eventType === 'tackle').length,
            interceptions: playerEvents.filter(e => e.eventType === 'interception').length,
            clearances: playerEvents.filter(e => e.eventType === 'clearance').length,

            // Attacking
            dribbles: playerEvents.filter(e => e.eventType === 'dribble').length,
            successfulDribbles: playerEvents.filter(e =>
                e.eventType === 'dribble' && e.outcome === 'successful'
            ).length,
            crosses: playerEvents.filter(e => e.eventType === 'cross').length,

            // Discipline
            fouls: playerEvents.filter(e => e.eventType === 'foul').length,
            foulsSuffered: this.countFoulsSufferedByPlayer(playerId, events),
            yellowCards: playerEvents.filter(e => e.eventType === 'yellow_card').length,
            redCards: playerEvents.filter(e => e.eventType === 'red_card').length,

            // Duels
            duelsWon: playerEvents.filter(e =>
                (e.eventType === 'tackle' || e.eventType === 'aerial_duel') &&
                e.outcome === 'successful'
            ).length,
            duelsLost: playerEvents.filter(e =>
                (e.eventType === 'tackle' || e.eventType === 'aerial_duel') &&
                e.outcome === 'unsuccessful'
            ).length,
            aerialDuelsWon: playerEvents.filter(e =>
                e.eventType === 'aerial_duel' && e.outcome === 'successful'
            ).length,

            // Touches
            touches: playerEvents.length,
            touchesInBox: 0 // TODO: Implement box detection
        };
    }

    // Helper methods
    private countEvents(events: LiveEvent[], eventType: string): number {
        return events.filter(e => e.eventType === eventType).length;
    }

    private countSuccessfulEvents(events: LiveEvent[], eventType: string): number {
        return events.filter(e =>
            e.eventType === eventType && e.outcome === 'successful'
        ).length;
    }

    private countShotsOnTarget(events: LiveEvent[]): number {
        return events.filter(e =>
            isShotEvent(e) && e.onTarget
        ).length;
    }

    private countBlockedShots(events: LiveEvent[]): number {
        return events.filter(e =>
            e.eventType === 'shot' && (e as ShotEvent).blocked
        ).length;
    }

    private sumExpectedGoals(events: LiveEvent[]): number {
        return events
            .filter(isShotEvent)
            .reduce((sum, e) => sum + (e.xG || 0), 0);
    }

    private sumExpectedGoalsForPlayer(events: LiveEvent[]): number {
        return events
            .filter(isShotEvent)
            .reduce((sum, e) => sum + (e.xG || 0), 0);
    }

    private countAssists(playerId: string, events: LiveEvent[]): number {
        return events.filter(e =>
            e.eventType === 'goal' && (e as any).assistPlayerId === playerId
        ).length;
    }

    private countFoulsSuffered(events: LiveEvent[], team: 'home' | 'away'): number {
        return events.filter(e =>
            e.eventType === 'foul' && e.team !== team
        ).length;
    }

    private countFoulsSufferedByPlayer(playerId: string, events: LiveEvent[]): number {
        return events.filter(e =>
            e.eventType === 'foul' && (e as any).victimPlayerId === playerId
        ).length;
    }
}
