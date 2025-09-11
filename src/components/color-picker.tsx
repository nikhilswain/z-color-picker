import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

// --- TypeScript Interfaces ---

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface HSVColor {
  h: number;
  s: number;
  v: number;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface RGBAColor extends RGBColor {
  a: number;
}

interface HSVAColor extends HSVColor {
  a: number;
}

// Available color format types
type ColorFormatType = "rgba" | "rgb" | "hex" | "hsl" | "hsla" | "hsv" | "hsva";

// Individual format results
interface ColorFormatResults {
  rgba: RGBAColor;
  rgb: RGBColor;
  hex: string;
  hsl: HSLColor;
  hsla: HSLColor & { a: number };
  hsv: HSVColor;
  hsva: HSVAColor;
}

// Dynamic result type based on formats array
type ColorResult<T extends ColorFormatType[]> = T extends [infer U]
  ? U extends ColorFormatType
    ? ColorFormatResults[U]
    : never
  : T extends []
  ? RGBAColor & HSVAColor // Default when no formats specified
  : { [K in T[number]]: ColorFormatResults[K] };

interface ColorPickerProps<T extends ColorFormatType[] = []> {
  size?: number;
  onChange?: (color: ColorResult<T>) => void;
  initialColor?: RGBAColor;
  backgroundColor?: string;
  showBackground?: boolean;
  backgroundOpacity?: number;
  showEyedropper?: boolean;
  formats?: T;
}

type DragTarget = "color" | "alpha" | null;

// EyeDropper API type declaration
declare global {
  interface Window {
    EyeDropper?: {
      new (): {
        open(): Promise<{ sRGBHex: string }>;
      };
    };
  }
}

// --- Color & Geometry Utilities (Moved outside component for performance) ---

const getDistance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const getAngle = (x: number, y: number, cx: number, cy: number): number =>
  Math.atan2(y - cy, x - cx);

const radToDeg = (rad: number): number => ((rad * 180) / Math.PI + 360) % 360;

const hsvToRgb = (h: number, s: number, v: number): RGBColor => {
  const c = v * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;
  if (hh >= 0 && hh < 1) [r, g] = [c, x];
  else if (hh < 2) [r, g] = [x, c];
  else if (hh < 3) [g, b] = [c, x];
  else if (hh < 4) [g, b] = [x, c];
  else if (hh < 5) [r, b] = [x, c];
  else [r, b] = [c, x];
  const m = v - c;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const rgbToHsv = (r: number, g: number, b: number): HSVColor => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : diff / max;
  return { h, s, v: max };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number): string => `0${c.toString(16)}`.slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = (r: number, g: number, b: number): HSLColor => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * An enhanced, performant, and touch-friendly circular color picker for React.
 *
 * @example
 * ```tsx
 * <EnhancedCircularColorPicker
 *   size={280}
 *   initialColor={{ r: 255, g: 100, b: 50, a: 0.8 }}
 *   onChange={(color) => console.log(color)}
 *   showEyedropper={true}
 * />
 * ```
 */
function EnhancedCircularColorPicker<T extends ColorFormatType[] = []>({
  size = 300,
  onChange,
  initialColor = { r: 255, g: 0, b: 0, a: 1 },
  backgroundColor = "#ffffff",
  showBackground = true,
  backgroundOpacity = 1,
  showEyedropper = false,
  formats,
}: ColorPickerProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [isEyedropperSupported, setIsEyedropperSupported] = useState(false);

  // State is now HSV+A, the "source of truth", for easier manipulation.
  const [color, setColor] = useState(() => {
    const { h, s, v } = rgbToHsv(
      initialColor.r,
      initialColor.g,
      initialColor.b
    );
    return { h, s, v, a: initialColor.a ?? 1 };
  });

  // Layout constants are memoized to prevent recalculations
  const { centerX, centerY, wheelRadius, alphaInnerRadius, alphaOuterRadius } =
    useMemo(
      () => ({
        centerX: size / 2,
        centerY: size / 2,
        wheelRadius: size * 0.35,
        alphaInnerRadius: size * 0.35 + 15,
        alphaOuterRadius: size / 2 - 10,
      }),
      [size]
    );

  // Derived color values are memoized for performance
  const derivedColors = useMemo(() => {
    const { r, g, b } = hsvToRgb(color.h, color.s, color.v);
    const hex = rgbToHex(r, g, b);
    const { h: hslH, s: hslS, l: hslL } = rgbToHsl(r, g, b);
    return {
      r,
      g,
      b,
      hex,
      rgbaString: `rgba(${r}, ${g}, ${b}, ${color.a.toFixed(2)})`,
      hslaString: `hsla(${hslH}, ${hslS}%, ${hslL}%, ${color.a.toFixed(2)})`,
    };
  }, [color]);

  // Pre-draw the color wheel to an offscreen canvas to optimize rendering
  useEffect(() => {
    const pixelRatio = window.devicePixelRatio || 1;
    const wheelCanvas = document.createElement("canvas");
    const scaledSize = size * pixelRatio;
    wheelCanvas.width = scaledSize;
    wheelCanvas.height = scaledSize;
    const ctx = wheelCanvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.scale(pixelRatio, pixelRatio);

    // Create smooth color wheel using ImageData with anti-aliasing
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const distance = getDistance(x, y, centerX, centerY);
        const idx = (y * size + x) * 4;

        if (distance <= wheelRadius) {
          const angle = getAngle(x, y, centerX, centerY);
          const hue = radToDeg(angle);
          const saturation = Math.min(1, distance / wheelRadius);
          const { r, g, b } = hsvToRgb(hue, saturation, 1);

          // Add anti-aliasing at the edge
          let alpha = 255;
          if (distance > wheelRadius - 1) {
            alpha = Math.max(0, 255 * (wheelRadius - distance));
          }

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = alpha;
        } else {
          // Transparent outside the wheel
          data[idx + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    wheelCanvasRef.current = wheelCanvas;
  }, [size, centerX, centerY, wheelRadius]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const pixelRatio = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, size, size);
    if (showBackground) {
      ctx.fillStyle = backgroundColor;
      ctx.globalAlpha = backgroundOpacity;
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = 1;
    }

    if (wheelCanvasRef.current) {
      ctx.drawImage(wheelCanvasRef.current, 0, 0);
    }

    // Draw Alpha Ring with smooth edges
    ctx.save();

    // Create clipping mask for alpha ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, alphaOuterRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, alphaInnerRadius, 0, 2 * Math.PI, true);
    ctx.clip();

    const gradient = ctx.createConicGradient(-Math.PI / 2, centerX, centerY);
    gradient.addColorStop(
      0,
      `rgba(${derivedColors.r}, ${derivedColors.g}, ${derivedColors.b}, 1)`
    );
    gradient.addColorStop(
      1,
      `rgba(${derivedColors.r}, ${derivedColors.g}, ${derivedColors.b}, 0)`
    );

    ctx.beginPath();
    ctx.arc(centerX, centerY, alphaOuterRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();

    const drawIndicator = (x: number, y: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const colorAngle = (color.h * Math.PI) / 180;
    const colorDist = color.s * wheelRadius;
    drawIndicator(
      centerX + colorDist * Math.cos(colorAngle),
      centerY + colorDist * Math.sin(colorAngle)
    );

    const alphaAngle = (1 - color.a) * 2 * Math.PI - Math.PI / 2;
    const ringRadius = (alphaInnerRadius + alphaOuterRadius) / 2;
    drawIndicator(
      centerX + ringRadius * Math.cos(alphaAngle),
      centerY + ringRadius * Math.sin(alphaAngle)
    );

    ctx.restore();
  }, [
    size,
    color,
    derivedColors,
    centerX,
    centerY,
    wheelRadius,
    alphaInnerRadius,
    alphaOuterRadius,
    showBackground,
    backgroundColor,
    backgroundOpacity,
  ]);

  // Setup high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }, [size]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const triggerOnChange = useCallback(
    (newColor: HSVAColor) => {
      const { r, g, b } = hsvToRgb(newColor.h, newColor.s, newColor.v);
      const { h: hslH, s: hslS, l: hslL } = rgbToHsl(r, g, b);

      // Build available format results
      const formatResults: ColorFormatResults = {
        rgba: { r, g, b, a: newColor.a },
        rgb: { r, g, b },
        hex: rgbToHex(r, g, b),
        hsl: { h: hslH, s: hslS, l: hslL },
        hsla: { h: hslH, s: hslS, l: hslL, a: newColor.a },
        hsv: {
          h: Math.round(newColor.h),
          s: Math.round(newColor.s * 100),
          v: Math.round(newColor.v * 100),
        },
        hsva: {
          h: Math.round(newColor.h),
          s: Math.round(newColor.s * 100),
          v: Math.round(newColor.v * 100),
          a: newColor.a,
        },
      };

      // Return data based on formats prop
      if (!formats || formats.length === 0) {
        // Default: return RGBA + HSVA merged object (backward compatibility)
        onChange?.({ ...newColor, r, g, b } as ColorResult<T>);
      } else if (formats.length === 1) {
        // Single format: return direct value
        const format = formats[0];
        onChange?.(formatResults[format] as ColorResult<T>);
      } else {
        // Multiple formats: return object with requested formats
        const result = {} as Record<string, unknown>;
        formats.forEach((format) => {
          result[format] = formatResults[format];
        });
        onChange?.(result as ColorResult<T>);
      }
    },
    [onChange, formats]
  );

  const getPointerPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    []
  );

  const updateColorFromPosition = useCallback(
    (x: number, y: number) => {
      const distance = getDistance(x, y, centerX, centerY);
      const angle = getAngle(x, y, centerX, centerY);
      const hue = radToDeg(angle);
      const saturation = Math.min(1, distance / wheelRadius);
      const newColor = { ...color, h: hue, s: saturation };
      setColor(newColor);
      triggerOnChange(newColor);
    },
    [centerX, centerY, wheelRadius, color, triggerOnChange]
  );

  const updateAlphaFromPosition = useCallback(
    (x: number, y: number) => {
      let angle = getAngle(x, y, centerX, centerY) + Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;
      const alpha = Math.max(0, Math.min(1, 1 - angle / (2 * Math.PI)));
      const newColor = { ...color, a: alpha };
      setColor(newColor);
      triggerOnChange(newColor);
    },
    [centerX, centerY, color, triggerOnChange]
  );

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const { x, y } = getPointerPosition(e);
      const distance = getDistance(x, y, centerX, centerY);
      if (distance <= wheelRadius) {
        setIsDragging(true);
        setDragTarget("color");
        updateColorFromPosition(x, y);
      } else if (distance >= alphaInnerRadius && distance <= alphaOuterRadius) {
        setIsDragging(true);
        setDragTarget("alpha");
        updateAlphaFromPosition(x, y);
      }
    },
    [
      getPointerPosition,
      centerX,
      centerY,
      wheelRadius,
      alphaInnerRadius,
      alphaOuterRadius,
      updateColorFromPosition,
      updateAlphaFromPosition,
    ]
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      if ("cancelable" in e && e.cancelable) e.preventDefault();
      const { x, y } = getPointerPosition(e);
      if (dragTarget === "color") {
        updateColorFromPosition(x, y);
      } else if (dragTarget === "alpha") {
        updateAlphaFromPosition(x, y);
      }
    },
    [
      isDragging,
      dragTarget,
      getPointerPosition,
      updateColorFromPosition,
      updateAlphaFromPosition,
    ]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragTarget(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handlePointerMove);
      document.addEventListener("mouseup", handlePointerUp);
      document.addEventListener("touchmove", handlePointerMove, {
        passive: false,
      });
      document.addEventListener("touchend", handlePointerUp);
      return () => {
        document.removeEventListener("mousemove", handlePointerMove);
        document.removeEventListener("mouseup", handlePointerUp);
        document.removeEventListener("touchmove", handlePointerMove);
        document.removeEventListener("touchend", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Check for EyeDropper API support
  useEffect(() => {
    setIsEyedropperSupported("EyeDropper" in window);
  }, []);

  // Eyedropper functionality
  const handleEyedropper = useCallback(async () => {
    if (!("EyeDropper" in window)) {
      console.warn("EyeDropper API is not supported in this browser");
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper!();
      const result = await eyeDropper.open();

      // Parse the hex color to RGB
      const hex = result.sRGBHex;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      // Convert RGB to HSV and update color
      const hsv = rgbToHsv(r, g, b);
      const newColor = { ...hsv, a: color.a };
      setColor(newColor);
      triggerOnChange(newColor);
    } catch {
      // User cancelled the eyedropper
      console.log("Eyedropper cancelled");
    }
  }, [color.a, triggerOnChange]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Core Color Picker */}
      <canvas
        ref={canvasRef}
        className="rounded-full shadow-lg"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      />

      {/* Optional Eyedropper Tool */}
      {showEyedropper && isEyedropperSupported && (
        <button
          onClick={handleEyedropper}
          className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md group"
          title="Pick color from screen"
        >
          <svg
            className="w-5 h-5 text-gray-600 group-hover:text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default EnhancedCircularColorPicker;
