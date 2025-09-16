/**
 * Mathematical utility functions for color picker calculations
 */

/**
 * Calculate distance between two points
 */
export const getDistance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

/**
 * Calculate angle between two points
 */
export const getAngle = (x: number, y: number, cx: number, cy: number): number =>
  Math.atan2(y - cy, x - cx);

/**
 * Convert radians to degrees
 */
export const radToDeg = (rad: number): number => ((rad * 180) / Math.PI + 360) % 360;
