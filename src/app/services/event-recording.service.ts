import { Injectable, signal, computed } from '@angular/core';
import { LiveEvent, PassEvent, ShotEvent, GoalEvent } from '../models/event.model';
import { Match } from '../models/match.model';

/**
 * Service for managing match events in real-time
 * Uses Angular 18 signals for reactive state management
 */
@Injectable({
    providedIn: 'root'
})
export class EventRecordingService {
    // Signals for reactive state
    private eventsSignal = signal<LiveEvent[]>([]);
    private currentMatchSignal = signal<Match | null>(null);
    private isRecordingSignal = signal<boolean>(false);

    // Computed signals
    readonly events = this.eventsSignal.asReadonly();
    readonly currentMatch = this.currentMatchSignal.asReadonly();
    readonly isRecording = this.isRecordingSignal.asReadonly();

    readonly eventCount = computed(() => this.eventsSignal().length);
    readonly sortedEvents = computed(() =>
        [...this.eventsSignal()].sort((a, b) => a.timestamp - b.timestamp)
    );

    /**
     * Initialize a new match for recording
     */
    initializeMatch(match: Match): void {
        this.currentMatchSignal.set(match);
        this.eventsSignal.set([]);
        this.isRecordingSignal.set(false);
    }

    /**
     * Start recording events
     */
    startRecording(): void {
        if (!this.currentMatchSignal()) {
            throw new Error('No match initialized');
        }
        this.isRecordingSignal.set(true);
    }

    /**
     * Stop recording events
     */
    stopRecording(): void {
        this.isRecordingSignal.set(false);
    }

    /**
     * Add a new event
     */
    addEvent(event: Omit<LiveEvent, 'id' | 'createdAt' | 'updatedAt'>): LiveEvent {
        const newEvent: LiveEvent = {
            ...event,
            id: this.generateEventId(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.eventsSignal.update(events => [...events, newEvent]);
        return newEvent;
    }

    /**
     * Update an existing event
     */
    updateEvent(eventId: string, updates: Partial<LiveEvent>): void {
        this.eventsSignal.update(events =>
            events.map(event =>
                event.id === eventId
                    ? { ...event, ...updates, updatedAt: new Date() }
                    : event
            )
        );
    }

    /**
     * Delete an event
     */
    deleteEvent(eventId: string): void {
        this.eventsSignal.update(events =>
            events.filter(event => event.id !== eventId)
        );
    }

    /**
     * Get events by type
     */
    getEventsByType(eventType: string): LiveEvent[] {
        return this.eventsSignal().filter(event => event.eventType === eventType);
    }

    /**
     * Get events by player
     */
    getEventsByPlayer(playerId: string): LiveEvent[] {
        return this.eventsSignal().filter(event => event.playerId === playerId);
    }

    /**
     * Get events by team
     */
    getEventsByTeam(team: 'home' | 'away'): LiveEvent[] {
        return this.eventsSignal().filter(event => event.team === team);
    }

    /**
     * Get events within a time range
     */
    getEventsByTimeRange(startTime: number, endTime: number): LiveEvent[] {
        return this.eventsSignal().filter(
            event => event.timestamp >= startTime && event.timestamp <= endTime
        );
    }

    /**
     * Clear all events
     */
    clearEvents(): void {
        this.eventsSignal.set([]);
    }

    /**
     * Export events as JSON
     */
    exportEvents(): string {
        return JSON.stringify({
            match: this.currentMatchSignal(),
            events: this.eventsSignal(),
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Import events from JSON
     */
    importEvents(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);
            if (data.match) {
                this.currentMatchSignal.set(data.match);
            }
            if (data.events && Array.isArray(data.events)) {
                this.eventsSignal.set(data.events);
            }
        } catch (error) {
            console.error('Failed to import events:', error);
            throw new Error('Invalid JSON data');
        }
    }

    /**
     * Update match details
     */
    updateMatch(match: Match): void {
        this.currentMatchSignal.set(match);
    }

    /**
     * Update a player's position on the field
     */
    updatePlayerPosition(playerId: string, position: { x: number, y: number }): void {
        const match = this.currentMatchSignal();
        if (!match) return;

        // Helper to update player in a list
        const updatePlayerInList = (players: any[]) =>
            players.map(p => p.id === playerId ? { ...p, fieldPosition: position } : p);

        const updatedMatch = {
            ...match,
            homeTeam: {
                ...match.homeTeam,
                players: updatePlayerInList(match.homeTeam.players)
            },
            awayTeam: {
                ...match.awayTeam,
                players: updatePlayerInList(match.awayTeam.players)
            }
        };

        this.currentMatchSignal.set(updatedMatch);
    }

    /**
     * Generate a unique event ID
     */
    private generateEventId(): string {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
