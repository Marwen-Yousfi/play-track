import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventRecordingService } from '../../services/event-recording.service';
import { VideoSyncService } from '../../services/video-sync.service';
import { LiveEvent, EventType, EventOutcome, MatchPeriod } from '../../models/event.model';
import { Player, FieldCoordinates } from '../../models/player.model';

/**
 * Multi-step action recorder component
 */
@Component({
  selector: 'app-action-recorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="action-recorder">
      <div class="recorder-header">
        <h3>Record Action</h3>
        <div class="step-indicator">
          Step {{ currentStep() }} of 4
        </div>
      </div>

      <!-- Step 1: Select Action Type -->
      @if (currentStep() === 1) {
        <div class="step-content">
          <h4>1. Select Action Type</h4>
          <div class="action-grid">
            @for (action of actionTypes; track action.type) {
              <button 
                class="action-btn"
                [class.selected]="selectedAction() === action.type"
                (click)="selectAction(action.type)">
                <span class="action-icon">{{ action.icon }}</span>
                <span class="action-label">{{ action.label }}</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 2: Select Player -->
      @if (currentStep() === 2) {
        <div class="step-content">
          <h4>2. Select Player</h4>
          <div class="team-selection">
            <button 
              class="btn"
              [class.btn-primary]="selectedTeam() === 'home'"
              [class.btn-secondary]="selectedTeam() !== 'home'"
              (click)="selectedTeam.set('home')">
              Home Team
            </button>
            <button 
              class="btn"
              [class.btn-primary]="selectedTeam() === 'away'"
              [class.btn-secondary]="selectedTeam() !== 'away'"
              (click)="selectedTeam.set('away')">
              Away Team
            </button>
          </div>
          
          <div class="player-list">
            @for (player of filteredPlayers(); track player.id) {
              <button 
                class="player-item"
                [class.selected]="selectedPlayer() === player.id"
                (click)="selectPlayer(player.id)">
                <span class="player-number">{{ player.jerseyNumber }}</span>
                <span class="player-name">{{ player.name }}</span>
                <span class="player-position">{{ player.position }}</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 3: Select Position -->
      @if (currentStep() === 3) {
        <div class="step-content">
          <h4>3. Click on Field to Mark Position</h4>
          <p class="instruction-text">
            Click on the football field below to mark where the action occurred
          </p>
          @if (selectedCoordinates()) {
            <div class="coordinates-info">
              Position selected: ({{ selectedCoordinates()!.x.toFixed(1) }}, {{ selectedCoordinates()!.y.toFixed(1) }})
            </div>
          }
        </div>
      }

      <!-- Step 4: Select Outcome & Details -->
      @if (currentStep() === 4) {
        <div class="step-content">
          <h4>4. Select Outcome & Details</h4>
          
          <div class="form-group">
            <label class="form-label">Outcome</label>
            <select class="form-control" [(ngModel)]="selectedOutcome">
              <option value="successful">Successful</option>
              <option value="unsuccessful">Unsuccessful</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Match Period</label>
            <select class="form-control" [(ngModel)]="selectedPeriod">
              <option value="first_half">First Half</option>
              <option value="second_half">Second Half</option>
              <option value="extra_time_first">Extra Time (1st)</option>
              <option value="extra_time_second">Extra Time (2nd)</option>
            </select>
          </div>

          <!-- Action-specific fields -->
          @if (selectedAction() === 'shot' || selectedAction() === 'goal') {
            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" [(ngModel)]="shotOnTarget">
                Shot on Target
              </label>
            </div>
          }

          @if (selectedAction() === 'pass') {
            <div class="form-group">
              <label class="form-label">Pass Type</label>
              <select class="form-control" [(ngModel)]="passType">
                <option value="short">Short</option>
                <option value="long">Long</option>
                <option value="through_ball">Through Ball</option>
                <option value="cross">Cross</option>
              </select>
            </div>
          }
        </div>
      }

      <!-- Navigation Buttons -->
      <div class="recorder-footer">
        @if (currentStep() > 1) {
          <button class="btn btn-secondary" (click)="previousStep()">
            Previous
          </button>
        }
        
        <div class="spacer"></div>
        
        @if (currentStep() < 4) {
          <button 
            class="btn btn-primary" 
            [disabled]="!canProceed()"
            (click)="nextStep()">
            Next
          </button>
        } @else {
          <button 
            class="btn btn-success" 
            [disabled]="!canProceed()"
            (click)="saveEvent()">
            Save Event
          </button>
        }
        
        <button class="btn btn-secondary" (click)="cancel()">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [`
    .action-recorder {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .recorder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border-color);
    }

    .recorder-header h3 {
      margin: 0;
      font-size: 20px;
      color: var(--text-primary);
    }

    .step-indicator {
      background: var(--primary-color);
      color: white;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }

    .step-content {
      min-height: 300px;
      margin-bottom: 20px;
    }

    .step-content h4 {
      margin-bottom: 16px;
      color: var(--text-primary);
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      border-color: var(--primary-color);
      background: var(--bg-secondary);
    }

    .action-btn.selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
      color: white;
    }

    .action-icon {
      font-size: 24px;
    }

    .action-label {
      font-size: 13px;
      font-weight: 500;
    }

    .team-selection {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .team-selection .btn {
      flex: 1;
    }

    .player-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .player-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .player-item:hover {
      border-color: var(--primary-color);
      background: var(--bg-secondary);
    }

    .player-item.selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
      color: white;
    }

    .player-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--bg-tertiary);
      border-radius: 50%;
      font-weight: 600;
    }

    .player-item.selected .player-number {
      background: white;
      color: var(--primary-color);
    }

    .player-name {
      flex: 1;
      font-weight: 500;
    }

    .player-position {
      font-size: 12px;
      opacity: 0.8;
    }

    .instruction-text {
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .coordinates-info {
      padding: 12px;
      background: var(--success-color);
      color: white;
      border-radius: 6px;
      font-weight: 500;
    }

    .recorder-footer {
      display: flex;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }

    .spacer {
      flex: 1;
    }
  `]
})
export class ActionRecorderComponent {
  currentStep = signal<number>(1);
  selectedAction = signal<EventType | null>(null);
  selectedTeam = signal<'home' | 'away'>('home');
  selectedPlayer = signal<string | null>(null);
  selectedCoordinates = signal<FieldCoordinates | null>(null);
  selectedOutcome: EventOutcome = 'successful';
  selectedPeriod: MatchPeriod = 'first_half';

  // Action-specific fields
  shotOnTarget = false;
  passType: 'short' | 'long' | 'through_ball' | 'cross' = 'short';

  actionTypes = [
    { type: 'pass' as EventType, label: 'Pass', icon: '⚡' },
    { type: 'shot' as EventType, label: 'Shot', icon: '⚽' },
    { type: 'goal' as EventType, label: 'Goal', icon: '🥅' },
    { type: 'tackle' as EventType, label: 'Tackle', icon: '🦵' },
    { type: 'interception' as EventType, label: 'Interception', icon: '✋' },
    { type: 'cross' as EventType, label: 'Cross', icon: '↗️' },
    { type: 'corner' as EventType, label: 'Corner', icon: '🚩' },
    { type: 'foul' as EventType, label: 'Foul', icon: '⚠️' },
    { type: 'save' as EventType, label: 'Save', icon: '🧤' },
    { type: 'clearance' as EventType, label: 'Clearance', icon: '🦶' },
    { type: 'dribble' as EventType, label: 'Dribble', icon: '🏃' },
    { type: 'throw_in' as EventType, label: 'Throw In', icon: '🤾' }
  ];

  filteredPlayers = computed(() => {
    const match = this.eventService.currentMatch();
    if (!match) return [];

    const team = this.selectedTeam() === 'home' ? match.homeTeam : match.awayTeam;
    return team.players;
  });

  constructor(
    private eventService: EventRecordingService,
    private videoSync: VideoSyncService
  ) { }

  selectAction(action: EventType): void {
    this.selectedAction.set(action);
  }

  selectPlayer(playerId: string): void {
    this.selectedPlayer.set(playerId);
  }

  setCoordinates(coords: FieldCoordinates): void {
    this.selectedCoordinates.set(coords);
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1: return this.selectedAction() !== null;
      case 2: return this.selectedPlayer() !== null;
      case 3: return this.selectedCoordinates() !== null;
      case 4: return true;
      default: return false;
    }
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep() < 4) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  saveEvent(): void {
    if (!this.canProceed()) return;

    const match = this.eventService.currentMatch();
    if (!match) return;

    const timestamp = this.videoSync.getCurrentTimestamp();
    const minute = this.videoSync.getMatchMinute(timestamp);

    const eventData: Omit<LiveEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      matchId: match.id,
      timestamp,
      eventType: this.selectedAction()!,
      team: this.selectedTeam(),
      playerId: this.selectedPlayer()!,
      coordinates: this.selectedCoordinates()!,
      outcome: this.selectedOutcome,
      period: this.selectedPeriod,
      minute,
      metadata: {
        shotOnTarget: this.shotOnTarget,
        passType: this.passType
      }
    };

    this.eventService.addEvent(eventData);
    this.reset();
  }

  cancel(): void {
    this.reset();
  }

  private reset(): void {
    this.currentStep.set(1);
    this.selectedAction.set(null);
    this.selectedPlayer.set(null);
    this.selectedCoordinates.set(null);
    this.selectedOutcome = 'successful';
    this.shotOnTarget = false;
  }
}
