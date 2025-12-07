import { Component, Output, EventEmitter, input, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player, FieldCoordinates } from '../../../../core/models/player.model';
import { EventRecordingService } from '../../../../core/services/event-recording.service';

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

  // Drag state
  isDragging = signal<boolean>(false);
  draggedPlayerId = signal<string | null>(null);

  // Constants
  readonly playerRadius = 15;
  readonly fieldWidth = 1030; // SVG units
  readonly fieldHeight = 660; // SVG units

  constructor(private eventService: EventRecordingService) { }

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

  onPlayerMouseDown(event: MouseEvent, player: Player): void {
    if (!this.interactive()) return;


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
}
