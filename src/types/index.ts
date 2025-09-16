/**
 * Core color type definitions for the z-color-picker library
 */

/**
 * RGB color representation
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * HSV color representation
 */
export interface HSVColor {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-1)
  v: number; // Value/Brightness (0-1)
}

/**
 * HSL color representation
 */
export interface HSLColor {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

/**
 * RGBA color representation (RGB with alpha)
 */
export interface RGBAColor extends RGBColor {
  a: number; // Alpha (0-1)
}

/**
 * HSVA color representation (HSV with alpha)
 */
export interface HSVAColor extends HSVColor {
  a: number; // Alpha (0-1)
}

/**
 * Available color format types for output
 */
export type ColorFormatType = "rgba" | "rgb" | "hex" | "hsl" | "hsla" | "hsv" | "hsva";

/**
 * Individual format results mapping
 */
export interface ColorFormatResults {
  rgba: RGBAColor;
  rgb: RGBColor;
  hex: string;
  hsl: HSLColor;
  hsla: HSLColor & { a: number };
  hsv: HSVColor;
  hsva: HSVAColor;
}

/**
 * Dynamic result type based on formats array
 * - Single format: returns the format directly
 * - Multiple formats: returns object with format keys
 * - No formats: returns default RGBA + HSVA merged object
 */
export type ZColorResult<T extends ColorFormatType[]> = T extends [infer U]
  ? U extends ColorFormatType
    ? ColorFormatResults[U]
    : never
  : T extends []
  ? RGBAColor & HSVAColor // Default when no formats specified
  : { [K in T[number]]: ColorFormatResults[K] };

/**
 * Drag target types for color picker interactions
 */
export type DragTarget = "color" | "alpha" | "value" | null;

/**
 * Main color picker component props
 */
export interface ZColorPickerProps<T extends ColorFormatType[] = []> {
  /** Size of the color picker in pixels */
  size?: number;
  /** Callback fired when color changes */
  onChange?: (color: ZColorResult<T>) => void;
  /** Initial color value */
  initialColor?: RGBAColor;
  /** Show eyedropper tool */
  showEyedropper?: boolean;
  /** Show brightness bar */
  showBrightnessBar?: boolean;
  /** Show color preset rings */
  showColorRings?: boolean;
  /** Custom color palette for rings */
  colorRingsPalette?: string[];
  /** Output formats (determines return type) */
  formats?: T;
}

/**
 * EyeDropper API type declaration for browsers that support it
 */
declare global {
  interface Window {
    EyeDropper?: {
      new (): {
        open(): Promise<{ sRGBHex: string }>;
      };
    };
  }
}
