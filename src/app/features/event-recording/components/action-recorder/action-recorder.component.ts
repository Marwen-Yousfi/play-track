import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventRecordingService } from '../../../../core/services/event-recording.service';
import { VideoSyncService } from '../../../../core/services/video-sync.service';
import { LiveEvent, EventType, EventOutcome, MatchPeriod } from '../../../../core/models/event.model';
import { Player, FieldCoordinates } from '../../../../core/models/player.model';
import { calculateDistance, calculateDirection } from '../../../field-visualization/utils/field-calculations';
import { ACTION_TYPES, SUB_ACTION_TYPES, SUB_EVENTS } from '../../../../core/mock-data/mocked-data-action-recorder';
import { FindPipe } from '../../../../core/pipes/find.pipe';

@Component({
  selector: 'app-action-recorder',
  standalone: true,
  imports: [CommonModule, FormsModule, FindPipe],
  templateUrl: './action-recorder.component.html',
  styleUrl: './action-recorder.component.scss'
})
export class ActionRecorderComponent {
  currentStep = signal<number>(1);
  selectedAction = signal<EventType | null>(null);
  selectedSubAction = signal<string | null>(null);
  selectedSubEvent = signal<string | null>(null);
  selectedTeam = signal<'home' | 'away'>('home');
  selectedPlayer = signal<string | null>(null);
  selectedCoordinates = signal<FieldCoordinates | null>(null);

  subActionDropdownOpen = signal(false);

  originCoordinates = signal<FieldCoordinates | null>(null);
  destinationCoordinates = signal<FieldCoordinates | null>(null);
  selectedReceiver = signal<string | null>(null);

  selectedOutcome: EventOutcome = 'successful';
  selectedPeriod: MatchPeriod = 'first_half';

  shotOnTarget = false;

  actionTypes = ACTION_TYPES;

  subActionTypes = computed(() => {
    const action = this.selectedAction();
    return action ? SUB_ACTION_TYPES[action] || [] : [];
  });

  subEvents = computed(() => {
    const action = this.selectedAction();
    return action ? SUB_EVENTS[action] || [] : [];
  });

  requiresPitchPosition = computed(() => {
    const action = this.selectedAction();
    if (!action) return true;
    const found = this.actionTypes.find(a => a.type === action as string);
    return found?.pitchPosition ?? true;
  });

  requiresDualPosition = computed(() => {
    const action = this.selectedAction();
    if (!action) return false;
    const dualPositionActions: EventType[] = ['pass', 'shot', 'goal', 'cross', 'corner', 'throw_in', 'free_kick', 'penalty'];
    return dualPositionActions.includes(action);
  });

  totalSteps = computed(() => {
    const action = this.selectedAction();
    if (!action) return 3;
    if (this.requiresDualPosition()) {
      return (action === 'corner' || action === 'penalty') ? 4 : 5;
    }
    return this.requiresPitchPosition() ? 3 : 2;
  });

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

  toggleSubActionDropdown(): void {
    this.subActionDropdownOpen.update(isOpen => !isOpen);
  }

  selectSubAction(subActionType: string): void {
    this.selectedSubAction.set(subActionType);
    this.subActionDropdownOpen.set(false);
  }

  selectAction(action: EventType): void {
    this.selectedAction.set(action);
    this.selectedSubAction.set(null);
    this.selectedSubEvent.set(null);
    if (this.currentStep() > this.totalSteps()) {
      this.currentStep.set(this.totalSteps());
    }
  }

  selectPlayer(playerId: string): void {
    this.selectedPlayer.set(playerId);
  }

  selectReceiver(playerId: string): void {
    this.selectedReceiver.set(playerId);
  }

  skipReceiver(): void {
    this.selectedReceiver.set(null);
    this.nextStep();
  }

  setCoordinates(coords: FieldCoordinates): void {
    const step = this.currentStep();

    if (this.requiresDualPosition()) {
      if (step === 3) {
        this.originCoordinates.set(coords);
        this.selectedCoordinates.set(coords);
      } else if (step === 4 && this.selectedAction() !== 'pass') {
        this.destinationCoordinates.set(coords);
      } else if (step === 5) {
        this.destinationCoordinates.set(coords);
      }
    } else {
      this.selectedCoordinates.set(coords);
    }
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1:
        if (!this.selectedAction()) return false;
        if (this.subActionTypes().length > 0 && !this.selectedSubAction()) return false;
        if (this.subEvents().length > 0 && !this.selectedSubEvent()) return false;
        return true;
      case 2: return this.selectedPlayer() !== null;
      case 3:
        if (this.requiresDualPosition()) {
          if (this.requiresPitchPosition()) {
            return this.originCoordinates() !== null;
          } else {
            if (this.selectedAction() === 'pass') return true; // receiver optional
            return this.destinationCoordinates() !== null;
          }
        } else {
          return this.selectedCoordinates() !== null;
        }
      case 4:
        if (this.requiresDualPosition()) {
          if (this.requiresPitchPosition()) {
            if (this.selectedAction() === 'pass') return true;
            return this.destinationCoordinates() !== null;
          } else {
            return this.destinationCoordinates() !== null;
          }
        }
        return false;
      case 5:
        return this.destinationCoordinates() !== null;
      default: return false;
    }
  }

  allRequiredFilled(): boolean {
    if (!this.selectedAction()) return false;
    if (this.subActionTypes().length > 0 && !this.selectedSubAction()) return false;
    if (this.subEvents().length > 0 && !this.selectedSubEvent()) return false;
    if (!this.selectedPlayer()) return false;
    if (this.requiresDualPosition()) {
      if (this.requiresPitchPosition() && !this.originCoordinates()) return false;
      if (!this.destinationCoordinates()) return false;
    } else {
      if (!this.selectedCoordinates()) return false;
    }
    return true;
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep() < this.totalSteps()) {
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
      coordinates: this.requiresPitchPosition() ? (this.selectedCoordinates() || this.originCoordinates()!) : (this.selectedCoordinates() || { x: 0, y: 0 }),
      outcome: this.selectedOutcome,
      period: this.selectedPeriod,
      minute,
      metadata: {
        shotOnTarget: this.shotOnTarget,
        subAction: this.selectedSubAction(),
        subActionData: this.selectedSubAction() ? (SUB_ACTION_TYPES[this.selectedAction()!]?.find(s => s.type === this.selectedSubAction()) ?? null) : null,
        subEvent: this.selectedSubEvent(),
        subEventData: this.selectedSubEvent() ? (SUB_EVENTS[this.selectedAction()!]?.find(se => se.type === this.selectedSubEvent()) ?? null) : null
      }
    };

    if (this.requiresDualPosition() && this.originCoordinates() && this.destinationCoordinates()) {
      eventData.originCoordinates = this.originCoordinates()!;
      eventData.destinationCoordinates = this.destinationCoordinates()!;
      eventData.receiverId = this.selectedReceiver() || undefined;

      eventData.distance = calculateDistance(this.originCoordinates()!, this.destinationCoordinates()!);
      eventData.direction = calculateDirection(this.originCoordinates()!, this.destinationCoordinates()!);
    }

    this.eventService.addEvent(eventData);
    this.reset();
  }

  cancel(): void {
    this.reset();
  }

  private reset(): void {
    this.currentStep.set(1);
    this.selectedAction.set(null);
    this.selectedSubAction.set(null);
    this.selectedSubEvent.set(null);
    this.selectedPlayer.set(null);
    this.selectedCoordinates.set(null);
    this.originCoordinates.set(null);
    this.destinationCoordinates.set(null);
    this.selectedReceiver.set(null);
    this.selectedOutcome = 'successful';
    this.shotOnTarget = false;
  }
}
