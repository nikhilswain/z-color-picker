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
export type ColorFormatType =
  | "rgba"
  | "rgb"
  | "hex"
  | "hsl"
  | "hsla"
  | "hsv"
  | "hsva";

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
 * - Always returns object with format keys for consistency
 * - formats prop is required, so no need to handle empty arrays
 */
export type ZColorResult<T extends ColorFormatType[]> = {
  [K in T[number]]: ColorFormatResults[K];
};

/**
 * Drag target types for color picker interactions
 */
export type DragTarget = "color" | "alpha" | "value" | null;

/**
 *  @interface ZColorPickerProps
 * Props for the ZColorPicker component
 * @template T - Array of ColorFormatType determining output formats
 * @default [] (returns RGBA + HSVA by default)
 * @example
 * <ZColorPicker
 * size={300}
 * onChange={(color) => console.log(color)}
 * initialColor={{ r: 255, g: 0, b: 0, a: 1 }}
 * showEyedropper={true}
 * showBrightnessBar={true}
 * showColorRings={true}
 * pickerBgColor="#ffffff"
 * colorRingsPalette={['#FF0000', '#00FF00', '#0000FF']}
 * formats={['hex', 'rgba']}
 * />
 *
 * @description
 * - `size`: Size of the color picker in pixels (default: 300)
 * - `onChange`: Callback fired when color changes, receives color in specified formats
 * - `initialColor`: Initial color value as RGBA (default: opaque black)
 * - `showEyedropper`: Whether to show the eyedropper tool (default: false)
 * - `showBrightnessBar`: Whether to show the brightness bar (default: true)
 * - `showColorRings`: Whether to show color preset rings (default: true)
 * - `pickerBgColor`: Background color of the picker (default: #ffffff)
 * - `colorRingsPalette`: Custom color palette for the rings (default: preset colors)
 * - `formats`: Array of desired output formats, determines the return type of onChange (REQUIRED)
 */
export interface ZColorPickerProps<T extends ColorFormatType[]> {
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
  pickerBgColor?: string;
  /** Custom color for circular picker background */
  colorRingsPalette?: string[];
  /** Output formats (determines return type) - REQUIRED */
  formats: T;
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
