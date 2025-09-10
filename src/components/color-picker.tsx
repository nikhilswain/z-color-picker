import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

// --- Color & Geometry Utilities (Moved outside component for performance) ---

const getDistance = (x1, y1, x2, y2) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
const getAngle = (x, y, cx, cy) => Math.atan2(y - cy, x - cx);
const radToDeg = (rad) => ((rad * 180) / Math.PI + 360) % 360;

const hsvToRgb = (h, s, v) => {
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

const rgbToHsv = (r, g, b) => {
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

const rgbToHex = (r, g, b) => {
  const toHex = (c) => `0${c.toString(16)}`.slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
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

// --- Helper Components ---

function ColorOutput({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.error("Failed to copy!", err));
  };

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-gray-500 uppercase">
        {label}
      </label>
      <input
        type="text"
        readOnly
        value={value}
        className="w-full p-2 pr-10 font-mono text-sm bg-gray-100 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={copyToClipboard}
        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500 hover:text-gray-800"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

/**
 * An enhanced, performant, and touch-friendly circular color picker for React.
 * @param {object} props
 * @param {number} [props.size=300] - The size (width and height) of the color picker in pixels.
 * @param {function} [props.onChange] - Callback function that fires when the color changes.
 * @param {{r: number, g: number, b: number, a: number}} [props.initialColor] - The initial color value.
 * @param {string} [props.backgroundColor="#ffffff"] - A CSS color for the picker's background.
 * @param {boolean} [props.showBackground=true] - Whether to display the background color.
 * @param {number} [props.backgroundOpacity=1] - Opacity of the background, from 0 to 1.
 */
function EnhancedCircularColorPicker({
  size = 300,
  onChange,
  initialColor = { r: 255, g: 0, b: 0, a: 1 },
  backgroundColor = "#ffffff",
  showBackground = true,
  backgroundOpacity = 1,
}) {
  const canvasRef = useRef(null);
  const wheelCanvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);

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
    const wheelCanvas = document.createElement("canvas");
    wheelCanvas.width = size;
    wheelCanvas.height = size;
    const ctx = wheelCanvas.getContext("2d");
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const distance = getDistance(x, y, centerX, centerY);
        const idx = (y * size + x) * 4;
        if (distance <= wheelRadius) {
          const angle = getAngle(x, y, centerX, centerY);
          const hue = radToDeg(angle);
          const saturation = distance / wheelRadius;
          const { r, g, b } = hsvToRgb(hue, saturation, 1);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    wheelCanvasRef.current = wheelCanvas;
  }, [size, centerX, centerY, wheelRadius]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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

    // Draw Alpha Ring using a thick, stroked arc for better performance
    const ringRadius = (alphaInnerRadius + alphaOuterRadius) / 2;
    const ringWidth = alphaOuterRadius - alphaInnerRadius;
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
    ctx.arc(centerX, centerY, ringRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    const drawIndicator = (x, y) => {
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
    drawIndicator(
      centerX + ringRadius * Math.cos(alphaAngle),
      centerY + ringRadius * Math.sin(alphaAngle)
    );
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

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const triggerOnChange = useCallback(
    (newColor) => {
      const { r, g, b } = hsvToRgb(newColor.h, newColor.s, newColor.v);
      onChange?.({ ...newColor, r, g, b });
    },
    [onChange]
  );

  const getPointerPosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const updateColorFromPosition = useCallback(
    (x, y) => {
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
    (x, y) => {
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
    (e) => {
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
    (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
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

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-lg"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      />
      <div className="flex items-center gap-4 w-full">
        <div
          className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm flex-shrink-0"
          style={{ backgroundColor: derivedColors.rgbaString }}
        />
        <div className="w-full space-y-2">
          <ColorOutput label="HEX" value={derivedColors.hex} />
          <ColorOutput label="RGBA" value={derivedColors.rgbaString} />
          <ColorOutput label="HSLA" value={derivedColors.hslaString} />
        </div>
      </div>
    </div>
  );
}

export default EnhancedCircularColorPicker;
