import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Match } from '../../models/match.model';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-match-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Match Setup</h2>
          <button class="btn-close" (click)="onCancel()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="teams-container">
            <!-- Home Team -->
            <div class="team-section home">
              <h3>Home Team</h3>
              <div class="form-group">
                <label>Team Name</label>
                <input type="text" [(ngModel)]="homeTeamName" class="form-control">
              </div>
              
              <div class="players-list">
                <h4>Players</h4>
                @for (player of homePlayers; track $index) {
                  <div class="player-row">
                    <input type="number" [(ngModel)]="player.jerseyNumber" class="form-control number" placeholder="#">
                    <input type="text" [(ngModel)]="player.name" class="form-control name" placeholder="Player Name">
                    <button class="btn-icon delete" (click)="removeHomePlayer($index)" title="Remove">×</button>
                  </div>
                }
                <button class="btn btn-sm btn-outline" (click)="addHomePlayer()">+ Add Player</button>
              </div>
            </div>

            <!-- Away Team -->
            <div class="team-section away">
              <h3>Away Team</h3>
              <div class="form-group">
                <label>Team Name</label>
                <input type="text" [(ngModel)]="awayTeamName" class="form-control">
              </div>
              
              <div class="players-list">
                <h4>Players</h4>
                @for (player of awayPlayers; track $index) {
                  <div class="player-row">
                    <input type="number" [(ngModel)]="player.jerseyNumber" class="form-control number" placeholder="#">
                    <input type="text" [(ngModel)]="player.name" class="form-control name" placeholder="Player Name">
                    <button class="btn-icon delete" (click)="removeAwayPlayer($index)" title="Remove">×</button>
                  </div>
                }
                <button class="btn btn-sm btn-outline" (click)="addAwayPlayer()">+ Add Player</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button class="btn btn-primary" (click)="onSave()">Save Changes</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: #1e1e1e;
      border-radius: 8px;
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: white;
    }

    .btn-close {
      background: none;
      border: none;
      color: #999;
      font-size: 24px;
      cursor: pointer;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .teams-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .team-section h3 {
      margin-top: 0;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid;
    }

    .team-section.home h3 { border-color: var(--home-team, #0d47a1); color: var(--home-team, #0d47a1); }
    .team-section.away h3 { border-color: var(--away-team, #b71c1c); color: var(--away-team, #b71c1c); }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #ccc;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      background: #2d2d2d;
      border: 1px solid #444;
      border-radius: 4px;
      color: white;
    }

    .players-list {
      background: #252525;
      padding: 16px;
      border-radius: 8px;
    }

    .players-list h4 {
      margin-top: 0;
      margin-bottom: 12px;
      color: #ccc;
    }

    .player-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      align-items: center;
    }

    .form-control.number {
      width: 60px;
    }

    .form-control.name {
      flex: 1;
    }

    .btn-icon.delete {
      color: #ff4444;
      font-size: 20px;
      padding: 0 8px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #333;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary {
      background: var(--primary-color, #2196f3);
      color: white;
    }

    .btn-secondary {
      background: #444;
      color: white;
    }

    .btn-outline {
      background: transparent;
      border: 1px dashed #666;
      color: #ccc;
      width: 100%;
      margin-top: 8px;
    }

    .btn-outline:hover {
      border-color: #999;
      color: white;
    }
  `]
})
export class MatchSetupComponent {
  match = input.required<Match>();
  @Output() save = new EventEmitter<Partial<Match>>();
  @Output() cancel = new EventEmitter<void>();

  homeTeamName = '';
  awayTeamName = '';
  homePlayers: Player[] = [];
  awayPlayers: Player[] = [];

  ngOnInit() {
    const m = this.match();
    this.homeTeamName = m.homeTeam.name;
    this.awayTeamName = m.awayTeam.name;
    // Clone players to avoid direct mutation
    this.homePlayers = JSON.parse(JSON.stringify(m.homeTeam.players));
    this.awayPlayers = JSON.parse(JSON.stringify(m.awayTeam.players));
  }

  addHomePlayer() {
    this.homePlayers.push({
      id: crypto.randomUUID(),
      name: '',
      jerseyNumber: 0,
      team: 'home',
      position: 'CM',
      fieldPosition: { x: 50, y: 50 }
    });
  }

  addAwayPlayer() {
    this.awayPlayers.push({
      id: crypto.randomUUID(),
      name: '',
      jerseyNumber: 0,
      team: 'away',
      position: 'CM',
      fieldPosition: { x: 50, y: 50 }
    });
  }

  removeHomePlayer(index: number) {
    this.homePlayers.splice(index, 1);
  }

  removeAwayPlayer(index: number) {
    this.awayPlayers.splice(index, 1);
  }

  onSave() {
    const updatedMatch: Partial<Match> = {
      homeTeam: {
        ...this.match().homeTeam,
        name: this.homeTeamName,
        players: this.homePlayers
      },
      awayTeam: {
        ...this.match().awayTeam,
        name: this.awayTeamName,
        players: this.awayPlayers
      }
    };
    this.save.emit(updatedMatch);
  }

  onCancel() {
    this.cancel.emit();
  }
}
