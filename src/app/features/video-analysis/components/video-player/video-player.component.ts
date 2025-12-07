import { Component, OnInit, OnDestroy, ViewChild, ElementRef, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoSyncService } from '../../../../core/services/video-sync.service';

/**
 * Video player component with timeline and controls
 */
@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-player-container">
      <div class="video-wrapper">
        <video 
          #videoElement
          class="video-element"
          [src]="videoUrl()"
          (loadedmetadata)="onVideoLoaded()">
          Your browser does not support the video tag.
        </video>
        
        @if (!hasVideoSource()) {
          <div class="video-placeholder">
            <div class="placeholder-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M23 7l-7 5 7 5V7z"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <p>No video loaded</p>
              <label class="btn btn-primary upload-btn">
                <input type="file" accept="video/*" (change)="onFileSelected($event)" hidden>
                Upload Video
              </label>
            </div>
          </div>
        }
      </div>
      
      <div class="controls-container">
        <!-- Playback controls -->
        <div class="controls-row">
          <button class="btn btn-icon" (click)="skipBackward()" title="Skip backward 5s">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>
          
          <button class="btn btn-icon btn-primary" (click)="togglePlay()" title="Play/Pause">
            @if (videoSync.isPlaying()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            }
          </button>
          
          <button class="btn btn-icon" (click)="skipForward()" title="Skip forward 5s">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
            </svg>
          </button>
          
          <div class="time-display">
            {{ videoSync.formatTime(videoSync.currentTime()) }} / 
            {{ videoSync.formatTime(videoSync.duration()) }}
          </div>
          
          <div class="spacer"></div>
          
          <select class="playback-rate" (change)="onPlaybackRateChange($event)" [value]="videoSync.playbackRate()">
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
        
        <!-- Timeline -->
        <div class="timeline-container">
          <input 
            type="range" 
            class="timeline"
            min="0"
            [max]="videoSync.duration()"
            [value]="videoSync.currentTime()"
            (input)="onTimelineChange($event)"
            step="0.1">
        </div>
      </div>
    </div>
  `,

  styles: [`
    .video-player-container {
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .video-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
    }

    .video-element {
      width: 100%;
      height: 100%;
      display: block;
    }

    .video-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }

    .placeholder-content {
      text-align: center;
      color: #999;
    }

    .placeholder-content svg {
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .placeholder-content p {
      margin-bottom: 16px;
      font-size: 16px;
    }

    .upload-btn {
      cursor: pointer;
    }

    .controls-container {
      background: #1a1a1a;
      padding: 12px 16px;
    }

    .controls-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .btn-icon {
      background: transparent;
      color: white;
      border-radius: 50%;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-icon.btn-primary {
      background: var(--primary-color);
    }

    .btn-icon.btn-primary:hover {
      background: var(--primary-dark);
    }

    .time-display {
      color: white;
      font-size: 14px;
      font-family: monospace;
      min-width: 120px;
    }

    .spacer {
      flex: 1;
    }

    .playback-rate {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 14px;
      cursor: pointer;
    }

    .playback-rate:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .timeline-container {
      width: 100%;
    }

    .timeline {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      outline: none;
      cursor: pointer;
    }

    .timeline::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: var(--primary-color);
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .timeline::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    .timeline::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: var(--primary-color);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .timeline::-moz-range-thumb:hover {
      transform: scale(1.2);
    }
  `]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;

  videoUrl = input<string>('');

  // Internal state
  videoFileSignal = signal<File | null>(null);
  hasVideoSource = signal<boolean>(false);

  constructor(public videoSync: VideoSyncService) {
    // Update hasVideoSource when videoUrl changes
    effect(() => {
      if (this.videoUrl()) {
        this.hasVideoSource.set(true);
      }
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.videoSync.cleanup();
  }

  onVideoLoaded(): void {
    if (this.videoElementRef) {
      this.videoSync.registerVideoElement(this.videoElementRef.nativeElement);
    }
  }

  togglePlay(): void {
    if (this.videoSync.isPlaying()) {
      this.videoSync.pause();
    } else {
      this.videoSync.play();
    }
  }

  skipForward(): void {
    this.videoSync.skipForward(5);
  }

  skipBackward(): void {
    this.videoSync.skipBackward(5);
  }

  onTimelineChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoSync.seekTo(parseFloat(input.value));
  }

  onPlaybackRateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.videoSync.setPlaybackRate(parseFloat(select.value));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.videoFileSignal.set(file);
      this.hasVideoSource.set(true);

      // Create object URL for video
      const url = URL.createObjectURL(file);

      // Update video source
      if (this.videoElementRef) {
        this.videoElementRef.nativeElement.src = url;
        this.videoElementRef.nativeElement.load(); // Ensure video loads
      }
    }
  }
}
