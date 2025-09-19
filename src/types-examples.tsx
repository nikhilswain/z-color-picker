// Basic usage examples demonstrating TypeScript types for ZColorPicker component

import { useState } from "react";
import { ZColorPicker, type ZColorResult, type ColorFormatType } from "./index"; // Using local import since this is in the same project

// Example 1: Basic usage with inline RGBA type
function BasicExample() {
  const [color, setColor] = useState<{
    r: number;
    g: number;
    b: number;
    a: number;
  }>({
    r: 255,
    g: 100,
    b: 50,
    a: 1,
  });

  return (
    <ZColorPicker
      initialColor={color}
      formats={["rgba"]}
      onChange={(result) => setColor(result.rgba)}
    />
  );
}

// Example 2: Single format with type safety
function SingleFormatExample() {
  const [hexColor, setHexColor] = useState<string>("#ff6432");

  return (
    <div>
      <ZColorPicker
        formats={["hex"]}
        onChange={(result) => {
          setHexColor(result.hex);
          console.log("New hex color:", result.hex);
        }}
      />
      <p>Current color: {hexColor}</p>
    </div>
  );
}

// Example 3: Multiple formats with ZColorResult
function MultipleFormatsExample() {
  const handleColorChange = (color: ZColorResult<["hex", "rgba", "hsl"]>) => {
    console.log("Hex:", color.hex); // string
    console.log("RGBA:", color.rgba); // { r: number; g: number; b: number; a: number }
    console.log("HSL:", color.hsl); // { h: number; s: number; l: number }
  };

  return (
    <ZColorPicker
      formats={["hex", "rgba", "hsl"]}
      onChange={handleColorChange}
    />
  );
}

// Example 4: Working with different color spaces using inline types
function ColorSpaceExample() {
  const [rgbColor, setRgbColor] = useState<{ r: number; g: number; b: number }>(
    { r: 255, g: 100, b: 50 }
  );
  const [hsvColor, setHsvColor] = useState<{ h: number; s: number; v: number }>(
    { h: 15, s: 0.8, v: 1 }
  );
  const [hslColor, setHslColor] = useState<{ h: number; s: number; l: number }>(
    { h: 15, s: 80, l: 60 }
  );

  const handleRgbChange = (result: ZColorResult<["rgb"]>) => {
    setRgbColor(result.rgb); // Now result is { rgb: RGBColor }
  };

  const handleHsvChange = (result: ZColorResult<["hsv"]>) => {
    setHsvColor(result.hsv); // Now result is { hsv: HSVColor }
  };

  const handleHslChange = (result: ZColorResult<["hsl"]>) => {
    setHslColor(result.hsl); // Now result is { hsl: HSLColor }
  };

  return (
    <div>
      <h3>RGB Color Picker</h3>
      <ZColorPicker
        formats={["rgb"]}
        onChange={handleRgbChange}
        initialColor={{ ...rgbColor, a: 1 }}
      />
      <p>
        RGB: {rgbColor.r}, {rgbColor.g}, {rgbColor.b}
      </p>

      <h3>HSV Color Picker</h3>
      <ZColorPicker formats={["hsv"]} onChange={handleHsvChange} />
      <p>
        HSV: {hsvColor.h}°, {Math.round(hsvColor.s * 100)}%,{" "}
        {Math.round(hsvColor.v * 100)}%
      </p>

      <h3>HSL Color Picker</h3>
      <ZColorPicker formats={["hsl"]} onChange={handleHslChange} />
      <p>
        HSL: {hslColor.h}°, {hslColor.s}%, {hslColor.l}%
      </p>
    </div>
  );
}

// Example 5: Generic component with format constraints
interface ColorPickerProps<T extends ColorFormatType[]> {
  formats: T;
  onColorChange: (color: ZColorResult<T>) => void;
  label: string;
}

function GenericColorPicker<T extends ColorFormatType[]>({
  formats,
  onColorChange,
  label,
}: ColorPickerProps<T>) {
  return (
    <div>
      <label>{label}</label>
      <ZColorPicker
        formats={formats}
        onChange={onColorChange}
        showBrightnessBar={true}
        showColorRings={true}
      />
    </div>
  );
}

// Example 6: Usage of the generic component
function GenericUsageExample() {
  const handleHexColor = (color: { hex: string }) => {
    console.log("Hex color:", color.hex);
  };

  const handleMultipleFormats = (color: ZColorResult<["rgba", "hsl"]>) => {
    console.log("RGBA:", color.rgba);
    console.log("HSL:", color.hsl);
  };

  return (
    <div>
      <GenericColorPicker
        formats={["hex"]}
        onColorChange={handleHexColor}
        label="Hex Color Picker"
      />

      <GenericColorPicker
        formats={["rgba", "hsl"]}
        onColorChange={handleMultipleFormats}
        label="Multi-format Color Picker"
      />
    </div>
  );
}

// Example 7: Color manipulation utility functions (demonstration of type usage)
const colorUtilities = {
  // Convert RGBA to RGB
  rgbaToRgb: (rgba: {
    r: number;
    g: number;
    b: number;
    a: number;
  }): { r: number; g: number; b: number } => {
    return { r: rgba.r, g: rgba.g, b: rgba.b };
  },

  // Add alpha to RGB
  addAlphaToRgb: (
    rgb: { r: number; g: number; b: number },
    alpha: number
  ): { r: number; g: number; b: number; a: number } => {
    return { ...rgb, a: alpha };
  },

  // Add alpha to HSV
  addAlphaToHsv: (
    hsv: { h: number; s: number; v: number },
    alpha: number
  ): { h: number; s: number; v: number; a: number } => {
    return { ...hsv, a: alpha };
  },
};

// Example 8: Complete demo with all types
export default function TypesDemo() {
  const [selectedColor, setSelectedColor] = useState<{
    r: number;
    g: number;
    b: number;
    a: number;
  }>({
    r: 255,
    g: 100,
    b: 50,
    a: 0.8,
  });

  // Type-safe color change handler
  const handleColorChange = (
    color: ZColorResult<["rgba", "hex", "hsl", "hsv"]>
  ) => {
    setSelectedColor(color.rgba);

    // All these are type-safe
    console.log("Hex:", color.hex); // string
    console.log("RGBA:", color.rgba); // { r: number; g: number; b: number; a: number }
    console.log("HSL:", color.hsl); // { h: number; s: number; l: number }
    console.log("HSV:", color.hsv); // { h: number; s: number; v: number }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Z Color Picker - TypeScript Types Demo</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2>Main Color Picker</h2>
        <ZColorPicker
          size={280}
          initialColor={selectedColor}
          formats={["rgba", "hex", "hsl", "hsv"]}
          onChange={handleColorChange}
          showEyedropper={true}
          showBrightnessBar={true}
          showColorRings={true}
          pickerBgColor="#f8f9fa"
        />
      </div>

      <div
        style={{
          backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a})`,
          padding: "1rem",
          borderRadius: "8px",
          color: "white",
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        <h3>Selected Color Information</h3>
        <p>
          <strong>RGBA:</strong> {selectedColor.r}, {selectedColor.g},{" "}
          {selectedColor.b}, {selectedColor.a.toFixed(2)}
        </p>
        <p>
          <strong>CSS:</strong> rgba({selectedColor.r}, {selectedColor.g},{" "}
          {selectedColor.b}, {selectedColor.a})
        </p>
      </div>

      <BasicExample />
      <SingleFormatExample />
      <MultipleFormatsExample />
      <ColorSpaceExample />
      <GenericUsageExample />

      {/* Demonstrate utility functions */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Color Utilities Example</h3>
        <p>
          RGBA to RGB: {JSON.stringify(colorUtilities.rgbaToRgb(selectedColor))}
        </p>
        <p>
          Add Alpha to RGB:{" "}
          {JSON.stringify(
            colorUtilities.addAlphaToRgb({ r: 255, g: 100, b: 50 }, 0.5)
          )}
        </p>
      </div>
    </div>
  );
}
