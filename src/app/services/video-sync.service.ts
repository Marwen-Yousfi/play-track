import { Injectable, signal } from '@angular/core';

/**
 * Service for synchronizing video playback with event recording
 */
@Injectable({
    providedIn: 'root'
})
export class VideoSyncService {
    // Video state signals
    private videoElementSignal = signal<HTMLVideoElement | null>(null);
    private currentTimeSignal = signal<number>(0);
    private isPlayingSignal = signal<boolean>(false);
    private durationSignal = signal<number>(0);
    private playbackRateSignal = signal<number>(1);

    // Read-only accessors
    readonly currentTime = this.currentTimeSignal.asReadonly();
    readonly isPlaying = this.isPlayingSignal.asReadonly();
    readonly duration = this.durationSignal.asReadonly();
    readonly playbackRate = this.playbackRateSignal.asReadonly();

    /**
     * Register video element for synchronization
     */
    registerVideoElement(videoElement: HTMLVideoElement): void {
        this.videoElementSignal.set(videoElement);
        this.setupEventListeners(videoElement);
        this.durationSignal.set(videoElement.duration || 0);
    }

    /**
     * Play video
     */
    play(): void {
        const video = this.videoElementSignal();
        if (video) {
            video.play();
            this.isPlayingSignal.set(true);
        }
    }

    /**
     * Pause video
     */
    pause(): void {
        const video = this.videoElementSignal();
        if (video) {
            video.pause();
            this.isPlayingSignal.set(false);
        }
    }

    /**
     * Seek to specific time
     */
    seekTo(timeInSeconds: number): void {
        const video = this.videoElementSignal();
        if (video) {
            video.currentTime = timeInSeconds;
            this.currentTimeSignal.set(timeInSeconds);
        }
    }

    /**
     * Skip forward by seconds
     */
    skipForward(seconds: number = 5): void {
        const video = this.videoElementSignal();
        if (video) {
            const newTime = Math.min(video.currentTime + seconds, video.duration);
            this.seekTo(newTime);
        }
    }

    /**
     * Skip backward by seconds
     */
    skipBackward(seconds: number = 5): void {
        const video = this.videoElementSignal();
        if (video) {
            const newTime = Math.max(video.currentTime - seconds, 0);
            this.seekTo(newTime);
        }
    }

    /**
     * Set playback rate
     */
    setPlaybackRate(rate: number): void {
        const video = this.videoElementSignal();
        if (video) {
            video.playbackRate = rate;
            this.playbackRateSignal.set(rate);
        }
    }

    /**
     * Get current timestamp for event recording
     */
    getCurrentTimestamp(): number {
        return this.currentTimeSignal();
    }

    /**
     * Format time as MM:SS
     */
    formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Get match minute from video timestamp
     */
    getMatchMinute(timestamp: number): number {
        // Assuming video starts at minute 0
        return Math.floor(timestamp / 60);
    }

    /**
     * Setup event listeners on video element
     */
    private setupEventListeners(video: HTMLVideoElement): void {
        video.addEventListener('timeupdate', () => {
            this.currentTimeSignal.set(video.currentTime);
        });

        video.addEventListener('play', () => {
            this.isPlayingSignal.set(true);
        });

        video.addEventListener('pause', () => {
            this.isPlayingSignal.set(false);
        });

        video.addEventListener('loadedmetadata', () => {
            this.durationSignal.set(video.duration);
        });

        video.addEventListener('ratechange', () => {
            this.playbackRateSignal.set(video.playbackRate);
        });
    }

    /**
     * Cleanup
     */
    cleanup(): void {
        this.videoElementSignal.set(null);
        this.currentTimeSignal.set(0);
        this.isPlayingSignal.set(false);
        this.durationSignal.set(0);
        this.playbackRateSignal.set(1);
    }
}
