/**
 * Z Color Picker - Enhanced React Color Picker Library
 *
 * A professional, cross-device compatible color picker with:
 * - HSV color space with alpha channel
 * - High-DPI canvas rendering with anti-aliasing
 * - Cross-device eyedropper (native API + fallbacks)
 * - Touch-friendly interface with multi-input support
 * - Flexible format output (hex, rgb, hsl, hsv, etc.)
 * - Professional layout with brightness bar and color rings
 */

// Main component export
export { default as ZColorPicker } from "./components/ZColorPicker";

// Type exports for TypeScript users
export type {
  // Format types
  ColorFormatType,
  ColorFormatResults,
  ZColorResult,

  // Component types
  ZColorPickerProps,
} from "./types";
