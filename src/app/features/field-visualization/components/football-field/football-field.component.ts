import { Component, ElementRef, ViewChild, input, Output, EventEmitter, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player, FieldCoordinates } from '../../../../core/models/player.model';
import { EventRecordingService } from '../../../../core/services/event-recording.service';
import { FORMATIONS, getFormationList, FormationTemplate } from '../../utils/formations';

interface TacticalZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label?: string;
}

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
    .field-controls{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding:12px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);gap:16px;flex-wrap:wrap}
    .mode-switcher{display:flex;gap:8px;background:#f5f5f5;padding:4px;border-radius:6px}
    .team-formation-group{display:flex;align-items:center;gap:8px}
    .team-label{font-size:14px;font-weight:600;color:#333;white-space:nowrap}
    .mode-btn,.tool-btn,.overlay-btn{padding:8px 12px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;transition:all .2s}
    .mode-btn{padding:8px 16px;background:transparent;border:none;color:#666}
    .mode-btn:hover,.tool-btn:hover,.overlay-btn:hover{background:#f5f5f5;border-color:#2196f3}
    .mode-btn.active{background:#fff;color:#2196f3;box-shadow:0 2px 4px rgba(0,0,0,.1)}
    .overlay-btn.active{background:#2196f3;color:#fff;border-color:#2196f3}
    .formation-select{padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:14px;cursor:pointer;background:#fff;min-width:150px}
    .formation-select:focus{outline:none;border-color:#2196f3}

    .field-container {
      position: relative;
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      /* Fixed height for consistent sizing across all modes */
      height: 600px;
    }

    .football-field {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      /* Maintain aspect ratio */
      object-fit: contain;
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

    .player-number,.click-indicator{pointer-events:none;user-select:none}



    .player-tooltip{position:fixed;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.2);padding:12px;min-width:150px;pointer-events:none;z-index:1000;animation:tooltipFadeIn .2s ease}

    @keyframes tooltipFadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}

    .tooltip-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #e0e0e0}

    .tooltip-number{font-size:18px;font-weight:bold;color:#333}
    .tooltip-team{font-size:11px;font-weight:600;text-transform:uppercase;padding:3px 8px;border-radius:10px;color:#fff}
    .tooltip-team.home{background:var(--home-team,#0d47a1)}
    .tooltip-team.away{background:var(--away-team,#b71c1c)}
    .tooltip-name{font-size:14px;font-weight:600;color:#333;margin-bottom:4px}
    .tooltip-position{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px}

    .coordinates-display{position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,.7);color:#fff;padding:5px 10px;border-radius:4px;font-size:12px;font-family:monospace}
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
  destinationPosition = input<FieldCoordinates | null>(null); // Temporary marker for destination
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

  // Overlay toggles
  showThirds = signal<boolean>(false);
  showChannels = signal<boolean>(false);
  showGrid = signal<boolean>(false);
  gridLines = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // For grid overlay

  // Custom tactical zones
  showCustomZones = signal<boolean>(false);
  isDrawingZone = signal<boolean>(false);
  customZones = signal<TacticalZone[]>([]);
  zoneDrawStart = signal<{ x: number; y: number } | null>(null);
  zoneDrawEnd = signal<{ x: number; y: number } | null>(null);

  // Tooltip state
  hoveredPlayer = signal<Player | null>(null);
  tooltipPosition = signal<{ x: number; y: number } | null>(null);

  // Drag trail state
  dragStartPosition = signal<FieldCoordinates | null>(null);
  dragCurrentPosition = signal<FieldCoordinates | null>(null);

  // Zoom & Pan state
  zoomScale = signal<number>(1);
  panX = signal<number>(0);
  panY = signal<number>(0);
  isPanning = signal<boolean>(false);
  panStartX = 0;
  panStartY = 0;

  // Drag state
  isDragging = signal<boolean>(false);
  draggedPlayerId = signal<string | null>(null);
  dragOffset = signal<{ x: number; y: number } | null>(null); // Offset from player center to cursor

  // Multi-select state
  selectedPlayerIds = signal<Set<string>>(new Set());
  isSelecting = signal<boolean>(false);
  selectionStart = signal<{ x: number; y: number } | null>(null);
  selectionEnd = signal<{ x: number; y: number } | null>(null);

  // Context menu state
  showContextMenu = signal<boolean>(false);
  contextMenuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  contextMenuPlayer = signal<Player | null>(null);

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

    console.log('Field clicked at:', coordinates, 'isDrawingZone:', this.isDrawingZone());

    // Handle zone drawing mode
    if (this.isDrawingZone()) {
      console.log('In zone drawing mode, zoneDrawStart:', this.zoneDrawStart());
      if (!this.zoneDrawStart()) {
        // Start drawing
        console.log('Starting zone draw at:', coordinates);
        this.zoneDrawStart.set({ x: clampedX, y: clampedY });
        this.zoneDrawEnd.set({ x: clampedX, y: clampedY });
      } else {
        // Finish drawing
        console.log('Finishing zone draw at:', coordinates);
        const start = this.zoneDrawStart()!;
        const end = { x: clampedX, y: clampedY };
        const zoneX = Math.min(start.x, end.x);
        const zoneY = Math.min(start.y, end.y);
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);

        if (width > 5 && height > 5) {
          const newZone: TacticalZone = {
            id: `zone-${Date.now()}`,
            name: `Zone ${this.customZones().length + 1}`,
            x: zoneX,
            y: zoneY,
            width,
            height,
            color: this.getRandomZoneColor(),
            label: `Z${this.customZones().length + 1}`
          };
          this.customZones.update(zones => [...zones, newZone]);
          localStorage.setItem('tactical-zones', JSON.stringify(this.customZones()));
        }

        this.zoneDrawStart.set(null);
        this.zoneDrawEnd.set(null);
      }
      return;
    }

    // Only show click indicator if we're in event recording mode (origin or destination position is active)
    if (this.originPosition() !== null || this.destinationPosition() !== null) {
      this.lastClickPosition.set(coordinates);
    }

    this.fieldClick.emit(coordinates);
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

  /**
   * Handle mouse down on field background to start selection box
   */
  onFieldMouseDown(event: MouseEvent): void {
    // Only start selection if clicking on field background (not players)
    const target = event.target as SVGElement;
    if (target.classList.contains('field-bg')) {
      const rect = this.fieldElement.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      this.isSelecting.set(true);
      this.selectionStart.set({ x, y });
      this.selectionEnd.set({ x, y });
      event.preventDefault();
    }
  }

  onPlayerMouseDown(event: MouseEvent, player: Player): void {
    if (!this.interactive()) return;

    // Hide tooltip when starting drag
    this.hoveredPlayer.set(null);
    this.tooltipPosition.set(null);

    // Save current position to history before drag starts
    event.stopPropagation();
    event.preventDefault();

    // Close context menu if open
    this.closeContextMenu();

    if (!this.interactive()) return;

    this.isDragging.set(true);
    this.draggedPlayerId.set(player.id);

    // Calculate offset from player center to cursor position
    const rect = this.fieldElement.nativeElement.getBoundingClientRect();
    const cursorX = ((event.clientX - rect.left) / rect.width) * 100;
    const cursorY = ((event.clientY - rect.top) / rect.height) * 100;

    const offsetX = cursorX - player.fieldPosition.x;
    const offsetY = cursorY - player.fieldPosition.y;

    // Store the offset between cursor and player center
    this.dragOffset.set({
      x: offsetX,
      y: offsetY
    });
  }

  onFieldMouseMove(event: MouseEvent): void {
    // Handle selection box drawing
    if (this.isSelecting() && this.selectionStart()) {
      const rect = this.fieldElement.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.selectionEnd.set({ x, y });
      return;
    }

    // Handle zone drawing
    if (this.isDrawingZone() && this.zoneDrawStart()) {
      const rect = this.fieldElement.nativeElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      this.zoneDrawEnd.set({ x, y });
      return;
    }

    if (this.isDragging() && this.draggedPlayerId()) {

      event.preventDefault();
      event.stopPropagation();

      const rect = this.fieldElement.nativeElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      // Apply drag offset to get accurate player position
      const offset = this.dragOffset();
      const clampedX = Math.max(0, Math.min(100, offset ? x - offset.x : x));
      const clampedY = Math.max(0, Math.min(100, offset ? y - offset.y : y));

      this.eventService.updatePlayerPosition(this.draggedPlayerId()!, { x: clampedX, y: clampedY });
    }
  }

  onFieldMouseUp(): void {
    // Complete selection box
    if (this.isSelecting() && this.selectionStart() && this.selectionEnd()) {
      this.completeSelection();
      this.isSelecting.set(false);
      this.selectionStart.set(null);
      this.selectionEnd.set(null);
      return;
    }

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
   * Apply formation to specific team
   */
  applyFormationToTeam(formationName: string, team: 'home' | 'away'): void {
    if (!formationName) return;

    const formation = FORMATIONS[formationName];
    if (!formation) return;

    const currentMatch = this.eventService.currentMatch();
    if (!currentMatch) return;

    const targetTeam = team === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam;

    // Get players by position category
    const gk = targetTeam.players.find(p => p.position === 'GK');
    const defenders = targetTeam.players.filter(p => ['CB', 'LB', 'RB'].includes(p.position));
    const midfielders = targetTeam.players.filter(p => ['CDM', 'CM', 'CAM', 'LW', 'RW'].includes(p.position));
    const forwards = targetTeam.players.filter(p => p.position === 'ST');

    // Helper function to mirror position for away team
    const getPosition = (pos: { x: number; y: number }) => {
      if (team === 'away') {
        // Mirror X coordinate for away team (opposite side)
        return { x: 100 - pos.x, y: pos.y };
      }
      return pos;
    };

    // Apply formation positions
    if (gk) {
      this.eventService.updatePlayerPosition(gk.id, getPosition(formation.positions.GK));
    }

    defenders.forEach((player, index) => {
      if (index < formation.positions.DEF.length) {
        this.eventService.updatePlayerPosition(player.id, getPosition(formation.positions.DEF[index]));
      }
    });

    midfielders.forEach((player, index) => {
      if (index < formation.positions.MID.length) {
        this.eventService.updatePlayerPosition(player.id, getPosition(formation.positions.MID[index]));
      }
    });

    forwards.forEach((player, index) => {
      if (index < formation.positions.FWD.length) {
        this.eventService.updatePlayerPosition(player.id, getPosition(formation.positions.FWD[index]));
      }
    });
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
    const defenders = homeTeam.players.filter(p => ['CB', 'LB', 'RB'].includes(p.position));
    const midfielders = homeTeam.players.filter(p => ['CDM', 'CM', 'CAM', 'LW', 'RW'].includes(p.position));
    const forwards = homeTeam.players.filter(p => p.position === 'ST');

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
   * Save current player positions as custom formation
   */
  saveCustomFormation(): void {
    const currentMatch = this.eventService.currentMatch();
    if (!currentMatch) return;

    const formationName = prompt('Enter a name for this custom formation:');
    if (!formationName || formationName.trim() === '') return;

    const homeTeam = currentMatch.homeTeam;

    // Get players by position category
    const gk = homeTeam.players.find(p => p.position === 'GK');
    const defenders = homeTeam.players.filter(p => ['CB', 'LB', 'RB'].includes(p.position));
    const midfielders = homeTeam.players.filter(p => ['CDM', 'CM', 'CAM', 'LW', 'RW'].includes(p.position));
    const forwards = homeTeam.players.filter(p => p.position === 'ST');

    // Create formation object
    const customFormation = {
      name: formationName.trim(),
      description: 'Custom formation',
      positions: {
        GK: gk ? { ...gk.fieldPosition } : { x: 10, y: 50 },
        DEF: defenders.map(p => ({ ...p.fieldPosition })),
        MID: midfielders.map(p => ({ ...p.fieldPosition })),
        FWD: forwards.map(p => ({ ...p.fieldPosition }))
      }
    };

    // Add to available formations
    FORMATIONS[formationName.trim()] = customFormation;
    this.availableFormations = getFormationList();
    this.selectedFormation.set(formationName.trim());

    alert(`Custom formation "${formationName}" saved successfully!`);
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

  /**
   * Set kickoff positions - home team on left, away team on right
   */
  setKickoffPositions(): void {
    const currentMatch = this.eventService.currentMatch();
    if (!currentMatch) return;

    // Home team positions (left side - attacking right)
    const homePositions = [
      { x: 15, y: 50 },  // GK
      { x: 25, y: 20 },  // LB
      { x: 25, y: 40 },  // CB
      { x: 25, y: 60 },  // CB
      { x: 25, y: 80 },  // RB
      { x: 35, y: 30 },  // LM
      { x: 35, y: 50 },  // CM
      { x: 35, y: 70 },  // RM
      { x: 45, y: 35 },  // LW
      { x: 48, y: 50 },  // ST (at center circle)
      { x: 45, y: 65 }   // RW
    ];

    // Away team positions (right side - attacking left)
    const awayPositions = [
      { x: 85, y: 50 },  // GK
      { x: 75, y: 20 },  // LB
      { x: 75, y: 40 },  // CB
      { x: 75, y: 60 },  // CB
      { x: 75, y: 80 },  // RB
      { x: 65, y: 30 },  // LM
      { x: 65, y: 50 },  // CM
      { x: 65, y: 70 },  // RM
      { x: 55, y: 35 },  // LW
      { x: 52, y: 50 },  // ST (at center circle)
      { x: 55, y: 65 }   // RW
    ];

    // Position home team
    currentMatch.homeTeam.players.forEach((player: Player, index: number) => {
      if (index < homePositions.length) {
        this.eventService.updatePlayerPosition(player.id, homePositions[index]);
      }
    });

    // Position away team
    currentMatch.awayTeam.players.forEach((player: Player, index: number) => {
      if (index < awayPositions.length) {
        this.eventService.updatePlayerPosition(player.id, awayPositions[index]);
      }
    });
  }

  ngOnInit(): void {
    // Load saved custom zones from localStorage
    this.loadZonesFromLocalStorage();
  }

  loadZonesFromLocalStorage(): void {
    const saved = localStorage.getItem('tactical-zones');
    if (saved) {
      try {
        const zones = JSON.parse(saved);
        this.customZones.set(zones);
        console.log('Loaded zones from localStorage:', zones);
      } catch (e) {
        console.error('Failed to load zones:', e);
      }
    }
  }

  /**
   * Toggle overlay visibility
   */
  toggleThirds(): void {
    this.showThirds.update(v => !v);
  }

  toggleChannels(): void {
    this.showChannels.update(v => !v);
  }

  toggleGrid(): void {
    this.showGrid.update(v => !v);
    console.log('Grid toggled:', this.showGrid());
  }

  /**
   * Zoom & Pan controls
   */
  zoomIn(): void {
    const newScale = Math.min(this.zoomScale() * 1.2, 3); // Max 3x zoom
    this.zoomScale.set(newScale);
  }

  zoomOut(): void {
    const newScale = Math.max(this.zoomScale() / 1.2, 0.5); // Min 0.5x zoom
    this.zoomScale.set(newScale);
  }

  resetView(): void {
    this.zoomScale.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, this.zoomScale() * delta));
    this.zoomScale.set(newScale);
  }

  onSvgMouseDown(event: MouseEvent): void {
    // Only pan if clicking on background (not on players)
    if ((event.target as SVGElement).classList.contains('field-bg')) {
      this.isPanning.set(true);
      this.panStartX = event.clientX - this.panX();
      this.panStartY = event.clientY - this.panY();
      event.preventDefault();
    }
  }

  getTransform(): string {
    return `translate(${this.panX()}, ${this.panY()}) scale(${this.zoomScale()})`;
  }

  /**
   * Multi-select functionality
   */
  completeSelection(): void {
    const start = this.selectionStart();
    const end = this.selectionEnd();
    if (!start || !end) return;

    const rect = this.fieldElement.nativeElement.getBoundingClientRect();
    const minX = Math.min(start.x, end.x) / rect.width * 100;
    const maxX = Math.max(start.x, end.x) / rect.width * 100;
    const minY = Math.min(start.y, end.y) / rect.height * 100;
    const maxY = Math.max(start.y, end.y) / rect.height * 100;

    const currentMatch = this.eventService.currentMatch();
    if (!currentMatch) return;

    const allPlayers = [...currentMatch.homeTeam.players, ...currentMatch.awayTeam.players];
    const selectedIds = new Set<string>();

    allPlayers.forEach(player => {
      const pos = player.fieldPosition;
      if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
        selectedIds.add(player.id);
      }
    });

    this.selectedPlayerIds.set(selectedIds);
  }

  clearSelection(): void {
    this.selectedPlayerIds.set(new Set());
  }

  getSelectionBox(): { x: number; y: number; width: number; height: number } | null {
    const start = this.selectionStart();
    const end = this.selectionEnd();
    if (!start || !end) return null;

    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    };
  }

  /**
   * Player context menu
   */
  onPlayerContextMenu(event: MouseEvent, player: Player): void {
    event.preventDefault();
    event.stopPropagation();

    this.contextMenuPlayer.set(player);
    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
    this.showContextMenu.set(true);

    // Close menu on next click anywhere
    setTimeout(() => {
      document.addEventListener('click', () => this.closeContextMenu(), { once: true });
    }, 0);
  }

  closeContextMenu(): void {
    this.showContextMenu.set(false);
    this.contextMenuPlayer.set(null);
  }

  editPlayerDetails(): void {
    console.log('Edit player:', this.contextMenuPlayer());
    // Emit event to parent for editing
    this.closeContextMenu();
  }

  swapPlayer(): void {
    console.log('Swap player:', this.contextMenuPlayer());
    // Emit event to parent for swapping
    this.closeContextMenu();
  }

  removeFromField(): void {
    console.log('Remove player:', this.contextMenuPlayer());
    // Emit event to parent for removal
    this.closeContextMenu();
  }

  viewPlayerStats(): void {
    console.log('View stats for:', this.contextMenuPlayer());
    // Emit event to parent to show stats
    this.closeContextMenu();
  }

  recordPlayerAction(): void {
    console.log('Record action for:', this.contextMenuPlayer());
    // Emit event to parent to start recording
    this.closeContextMenu();
  }

  // ==================== Custom Tactical Zones ====================

  toggleCustomZones(): void {
    console.log('Toggle custom zones clicked, current state:', this.showCustomZones());
    this.showCustomZones.update(v => !v);
    console.log('New state:', this.showCustomZones());
  }

  toggleZoneDrawing(): void {
    console.log('Toggle zone drawing clicked, current state:', this.isDrawingZone());
    this.isDrawingZone.update(v => !v);
    console.log('New state:', this.isDrawingZone());
    if (!this.isDrawingZone()) {
      this.zoneDrawStart.set(null);
      this.zoneDrawEnd.set(null);
    }
  }

  deleteZone(zoneId: string): void {
    this.customZones.update(zones => zones.filter(z => z.id !== zoneId));
    localStorage.setItem('tactical-zones', JSON.stringify(this.customZones()));
  }

  getRandomZoneColor(): string {
    const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#00bcd4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getZoneDrawingRect(): { x: number; y: number; width: number; height: number } | null {
    if (!this.zoneDrawStart() || !this.zoneDrawEnd()) return null;
    const start = this.zoneDrawStart()!;
    const end = this.zoneDrawEnd()!;
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    };
  }
}

