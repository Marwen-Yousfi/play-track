import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveEvent } from '../../../../core/models/event.model';
import { VideoSyncService } from '../../../../core/services/video-sync.service';
import { EventRecordingService } from '../../../../core/services/event-recording.service';

/**
 * Event timeline component showing all recorded events
 */
@Component({
  selector: 'app-event-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-timeline">
      <div class="timeline-header">
        <h3>Event Timeline</h3>
        <div class="event-count">
          {{ events().length }} events
        </div>
      </div>

      <div class="timeline-content">
        @if (events().length === 0) {
          <div class="empty-state">
            <p>No events recorded yet</p>
            <p class="text-secondary text-sm">Start recording actions to see them here</p>
          </div>
        } @else {
          <div class="event-list">
            @for (event of sortedEvents(); track event.id) {
              <div class="event-item" (click)="seekToEvent(event)">
                <div class="event-time">
                  {{ formatTime(event.timestamp) }}
                  <span class="event-minute">{{ event.minute }}'</span>
                </div>
                
                <div class="event-icon" [class]="'event-type-' + event.eventType">
                  {{ getEventIcon(event.eventType) }}
                </div>
                
                <div class="event-details">
                  <div class="event-type">{{ formatEventType(event.eventType) }}</div>
                  <div class="event-meta">
                    <span class="team-badge" [class.home]="event.team === 'home'" [class.away]="event.team === 'away'">
                      {{ event.team === 'home' ? 'H' : 'A' }}
                    </span>
                    <span class="player-info">Player #{{ getPlayerNumber(event.playerId) }}</span>
                    <span class="outcome-badge" [class]="'outcome-' + event.outcome">
                      {{ event.outcome }}
                    </span>
                  </div>
                </div>
                
                <div class="event-actions">
                  <button class="btn-icon" (click)="editEvent($event, event)" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon btn-danger" (click)="deleteEvent($event, event)" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .event-timeline {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 2px solid var(--border-color);
    }

    .timeline-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .event-count {
      background: var(--primary-color);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .timeline-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);
    }

    .event-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .event-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .event-item:hover {
      border-color: var(--primary-color);
      background: var(--bg-secondary);
      transform: translateX(4px);
    }

    .event-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;
      font-family: monospace;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .event-minute {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .event-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-tertiary);
      font-size: 18px;
    }

    .event-type-goal {
      background: #4caf50;
    }

    .event-type-shot {
      background: #ff9800;
    }

    .event-type-pass {
      background: #2196f3;
    }

    .event-type-foul {
      background: #f44336;
    }

    .event-details {
      flex: 1;
    }

    .event-type {
      font-weight: 600;
      margin-bottom: 4px;
      text-transform: capitalize;
    }

    .event-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .team-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 3px;
      font-weight: 600;
      font-size: 10px;
      color: white;
    }

    .team-badge.home {
      background: var(--home-team);
    }

    .team-badge.away {
      background: var(--away-team);
    }

    .outcome-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .outcome-successful {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .outcome-unsuccessful {
      background: #ffebee;
      color: #c62828;
    }

    .outcome-neutral {
      background: #e0e0e0;
      color: #616161;
    }

    .event-actions {
      display: flex;
      gap: 4px;
    }

    .btn-icon {
      padding: 6px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .btn-icon.btn-danger:hover {
      background: #ffebee;
      color: #c62828;
    }
  `]
})
export class EventTimelineComponent {
  events = input<LiveEvent[]>([]);

  sortedEvents = computed(() =>
    [...this.events()].sort((a, b) => b.timestamp - a.timestamp)
  );

  constructor(
    private videoSync: VideoSyncService,
    private eventService: EventRecordingService
  ) { }

  formatTime(seconds: number): string {
    return this.videoSync.formatTime(seconds);
  }

  formatEventType(type: string): string {
    return type.replace(/_/g, ' ');
  }

  getEventIcon(type: string): string {
    const icons: Record<string, string> = {
      pass: '⚡',
      shot: '⚽',
      goal: '🥅',
      tackle: '🦵',
      interception: '✋',
      cross: '↗️',
      corner: '🚩',
      foul: '⚠️',
      save: '🧤',
      clearance: '🦶',
      dribble: '🏃',
      throw_in: '🤾'
    };
    return icons[type] || '⚪';
  }

  getPlayerNumber(playerId: string): string {
    const match = this.eventService.currentMatch();
    if (!match) return '?';

    const allPlayers = [...match.homeTeam.players, ...match.awayTeam.players];
    const player = allPlayers.find(p => p.id === playerId);
    return player ? player.jerseyNumber.toString() : '?';
  }

  seekToEvent(event: LiveEvent): void {
    this.videoSync.seekTo(event.timestamp);
  }

  editEvent(mouseEvent: MouseEvent, event: LiveEvent): void {
    mouseEvent.stopPropagation();
    // TODO: Implement edit functionality
    console.log('Edit event:', event);
  }

  deleteEvent(mouseEvent: MouseEvent, event: LiveEvent): void {
    mouseEvent.stopPropagation();
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(event.id);
    }
  }
}
