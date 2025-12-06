import { Component, OnInit, ViewChild, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { FootballFieldComponent, EventArrow } from './components/football-field/football-field.component';
import { ActionRecorderComponent } from './components/action-recorder/action-recorder.component';
import { EventTimelineComponent } from './components/event-timeline/event-timeline.component';
import { MatchSetupComponent } from './components/match-setup/match-setup.component';
import { EventRecordingService } from './services/event-recording.service';
import { StatisticsService } from './services/statistics.service';
import { ValidationService } from './services/validation.service';
import { Match, Team } from './models/match.model';
import { Player, FieldCoordinates } from './models/player.model';
import { MatchStatistics } from './models/statistics.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    VideoPlayerComponent,
    FootballFieldComponent,
    ActionRecorderComponent,
    EventTimelineComponent,
    MatchSetupComponent
  ],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="logo">
          <span class="icon">⚽</span>
          <h1>PlayTrack</h1>
        </div>
        
        <div class="header-actions">
          @if (eventService.currentMatch()) {
            <div class="match-info">
              <span class="teams">
                {{ eventService.currentMatch()!.homeTeam.name }} vs {{ eventService.currentMatch()!.awayTeam.name }}
              </span>
              <button class="btn btn-sm btn-outline" (click)="showSetup.set(true)">⚙️ Setup</button>
            </div>
            
            <div class="actions">
              <button class="btn btn-success" (click)="toggleRecording()">
                {{ eventService.isRecording() ? '⏸ Pause' : '▶ Record' }}
              </button>
              <button class="btn btn-secondary" (click)="computeStatistics()">
                📊 Stats
              </button>
              <button class="btn btn-secondary" (click)="exportData()">
                💾 Export
              </button>
            </div>
          } @else {
            <button class="btn btn-primary" (click)="initializeMatch()">
              🎬 Initialize Match
            </button>
          }
        </div>
      </header>

      @if (eventService.currentMatch()) {
        <div class="main-content">
          <!-- Left Panel: Video + Field -->
          <div class="left-panel">
            <!-- Video Player -->
            <div class="video-section">
              <app-video-player [videoUrl]="videoUrl()"></app-video-player>
            </div>

            <!-- Football Field -->
            <div class="field-section">
              <app-football-field
                [players]="allPlayers()"
                [interactive]="true"
                [selectedPlayer]="selectedPlayer()"
                [originPosition]="actionRecorder?.originCoordinates() || null"
                [arrows]="eventArrows()"
                (fieldClick)="onFieldClick($event)"
                (playerClick)="onPlayerClick($event)">
              </app-football-field>
            </div>
          </div>

          <!-- Right Panel: Action Recorder + Timeline -->
          <div class="right-panel">
            <!-- Action Recorder -->
            <div class="recorder-section">
              <app-action-recorder #actionRecorder></app-action-recorder>
            </div>

            <!-- Event Timeline -->
            <div class="timeline-section">
              <app-event-timeline [events]="eventService.events()"></app-event-timeline>
            </div>
          </div>
        </div>

        <!-- Statistics Modal -->
        @if (showStatistics()) {
          <div class="modal-overlay" (click)="showStatistics.set(false)">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Match Statistics</h2>
                <button class="btn-icon" (click)="showStatistics.set(false)">✕</button>
              </div>
              <div class="modal-body">
                @if (statistics()) {
                  <div class="stats-grid">
                    <div class="team-stats">
                      <h3>{{ eventService.currentMatch()!.homeTeam.name }}</h3>
                      <div class="stat-row">
                        <span>Possession</span>
                        <strong>{{ statistics()!.homeTeam.possession.toFixed(1) }}%</strong>
                      </div>
                      <div class="stat-row">
                        <span>Shots</span>
                        <strong>{{ statistics()!.homeTeam.shots }}</strong>
                      </div>
                      <div class="stat-row">
                        <span>Shots on Target</span>
                        <strong>{{ statistics()!.homeTeam.shotsOnTarget }}</strong>
                      </div>
                      <div class="stat-row">
                        <span>Pass Accuracy</span>
                        <strong>{{ statistics()!.homeTeam.passAccuracy.toFixed(1) }}%</strong>
                      </div>
                      <div class="stat-row">
                        <span>Tackles</span>
                        <strong>{{ statistics()!.homeTeam.tackles }}</strong>
                      </div>
                      <div class="stat-row">
                        <span>Fouls</span>
                        <strong>{{ statistics()!.homeTeam.fouls }}</strong>
                      </div>
                    </div>

                    <div class="team-stats">
                      <h3>{{ eventService.currentMatch()!.awayTeam.name }}</h3>
                      <div class="stat-row">
                        <span>Possession</span>
                        <strong>{{ statistics()!.awayTeam.possession.toFixed(1) }}%</strong>
                      </div>
                      <div class="stat-row">
                        <span>Shots</span>
                        <strong>{{ statistics()!.awayTeam.shots }}</strong>
                      </div>
                      <div class="stat-row">
                        <span>Shots on Target</span>
                        <strong>{{ statistics()!.awayTeam.shotsOnTarget }}</strong>
                      </div>
                      <div class="stat-row">
                        <span>Pass Accuracy</span>
                        <strong>{{ statistics()!.awayTeam.passAccuracy.toFixed(1) }}%</strong>
                      </div>
                      <div class="stat-row">
                        <span>Tackles</span>
                        <strong>{{ statistics()!.awayTeam.tackles }}</strong>
                      </div>
                      <div class="stat-row">
                        <span>Fouls</span>
                        <strong>{{ statistics()!.awayTeam.fouls }}</strong>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Match Setup Modal -->
        @if (showSetup()) {
          <app-match-setup
            [match]="eventService.currentMatch()!"
            (save)="onMatchUpdate($event)"
            (cancel)="showSetup.set(false)">
          </app-match-setup>
        }

      } @else {
        <div class="welcome-screen">
          <h2>Welcome to PlayTrack</h2>
          <p>Professional football match action recording system</p>
          <button class="btn btn-primary btn-lg" (click)="initializeMatch()">
            🎬 Initialize Match
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: var(--bg-secondary);
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: white;
      padding: 0 24px;
      height: 64px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo h1 {
      margin: 0;
      font-size: 24px;
      color: var(--text-primary);
    }

    .logo .icon {
      font-size: 24px;
    }

    .header-actions {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .match-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-right: 24px;
      border-right: 1px solid #eee;
    }

    .teams {
      font-weight: 600;
      font-size: 16px;
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .main-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 0;
      overflow: hidden;
    }

    .left-panel {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: #000;
    }

    .video-section {
      background: #000;
      display: flex;
      justify-content: center;
      min-height: 400px;
    }

    .field-section {
      padding: 20px;
      background: #1a1a1a;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .right-panel {
      display: flex;
      flex-direction: column;
      background: #1e1e1e;
      border-left: 1px solid #333;
    }

    .recorder-section {
      padding: 16px;
      border-bottom: 1px solid #333;
      background: #2d2d2d;
      order: 1;
    }

    .timeline-section {
      flex: 1;
      overflow-y: auto;
      order: 2;
    }

    .welcome-screen {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .welcome-screen h2 {
      font-size: 32px;
      margin-bottom: 16px;
    }

    .welcome-screen p {
      font-size: 18px;
      color: var(--text-secondary);
      margin-bottom: 32px;
    }

    .btn-lg {
      padding: 16px 32px;
      font-size: 18px;
    }

    .btn-sm {
      padding: 4px 12px;
      font-size: 14px;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid #ddd;
      color: #666;
    }
    
    .btn-outline:hover {
      border-color: #999;
      color: #333;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
    }

    .modal-body {
      padding: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .team-stats h3 {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--primary-color);
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .stat-row:last-child {
      border-bottom: none;
    }

    @media (max-width: 1200px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      
      .right-panel {
        height: 500px;
        border-left: none;
        border-top: 1px solid #333;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild('actionRecorder') actionRecorder?: ActionRecorderComponent;

  videoUrl = signal<string>('');
  selectedPlayer = signal<Player | null>(null);
  showStatistics = signal<boolean>(false);
  showSetup = signal<boolean>(false);
  statistics = signal<MatchStatistics | null>(null);

  allPlayers = signal<Player[]>([]);

  // Computed: Convert recorded events to arrows for visualization
  eventArrows = computed<EventArrow[]>(() => {
    const events = this.eventService.events();
    return events
      .filter(event => event.originCoordinates && event.destinationCoordinates)
      .map(event => ({
        from: event.originCoordinates!,
        to: event.destinationCoordinates!,
        color: event.outcome === 'successful' ? '#4caf50' :
          event.outcome === 'unsuccessful' ? '#f44336' : '#ffc107',
        label: event.eventType
      }));
  });

  constructor(
    public eventService: EventRecordingService,
    private statsService: StatisticsService,
    private validationService: ValidationService
  ) {
    // Update allPlayers when match changes
    effect(() => {
      const match = this.eventService.currentMatch();
      if (match) {
        const players = [...match.homeTeam.players, ...match.awayTeam.players];
        this.allPlayers.set(players);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // Initialize with demo match
    // this.initializeMatch();
  }

  initializeMatch(): void {
    const demoMatch = this.createDemoMatch();
    this.eventService.initializeMatch(demoMatch);
    this.updatePlayersList();
  }

  toggleRecording(): void {
    if (this.eventService.isRecording()) {
      this.eventService.stopRecording();
    } else {
      this.eventService.startRecording();
    }
  }

  onFieldClick(coordinates: FieldCoordinates): void {
    if (this.actionRecorder) {
      this.actionRecorder.setCoordinates(coordinates);
    }
  }

  onPlayerClick(player: Player): void {
    this.selectedPlayer.set(player);
  }

  onMatchUpdate(updatedMatch: Partial<Match>) {
    if (this.eventService.currentMatch()) {
      const newMatch = { ...this.eventService.currentMatch()!, ...updatedMatch };
      this.eventService.updateMatch(newMatch);
      this.updatePlayersList();
      this.showSetup.set(false);
    }
  }

  computeStatistics(): void {
    const match = this.eventService.currentMatch();
    if (match) {
      const stats = this.statsService.computeMatchStatistics(match, this.eventService.events());
      this.statistics.set(stats);
      this.showStatistics.set(true);
    }
  }

  exportData(): void {
    const jsonData = this.eventService.exportEvents();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private updatePlayersList(): void {
    const match = this.eventService.currentMatch();
    if (match) {
      const players = [...match.homeTeam.players, ...match.awayTeam.players];
      this.allPlayers.set(players);
    }
  }

  private createDemoMatch(): Match {
    const homeTeam: Team = {
      id: 'team-home',
      name: 'Home Team',
      formation: '4-3-3',
      players: this.createDemoPlayers('home')
    };

    const awayTeam: Team = {
      id: 'team-away',
      name: 'Away Team',
      formation: '4-4-2',
      players: this.createDemoPlayers('away')
    };

    return {
      id: 'match-' + Date.now(),
      homeTeam,
      awayTeam,
      date: new Date(),
      venue: 'Demo Stadium',
      competition: 'Demo League',
      duration: 5400, // 90 minutes
      status: 'first_half',
      currentTimestamp: 0
    };
  }

  private createDemoPlayers(team: 'home' | 'away'): Player[] {
    const positions: Array<{ position: any; x: number; y: number }> = team === 'home' ? [
      { position: 'GK', x: 10, y: 50 },
      { position: 'CB', x: 25, y: 30 },
      { position: 'CB', x: 25, y: 70 },
      { position: 'LB', x: 25, y: 10 },
      { position: 'RB', x: 25, y: 90 },
      { position: 'CDM', x: 40, y: 50 },
      { position: 'CM', x: 50, y: 35 },
      { position: 'CM', x: 50, y: 65 },
      { position: 'LW', x: 70, y: 20 },
      { position: 'RW', x: 70, y: 80 },
      { position: 'ST', x: 80, y: 50 }
    ] : [
      { position: 'GK', x: 90, y: 50 },
      { position: 'CB', x: 75, y: 30 },
      { position: 'CB', x: 75, y: 70 },
      { position: 'LB', x: 75, y: 10 },
      { position: 'RB', x: 75, y: 90 },
      { position: 'CDM', x: 60, y: 50 },
      { position: 'CM', x: 50, y: 35 },
      { position: 'CM', x: 50, y: 65 },
      { position: 'LW', x: 30, y: 20 },
      { position: 'RW', x: 30, y: 80 },
      { position: 'ST', x: 20, y: 50 }
    ];

    return positions.map((pos, index) => ({
      id: `${team}-player-${index + 1}`,
      name: `Player ${index + 1}`,
      jerseyNumber: index + 1,
      team,
      position: pos.position,
      fieldPosition: { x: pos.x, y: pos.y }
    }));
  }
}
