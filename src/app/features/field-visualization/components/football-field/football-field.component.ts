import { Component, Output, EventEmitter, input, signal, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player, FieldCoordinates } from '../../../../core/models/player.model';
import { EventRecordingService } from '../../../../core/services/event-recording.service';
import { FORMATIONS, getFormationList, FormationTemplate } from '../../utils/formations';

/**
 * Arrow interface for displaying event trajectories
 */
export interface EventArrow {
  from: FieldCoordinates;
  to: FieldCoordinates;
  color: string;
  label?: string;
}

/**
 * Football field component with SVG rendering and click handling
 */
@Component({
  selector: 'app-football-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './football-field.component.html',
  styles: [`
    .field-container {
      position: relative;
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }

    .football-field {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .football-field.interactive {
      /* cursor removed - let players show grab cursor */
    }

    .field-bg {
      fill: var(--field-green, #4caf50);
      cursor: crosshair;
    }

    .field-line {
      stroke: white;
      stroke-width: 2;
    }

    .player {
      cursor: grab;
      transition: transform 0.2s ease;
    }

    .player:active {
      cursor: grabbing;
    }

    .player:hover .player-circle {
      filter: brightness(1.2);
      stroke-width: 3;
    }

    .player.dragging {
      opacity: 0.7;
      transition: none; /* Disable transition during drag for smoothness */
    }

    .player-circle.selected {
      stroke-width: 4;
      filter: brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
    }

    .player-number {
      pointer-events: none;
      user-select: none;
    }

    .click-indicator {
      pointer-events: none;
    }

    .coordinates-display {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }

    /* Player Tooltip Styles */
    .player-tooltip {
      position: fixed;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      padding: 12px;
      min-width: 150px;
      pointer-events: none;
      z-index: 1000;
      animation: tooltipFadeIn 0.2s ease;
    }

    @keyframes tooltipFadeIn {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .tooltip-number {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .tooltip-team {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 10px;
      color: white;
    }

    .tooltip-team.home {
      background: var(--home-team, #0d47a1);
    }

    .tooltip-team.away {
      background: var(--away-team, #b71c1c);
    }

    .tooltip-name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .tooltip-position {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class FootballFieldComponent {
  @ViewChild('fieldElement') fieldElement!: ElementRef<HTMLDivElement>;

  // Inputs
  players = input<Player[]>([]);
  interactive = input<boolean>(true);
  showCoordinates = input<boolean>(true);
  selectedPlayer = input<Player | null>(null);
  originPosition = input<FieldCoordinates | null>(null); // Temporary marker for dual-position recording
  arrows = input<EventArrow[]>([]); // Event arrows to display

  // Outputs
  @Output() fieldClick = new EventEmitter<FieldCoordinates>();
  @Output() playerClick = new EventEmitter<Player>();
  @Output() playerMove = new EventEmitter<{ player: Player; position: FieldCoordinates }>();

  // State
  lastClickPosition = signal<FieldCoordinates | null>(null);

  // Field mode
  fieldMode = signal<'record' | 'formation' | 'analysis'>('record');

  // Formation management
  availableFormations = getFormationList();
  selectedFormation = signal<string | null>(null);

  // Tooltip state
  hoveredPlayer = signal<Player | null>(null);
  tooltipPosition = signal<{ x: number; y: number } | null>(null);

  // Drag state
  isDragging = signal<boolean>(false);
  draggedPlayerId = signal<string | null>(null);

  // Constants
  readonly playerRadius = 15;
  readonly fieldWidth = 1030; // SVG units
  readonly fieldHeight = 660; // SVG units

  // Undo/Redo history
  private positionHistory: Array<{ playerId: string; position: FieldCoordinates }> = [];
  private historyIndex = -1;
  private readonly MAX_HISTORY = 20;

  constructor(private eventService: EventRecordingService) { }

  /**
   * Keyboard shortcuts handler
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only handle shortcuts when field is interactive
    if (!this.interactive()) return;

    // Ctrl+Z: Undo
    if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
      return;
    }

    // Ctrl+Y or Ctrl+Shift+Z: Redo
    if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
      event.preventDefault();
      this.redo();
      return;
    }

    // Delete: Remove selected player (if any)
    if (event.key === 'Delete' && this.selectedPlayer()) {
      event.preventDefault();
      this.removeSelectedPlayer();
      return;
    }

    // Escape: Deselect player
    if (event.key === 'Escape' && this.selectedPlayer()) {
      event.preventDefault();
      this.deselectPlayer();
      return;
    }

    // Arrow keys: Fine-tune selected player position
    if (this.selectedPlayer() && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      this.moveSelectedPlayerWithArrows(event.key);
      return;
    }
  }

  /**
   * Handle field click to emit coordinates
   */
  onFieldClick(event: MouseEvent): void {
    if (!this.interactive()) return;

    // Don't process field clicks while dragging or if we just finished dragging
    if (this.isDragging() || this.draggedPlayerId()) {
      return;
    }

    const rect = this.fieldElement.nativeElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Clamp values to 0-100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    const coordinates: FieldCoordinates = { x: clampedX, y: clampedY };
    this.lastClickPosition.set(coordinates);
    this.fieldClick.emit(coordinates);

    // Clear indicator after animation
    setTimeout(() => this.lastClickPosition.set(null), 500);
  }

  onPlayerMouseEnter(event: MouseEvent, player: Player): void {
    if (!this.isDragging()) {
      this.hoveredPlayer.set(player);
      this.updateTooltipPosition(event);
    }
  }

  onPlayerMouseLeave(): void {
    this.hoveredPlayer.set(null);
    this.tooltipPosition.set(null);
  }

  onPlayerMouseMove(event: MouseEvent): void {
    if (this.hoveredPlayer() && !this.isDragging()) {
      this.updateTooltipPosition(event);
    }
  }

  private updateTooltipPosition(event: MouseEvent): void {
    this.tooltipPosition.set({
      x: event.clientX + 15,
      y: event.clientY - 10
    });
  }

  onPlayerMouseDown(event: MouseEvent, player: Player): void {
    if (!this.interactive()) return;

    // Hide tooltip when starting drag
    this.hoveredPlayer.set(null);
    this.tooltipPosition.set(null);

    // Save current position to history before drag starts
    const currentMatch = this.eventService.currentMatch();
    if (currentMatch) {
      const allPlayers = [...currentMatch.homeTeam.players, ...currentMatch.awayTeam.players];
      const currentPlayer = allPlayers.find(p => p.id === player.id);
      if (currentPlayer) {
        this.addToHistory(player.id, { ...currentPlayer.fieldPosition });
      }
    }

    event.stopPropagation();
    event.preventDefault(); // Prevent text selection
    this.isDragging.set(true);
    this.draggedPlayerId.set(player.id);
  }

  onFieldMouseMove(event: MouseEvent): void {
    if (this.isDragging() && this.draggedPlayerId()) {

      event.preventDefault();
      event.stopPropagation();

      const rect = this.fieldElement.nativeElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      // Clamp to 0-100
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));


      this.eventService.updatePlayerPosition(this.draggedPlayerId()!, { x: clampedX, y: clampedY });
    }
  }

  onFieldMouseUp(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
      this.draggedPlayerId.set(null);
    }
  }

  onFieldMouseLeave(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
      this.draggedPlayerId.set(null);
    }
  }

  /**
   * Get SVG marker ID based on arrow color
   */
  getArrowMarker(color: string): string {
    if (color.includes('green') || color === '#4caf50') {
      return 'url(#arrowhead-green)';
    } else if (color.includes('red') || color === '#f44336') {
      return 'url(#arrowhead-red)';
    } else {
      return 'url(#arrowhead-yellow)';
    }
  }

  /**
   * Handle player click
   */
  onPlayerClick(event: MouseEvent, player: Player): void {
    event.stopPropagation();
    if (!this.isDragging()) {
      this.playerClick.emit(player);
    }
  }

  /**
   * Get SVG transform for player position
   */
  getPlayerTransform(player: Player): string {
    // Convert percentage to SVG coordinates
    // Add 10 to account for field border
    const x = 10 + (player.fieldPosition.x / 100) * this.fieldWidth;
    const y = 10 + (player.fieldPosition.y / 100) * this.fieldHeight;
    return `translate(${x}, ${y})`;
  }

  /**
   * Undo last player movement
   */
  private undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const historyItem = this.positionHistory[this.historyIndex];
      this.eventService.updatePlayerPosition(historyItem.playerId, historyItem.position);
    }
  }

  /**
   * Redo player movement
   */
  private redo(): void {
    if (this.historyIndex < this.positionHistory.length - 1) {
      this.historyIndex++;
      const historyItem = this.positionHistory[this.historyIndex];
      this.eventService.updatePlayerPosition(historyItem.playerId, historyItem.position);
    }
  }

  /**
   * Add position to history for undo/redo
   */
  private addToHistory(playerId: string, position: FieldCoordinates): void {
    // Remove any history after current index
    this.positionHistory = this.positionHistory.slice(0, this.historyIndex + 1);

    // Add new position
    this.positionHistory.push({ playerId, position });

    // Limit history size
    if (this.positionHistory.length > this.MAX_HISTORY) {
      this.positionHistory.shift();
    } else {
      this.historyIndex++;
    }
  }

  /**
   * Move selected player with arrow keys
   */
  private moveSelectedPlayerWithArrows(key: string): void {
    const selectedPlayerId = this.selectedPlayer()?.id;
    if (!selectedPlayerId) return;

    // Get current player from match data
    const currentMatch = this.eventService.currentMatch();
    if (!currentMatch) return;

    const allPlayers = [...currentMatch.homeTeam.players, ...currentMatch.awayTeam.players];
    const player = allPlayers.find(p => p.id === selectedPlayerId);
    if (!player) return;

    const step = 1; // 1% movement per key press
    let newX = player.fieldPosition.x;
    let newY = player.fieldPosition.y;

    switch (key) {
      case 'ArrowUp':
        newY = Math.max(0, newY - step);
        break;
      case 'ArrowDown':
        newY = Math.min(100, newY + step);
        break;
      case 'ArrowLeft':
        newX = Math.max(0, newX - step);
        break;
      case 'ArrowRight':
        newX = Math.min(100, newX + step);
        break;
    }

    // Save to history before updating
    this.addToHistory(player.id, { ...player.fieldPosition });

    // Update position
    const newPosition = { x: newX, y: newY };
    this.eventService.updatePlayerPosition(player.id, newPosition);
  }

  /**
   * Remove selected player from field
   */
  private removeSelectedPlayer(): void {
    const player = this.selectedPlayer();
    if (player) {
      // Emit event to parent to handle player removal
      this.playerClick.emit(player); // Parent can decide what to do
    }
  }

  /**
   * Deselect current player
   */
  private deselectPlayer(): void {
    // This would need to be handled by parent component
    // For now, we just emit a null player click
    this.playerClick.emit(null as any);
  }

  /**
   * Switch field mode
   */
  setMode(mode: 'record' | 'formation' | 'analysis'): void {
    this.fieldMode.set(mode);
  }

  /**
   * Apply formation to players
   */
  applyFormation(formationName: string): void {
    const formation = FORMATIONS[formationName];
    if (!formation) return;

    const currentMatch = this.eventService.currentMatch();
    if (!currentMatch) return;

    const homeTeam = currentMatch.homeTeam;

    // Get players by position
    const gk = homeTeam.players.find(p => p.position === 'GK');
    const defenders = homeTeam.players.filter(p => p.position === 'DEF');
    const midfielders = homeTeam.players.filter(p => p.position === 'MID');
    const forwards = homeTeam.players.filter(p => p.position === 'FWD');

    // Apply formation positions
    if (gk) {
      this.eventService.updatePlayerPosition(gk.id, formation.positions.GK);
    }

    defenders.forEach((player, index) => {
      if (index < formation.positions.DEF.length) {
        this.eventService.updatePlayerPosition(player.id, formation.positions.DEF[index]);
      }
    });

    midfielders.forEach((player, index) => {
      if (index < formation.positions.MID.length) {
        this.eventService.updatePlayerPosition(player.id, formation.positions.MID[index]);
      }
    });

    forwards.forEach((player, index) => {
      if (index < formation.positions.FWD.length) {
        this.eventService.updatePlayerPosition(player.id, formation.positions.FWD[index]);
      }
    });

    this.selectedFormation.set(formationName);
  }

  /**
   * Mirror formation (flip horizontally)
   */
  mirrorFormation(): void {
    const currentMatch = this.eventService.currentMatch();
    if (!currentMatch) return;

    const allPlayers = [...currentMatch.homeTeam.players, ...currentMatch.awayTeam.players];

    allPlayers.forEach(player => {
      const newY = 100 - player.fieldPosition.y; // Flip Y coordinate
      this.eventService.updatePlayerPosition(player.id, {
        x: player.fieldPosition.x,
        y: newY
      });
    });
  }

  /**
   * Rotate formation 180 degrees
   */
  rotateFormation(): void {
    const currentMatch = this.eventService.currentMatch();
    if (!currentMatch) return;

    const allPlayers = [...currentMatch.homeTeam.players, ...currentMatch.awayTeam.players];

    allPlayers.forEach(player => {
      const newX = 100 - player.fieldPosition.x; // Flip X
      const newY = 100 - player.fieldPosition.y; // Flip Y
      this.eventService.updatePlayerPosition(player.id, { x: newX, y: newY });
    });
  }
}

