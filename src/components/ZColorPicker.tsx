import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

// Import styles for bundling
import "../styles/index.css";

// Import from organized structure
import type {
  ZColorPickerProps,
  ZColorResult,
  ColorFormatResults,
  ColorFormatType,
  DragTarget,
  HSVAColor,
} from "../types";
import {
  getDistance,
  getAngle,
  radToDeg,
  hsvToRgb,
  rgbToHsv,
  rgbToHex,
  rgbToHsl,
} from "../utils";
import {
  DEFAULT_COLOR_PALETTE,
  LAYOUT_CONSTANTS,
  INTERACTION_CONSTANTS,
} from "../constants";

/**
 * An enhanced, performant, and touch-friendly circular color picker for React.
 *
 * @example
 * ```tsx
 * <ZColorPicker
 *   size={280}
 *   initialColor={{ r: 255, g: 100, b: 50, a: 0.8 }}
 *   onChange={(color) => console.log(color)}
 *   showEyedropper={true}
 *   showBrightnessBar={true}
 *   showColorRings={true}
 * />
 * ```
 */
function ZColorPicker<T extends ColorFormatType[] = []>({
  size = LAYOUT_CONSTANTS.DEFAULT_SIZE,
  onChange,
  initialColor = { r: 255, g: 0, b: 0, a: 1 },
  showEyedropper = false,
  showBrightnessBar = false,
  showColorRings = false,
  colorRingsPalette = [...DEFAULT_COLOR_PALETTE],
  formats,
}: ZColorPickerProps<T>) {
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
        wheelRadius: size * LAYOUT_CONSTANTS.WHEEL_RADIUS_RATIO,
        alphaInnerRadius:
          size * LAYOUT_CONSTANTS.WHEEL_RADIUS_RATIO +
          LAYOUT_CONSTANTS.ALPHA_INNER_RADIUS_OFFSET,
        alphaOuterRadius: size / 2 - LAYOUT_CONSTANTS.ALPHA_OUTER_RADIUS_OFFSET,
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
          if (
            distance >
            wheelRadius - INTERACTION_CONSTANTS.ANTI_ALIASING_EDGE_WIDTH
          ) {
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
      ctx.arc(x, y, LAYOUT_CONSTANTS.INDICATOR_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = LAYOUT_CONSTANTS.INDICATOR_BORDER_WIDTH;
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
  ]);

  // Setup high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = size;
    const canvasHeight = size;

    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
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
        onChange?.({ ...newColor, r, g, b } as ZColorResult<T>);
      } else if (formats.length === 1) {
        // Single format: return direct value
        const format = formats[0];
        onChange?.(formatResults[format] as ZColorResult<T>);
      } else {
        // Multiple formats: return object with requested formats
        const result = {} as Record<string, unknown>;
        formats.forEach((format) => {
          result[format] = formatResults[format];
        });
        onChange?.(result as ZColorResult<T>);
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

  // Check for EyeDropper API support (now always supported with fallbacks)
  useEffect(() => {
    // Always set to true since we have cross-device fallbacks
    setIsEyedropperSupported(true);
  }, []);

  // Cross-device compatible eyedropper functionality
  const handleEyedropper = useCallback(async () => {
    // Try native EyeDropper API first (Chrome, Edge)
    if ("EyeDropper" in window) {
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
        return;
      } catch {
        // User cancelled the eyedropper
        console.log("Native eyedropper cancelled");
        return;
      }
    }

    // Fallback: Canvas-based color picking for unsupported browsers
    try {
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      // Create video element to capture screen
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for video to load
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas overlay for color picking
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.backgroundColor = "rgba(0,0,0,0.3)";
      overlay.style.cursor = "crosshair";
      overlay.style.zIndex = "9999";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";

      // Add instructions
      const instructions = document.createElement("div");
      instructions.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; max-width: 300px;">
          <h3 style="margin: 0 0 10px 0;">Color Picker</h3>
          <p style="margin: 0 0 15px 0;">Move your cursor/pen over any area and click to pick a color</p>
          <button id="cancel-picker" style="padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
        </div>
      `;
      overlay.appendChild(instructions);

      // Create hidden canvas for pixel sampling
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      document.body.appendChild(overlay);

      // Color picking logic with cross-device support
      const pickColor = (clientX: number, clientY: number) => {
        // Draw current video frame to canvas
        ctx?.drawImage(video, 0, 0);

        // Calculate pixel position relative to video
        const rect = overlay.getBoundingClientRect();
        const x = Math.floor((clientX / rect.width) * canvas.width);
        const y = Math.floor((clientY / rect.height) * canvas.height);

        // Get pixel data
        const imageData = ctx?.getImageData(x, y, 1, 1);
        if (imageData) {
          const [r, g, b] = imageData.data;

          // Convert RGB to HSV and update color
          const hsv = rgbToHsv(r, g, b);
          const newColor = { ...hsv, a: color.a };
          setColor(newColor);
          triggerOnChange(newColor);
        }

        cleanup();
      };

      const cleanup = () => {
        stream.getTracks().forEach((track) => track.stop());
        document.body.removeChild(overlay);
      };

      // 4. Keyboard support (Enter to pick center, Escape to cancel)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", handleKeyDown);
          cleanup();
        } else if (e.key === "Enter") {
          pickColor(window.innerWidth / 2, window.innerHeight / 2);
        }
      };

      const cleanupWithKeyboard = () => {
        document.removeEventListener("keydown", handleKeyDown);
        cleanup();
      };

      // Support multiple input methods

      // 1. Mouse events
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          pickColor(e.clientX, e.clientY);
        }
      });

      // 2. Touch events (tablets, phones)
      overlay.addEventListener("touchend", (e) => {
        e.preventDefault();
        if (e.changedTouches.length > 0) {
          const touch = e.changedTouches[0];
          pickColor(touch.clientX, touch.clientY);
        }
      });

      // 3. Pointer events (stylus, pen, touch)
      overlay.addEventListener("pointerup", (e) => {
        if (e.target === overlay) {
          pickColor(e.clientX, e.clientY);
        }
      });

      document.addEventListener("keydown", handleKeyDown);

      // Cancel button
      const cancelBtn = document.getElementById("cancel-picker");
      cancelBtn?.addEventListener("click", cleanupWithKeyboard);
    } catch (error) {
      console.warn("Screen capture not supported or denied:", error);

      // Final fallback: Simple color input
      const input = document.createElement("input");
      input.type = "color";
      input.style.position = "absolute";
      input.style.left = "-9999px";
      document.body.appendChild(input);

      input.addEventListener("change", (e) => {
        const hex = (e.target as HTMLInputElement).value;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const hsv = rgbToHsv(r, g, b);
        const newColor = { ...hsv, a: color.a };
        setColor(newColor);
        triggerOnChange(newColor);

        document.body.removeChild(input);
      });

      input.click();
    }
  }, [color.a, triggerOnChange]);

  // Brightness bar interaction
  const handleBrightnessChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newV = parseFloat(e.target.value);
      const newColor = { ...color, v: newV };
      setColor(newColor);
      triggerOnChange(newColor);
    },
    [color, triggerOnChange]
  );

  // Color ring selection
  const handleColorRingClick = useCallback(
    (hexColor: string) => {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const { h, s, v } = rgbToHsv(r, g, b);
      const newColor = { ...color, h, s, v };
      setColor(newColor);
      triggerOnChange(newColor);
    },
    [color, triggerOnChange]
  );

  // Helper function to determine if a color ring should be active
  const isColorRingActive = useCallback(
    (hexColor: string) => {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const { h, s, v } = rgbToHsv(r, g, b);

      // Check if current color matches this ring color (with some tolerance)
      const { HUE: hTolerance, SATURATION_VALUE: svTolerance } =
        INTERACTION_CONSTANTS.COLOR_RING_TOLERANCE;

      return (
        Math.abs(color.h - h) < hTolerance &&
        Math.abs(color.s - s) < svTolerance &&
        Math.abs(color.v - v) < svTolerance
      );
    },
    [color.h, color.s, color.v]
  );

  // Layout calculation based on visible components
  const layoutConfig = useMemo(() => {
    const hasEyedropper = showEyedropper && isEyedropperSupported;
    const hasColorRings = showColorRings && colorRingsPalette.length > 0;
    const hasBrightnessBar = showBrightnessBar;

    return {
      hasEyedropper,
      hasColorRings,
      hasBrightnessBar,
      isCompactLayout: !hasColorRings && !hasBrightnessBar,
      needsFlexLayout: hasEyedropper || hasColorRings || hasBrightnessBar,
    };
  }, [
    showEyedropper,
    isEyedropperSupported,
    showColorRings,
    colorRingsPalette.length,
    showBrightnessBar,
  ]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top: Color Picker Circle */}
      <canvas
        ref={canvasRef}
        className="shadow-lg"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          borderRadius: "50%",
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      />

      {/* Bottom: Eyedropper (left) + Color Rings & Brightness Bar (right) */}
      {(layoutConfig.hasEyedropper ||
        layoutConfig.hasColorRings ||
        layoutConfig.hasBrightnessBar) && (
        <div className="flex items-center gap-6">
          {/* Left: Eyedropper */}
          {layoutConfig.hasEyedropper && (
            <button
              onClick={handleEyedropper}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-full shadow-sm transition-all duration-200 hover:shadow-md group"
              title="Pick color from screen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                id="eyedropper"
                width={30}
                hanging={30}
              >
                <rect width="256" height="256" fill="none"></rect>
                <path
                  fill="none"
                  stroke="#000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="8"
                  d="M179.799,115.799l4.88728,4.88728a16,16,0,0,1,0,22.62742l-7.02944,7.02944a8,8,0,0,1-11.3137,0l-60.6863-60.6863a8,8,0,0,1,0-11.3137l7.02944-7.02944a16,16,0,0,1,22.62742,0l4.8873,4.8873,27.58813-27.58813c10.78822-10.78822,28.36591-11.4491,39.44579-.96065A28.00039,28.00039,0,0,1,207.799,87.799Z"
                ></path>
                <path
                  fill="none"
                  stroke="#000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="8"
                  d="M158.62742,142.62742l-56,56a31.98729,31.98729,0,0,1-30.91154,8.28721L48.31361,217.131A8,8,0,0,1,39.456,215.456h0a5.74381,5.74381,0,0,1-1.20256-6.35955l10.832-24.81212a31.9873,31.9873,0,0,1,8.28715-30.91177l56-56"
                ></path>
              </svg>
            </button>
          )}

          {/* Right: Color Rings and Brightness Bar */}
          {(layoutConfig.hasColorRings || layoutConfig.hasBrightnessBar) && (
            <div
              className="flex flex-col gap-3"
              style={{ minWidth: size * 0.8 }}
            >
              {/* Color Rings */}
              {layoutConfig.hasColorRings && (
                <div className="flex flex-col gap-2">
                  {/* Single row when brightness bar is present, two rows when it's not */}
                  {layoutConfig.hasBrightnessBar ? (
                    // One row with brightness bar
                    <div className="flex gap-2 justify-center">
                      {colorRingsPalette.slice(0, 8).map((hexColor, index) => {
                        const isActive = isColorRingActive(hexColor);
                        return (
                          <button
                            key={`single-row-${index}`}
                            onClick={() => handleColorRingClick(hexColor)}
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 shadow-sm ${
                              isActive
                                ? "border-gray-500 border-1 scale-110"
                                : "border-gray-300 hover:border-gray-500"
                            }`}
                            style={{
                              backgroundColor: hexColor,
                            }}
                            title={hexColor}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 justify-center">
                        {colorRingsPalette
                          .slice(0, Math.ceil(colorRingsPalette.length / 2))
                          .map((hexColor, index) => {
                            const isActive = isColorRingActive(hexColor);
                            return (
                              <button
                                key={`row1-${index}`}
                                onClick={() => handleColorRingClick(hexColor)}
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 shadow-sm ${
                                  isActive
                                    ? "border-blue-500 border-4 scale-110"
                                    : "border-gray-300 hover:border-gray-500"
                                }`}
                                style={{ backgroundColor: hexColor }}
                                title={hexColor}
                              />
                            );
                          })}
                      </div>
                      <div className="flex gap-2 justify-center">
                        {colorRingsPalette
                          .slice(Math.ceil(colorRingsPalette.length / 2))
                          .map((hexColor, index) => {
                            const isActive = isColorRingActive(hexColor);
                            return (
                              <button
                                key={`row2-${index}`}
                                onClick={() => handleColorRingClick(hexColor)}
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 shadow-sm ${
                                  isActive
                                    ? "border-blue-500 border-4 scale-110"
                                    : "border-gray-300 hover:border-gray-500"
                                }`}
                                style={{ backgroundColor: hexColor }}
                                title={hexColor}
                              />
                            );
                          })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Brightness Bar */}
              {layoutConfig.hasBrightnessBar && (
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={color.v}
                    onChange={handleBrightnessChange}
                    className="w-full h-3 appearance-none rounded-lg cursor-pointer shadow-inner range-thumb"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${color.h}, ${color.s * 100}%, 0%), 
                        hsl(${color.h}, ${color.s * 100}%, 50%), 
                        hsl(${color.h}, ${color.s * 100}%, 100%))`,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ZColorPicker;
