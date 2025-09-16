/**
 * Default preset color palette with black/white first and fewer total colors
 * These are commonly used colors for quick selection in the color picker
 */
export const DEFAULT_COLOR_PALETTE = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#FF8000", // Orange
  "#FFFF00", // Yellow
  "#80FF00", // Light Green
  "#00FF00", // Green
  "#00FFFF", // Cyan
  "#0080FF", // Light Blue
  "#0000FF", // Blue
  "#8000FF", // Purple
  "#FF00FF", // Magenta
  "#FF0080", // Pink
  "#808080", // Gray
] as const;

/**
 * Layout constants for the color picker
 */
export const LAYOUT_CONSTANTS = {
  DEFAULT_SIZE: 300,
  WHEEL_RADIUS_RATIO: 0.35,
  ALPHA_INNER_RADIUS_OFFSET: 15,
  ALPHA_OUTER_RADIUS_OFFSET: 10,
  INDICATOR_RADIUS: 6,
  INDICATOR_BORDER_WIDTH: 2,
} as const;

/**
 * Animation and interaction constants
 */
export const INTERACTION_CONSTANTS = {
  COLOR_RING_TOLERANCE: {
    HUE: 10, // degrees
    SATURATION_VALUE: 0.1, // 10%
  },
  ANTI_ALIASING_EDGE_WIDTH: 1,
} as const;
