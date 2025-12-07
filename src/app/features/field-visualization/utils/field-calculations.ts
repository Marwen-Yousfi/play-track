import { FieldCoordinates } from '../models/player.model';

/**
 * Standard football field dimensions in meters
 */
const FIELD_WIDTH = 105; // meters (length)
const FIELD_HEIGHT = 68; // meters (width)

/**
 * Calculate the distance between two points on the football field
 * @param from Starting coordinates (percentage 0-100)
 * @param to Ending coordinates (percentage 0-100)
 * @returns Distance in meters
 */
export function calculateDistance(from: FieldCoordinates, to: FieldCoordinates): number {
    // Convert percentage coordinates to meters
    const dx = (to.x - from.x) / 100 * FIELD_WIDTH;
    const dy = (to.y - from.y) / 100 * FIELD_HEIGHT;

    // Calculate Euclidean distance
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Round to 1 decimal place
    return Math.round(distance * 10) / 10;
}

/**
 * Calculate the direction/angle between two points
 * @param from Starting coordinates (percentage 0-100)
 * @param to Ending coordinates (percentage 0-100)
 * @returns Direction in degrees (0-360)
 * - 0° = East (right)
 * - 90° = South (down)
 * - 180° = West (left)
 * - 270° = North (up)
 */
export function calculateDirection(from: FieldCoordinates, to: FieldCoordinates): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Calculate angle in radians, then convert to degrees
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Normalize to 0-360 range
    if (angle < 0) {
        angle += 360;
    }

    // Round to nearest degree
    return Math.round(angle);
}

/**
 * Determine pass type based on distance
 * @param distance Distance in meters
 * @returns Pass type classification
 */
export function getPassType(distance: number): 'short' | 'long' | 'through_ball' {
    if (distance < 15) {
        return 'short';
    } else if (distance < 30) {
        return 'long';
    } else {
        return 'through_ball';
    }
}

/**
 * Get compass direction from angle
 * @param degrees Angle in degrees (0-360)
 * @returns Compass direction (N, NE, E, SE, S, SW, W, NW)
 */
export function getCompassDirection(degrees: number): string {
    const directions = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

/**
 * Format distance for display
 * @param distance Distance in meters
 * @returns Formatted string (e.g., "25.5m")
 */
export function formatDistance(distance: number): string {
    return `${distance.toFixed(1)}m`;
}

/**
 * Check if two coordinates are approximately the same
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @param threshold Threshold percentage (default 2%)
 * @returns True if coordinates are within threshold
 */
export function areCoordinatesClose(
    coord1: FieldCoordinates,
    coord2: FieldCoordinates,
    threshold: number = 2
): boolean {
    const dx = Math.abs(coord1.x - coord2.x);
    const dy = Math.abs(coord1.y - coord2.y);
    return dx < threshold && dy < threshold;
}
