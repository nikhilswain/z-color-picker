# Z Color Picker

An enhanced, performant, and cross-device compatible React color picker with HSV color space, eyedropper support, and flexible format output.

![Z Color Picker Demo](https://img.shields.io/badge/React-Color%20Picker-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Full%20Support-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- 🎨 **HSV Color Space**: More intuitive color selection with hue, saturation, and value
- 🎯 **Cross-Device Eyedropper**: Native EyeDropper API with fallbacks for all devices
- 📱 **Touch-Friendly**: Optimized for desktop, mobile, tablets, and stylus input
- 🔥 **High Performance**: Canvas-based rendering with high-DPI support and anti-aliasing
- 📦 **Flexible Output**: Support for multiple color formats (hex, rgb, hsl, hsv, with alpha)
- 🎭 **Professional Layout**: Eyedropper + color rings + brightness bar
- 🌈 **Color Presets**: Built-in color palette with active state highlighting
- ⚡ **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🎨 **Customizable**: Background colors, palettes, and layout options

## 📦 Installation

```bash
npm install @zzro/z-color-picker
```

## 🚀 Quick Start

```tsx
import { ZColorPicker } from "@zzro/z-color-picker";
import "@zzro/z-color-picker/styles"; // Import the CSS styles

function App() {
  const handleColorChange = (color) => {
    console.log("Selected color:", color);
  };

  return (
    <ZColorPicker
      size={300}
      initialColor={{ r: 255, g: 100, b: 50, a: 1 }}
      onChange={handleColorChange}
      showEyedropper={true}
      showBrightnessBar={true}
      showColorRings={true}
    />
  );
}
```

### CSS Import

The component requires CSS styles to work properly. Import them using one of these methods:

```tsx
// Method 1: Package export (recommended)
import "@zzro/z-color-picker/styles";

// Method 2: Direct CSS import
import "@zzro/z-color-picker/dist/z-color-picker.css";
```

```css
/* Method 3: In your CSS file */
@import "@zzro/z-color-picker/styles";
```

## 📚 API Reference

### Props

| Prop                | Type                               | Default                        | Description                        |
| ------------------- | ---------------------------------- | ------------------------------ | ---------------------------------- |
| `size`              | `number`                           | `300`                          | Size of the color picker in pixels |
| `initialColor`      | `RGBAColor`                        | `{ r: 255, g: 0, b: 0, a: 1 }` | Initial color value                |
| `onChange`          | `(color: ZColorResult<T>) => void` | -                              | Callback fired when color changes  |
| `showEyedropper`    | `boolean`                          | `false`                        | Show eyedropper tool               |
| `showBrightnessBar` | `boolean`                          | `false`                        | Show brightness/value slider       |
| `showColorRings`    | `boolean`                          | `false`                        | Show color preset rings            |
| `pickerBgColor`     | `string`                           | `"#ffffff"`                    | Background color of the picker     |
| `colorRingsPalette` | `string[]`                         | Default palette                | Custom color palette for rings     |
| `formats`           | `ColorFormatType[]`                | `[]`                           | Output color formats               |

### Types

```typescript
// Essential types exported by the library
type ColorFormatType = "rgba" | "rgb" | "hex" | "hsl" | "hsla" | "hsv" | "hsva";

// ZColorResult provides type-safe results based on formats
type ZColorResult<T extends ColorFormatType[]> = /* ... */;

// Component props type
interface ZColorPickerProps<T extends ColorFormatType[]> = {
  size?: number;
  onChange?: (color: ZColorResult<T>) => void;
  initialColor?: { r: number; g: number; b: number; a: number };
  // ... other props
};
```

## 🎨 Usage Examples

### Importing Types

```tsx
import {
  ZColorPicker,
  type ZColorResult,
  type ZColorPickerProps,
  type ColorFormatType,
} from "@zzro/z-color-picker";
```

### Basic Usage

```tsx
// Simple color picker (returns merged RGBA + HSVA object by default)
<ZColorPicker onChange={(color) => console.log(color)} />
```

### Single Format Output

```tsx
// Hex string output
<ZColorPicker
  formats={["hex"]}
  onChange={(result) => console.log(result.hex)} // "#ff6432"
/>

// RGB object output
<ZColorPicker
  formats={["rgb"]}
  onChange={(result) => {
    console.log(`RGB: ${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b}`);
  }}
/>

// RGBA with alpha
<ZColorPicker
  formats={["rgba"]}
  onChange={(result) => {
    const { r, g, b, a } = result.rgba;
    console.log(`RGBA: ${r}, ${g}, ${b}, ${a}`);
  }}
/>
```

### Multiple Format Output

```tsx
<ZColorPicker
  formats={["hex", "rgb", "hsl"]}
  onChange={(result) => {
    console.log(result.hex); // "#ff6432"
    console.log(result.rgb); // { r: 255, g: 100, b: 50 }
    console.log(result.hsl); // { h: 15, s: 80, l: 60 }
  }}
/>
```

### Type-Safe Usage

```tsx
import { ZColorPicker, type ZColorResult } from "@zzro/z-color-picker";

function TypeSafeExample() {
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

  // Type-safe handler for multiple formats
  const handleChange = (result: ZColorResult<["hex", "rgba"]>) => {
    console.log(result.hex); // string
    console.log(result.rgba); // { r: number; g: number; b: number; a: number }
    setColor(result.rgba);
  };

  return (
    <ZColorPicker
      initialColor={color}
      formats={["hex", "rgba"]}
      onChange={handleChange}
    />
  );
}
```

### Generic Component with Type Constraints

```tsx
interface ColorPickerWrapperProps<T extends ColorFormatType[]> {
  formats: T;
  onColorChange: (color: ZColorResult<T>) => void;
  label: string;
}

function ColorPickerWrapper<T extends ColorFormatType[]>({
  formats,
  onColorChange,
  label,
}: ColorPickerWrapperProps<T>) {
  return (
    <div>
      <label>{label}</label>
      <ZColorPicker
        formats={formats}
        onChange={onColorChange}
        showBrightnessBar={true}
      />
    </div>
  );
}

// Usage with full type safety
const handleHexColor = (result: ZColorResult<["hex"]>) => {
  console.log(result.hex); // TypeScript knows this is a string
};

<ColorPickerWrapper
  formats={["hex"]}
  onColorChange={handleHexColor}
  label="Hex Color Picker"
/>;
```

### Professional Layout

```tsx
<ZColorPicker
  size={280}
  initialColor={{ r: 255, g: 100, b: 50, a: 0.8 }}
  formats={["hex", "rgba"]}
  onChange={(color) => {
    console.log("Hex:", color.hex);
    console.log("RGBA:", color.rgba);
  }}
  showEyedropper={true}
  showBrightnessBar={true}
  showColorRings={true}
  pickerBgColor="#f8f9fa"
/>
```

### Custom Color Palette

```tsx
const customPalette = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];

<ZColorPicker
  showColorRings={true}
  colorRingsPalette={customPalette}
  onChange={(color) => console.log(color)}
/>;
```

### React State Integration

```tsx
import { useState } from "react";
import { ZColorPicker, type RGBAColor } from "@zzro/z-color-picker";

function ColorDemo() {
  const [color, setColor] = useState<RGBAColor>({
    r: 255,
    g: 100,
    b: 50,
    a: 1,
  });

  return (
    <div
      style={{
        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <ZColorPicker
        initialColor={color}
        formats={["rgba"]}
        onChange={(newColor) => setColor(newColor)}
        showEyedropper={true}
        showBrightnessBar={true}
        showColorRings={true}
      />

      <div style={{ marginTop: "1rem", color: "white" }}>
        <p>
          R: {color.r}, G: {color.g}, B: {color.b}, A: {color.a.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
```

## 🌈 Color Format Guide

| Format   | Output Type      | Example                             | Description              |
| -------- | ---------------- | ----------------------------------- | ------------------------ |
| `"hex"`  | `string`         | `"#ff6432"`                         | Hexadecimal color string |
| `"rgb"`  | `{ r, g, b }`    | `{ r: 255, g: 100, b: 50 }`         | RGB values (0-255)       |
| `"rgba"` | `{ r, g, b, a }` | `{ r: 255, g: 100, b: 50, a: 0.8 }` | RGB with alpha (0-1)     |
| `"hsl"`  | `{ h, s, l }`    | `{ h: 15, s: 80, l: 60 }`           | HSL values               |
| `"hsla"` | `{ h, s, l, a }` | `{ h: 15, s: 80, l: 60, a: 0.8 }`   | HSL with alpha           |
| `"hsv"`  | `{ h, s, v }`    | `{ h: 15, s: 80, v: 100 }`          | HSV values               |
| `"hsva"` | `{ h, s, v, a }` | `{ h: 15, s: 80, v: 100, a: 0.8 }`  | HSV with alpha           |

### Default Behavior (No formats specified)

When no `formats` prop is provided, the component returns a merged object with both RGBA and HSVA:

```tsx
<ZColorPicker
  onChange={(color) => {
    // color contains: { r, g, b, a, h, s, v }
    console.log(color.r, color.g, color.b, color.a); // RGBA values
    console.log(color.h, color.s, color.v); // HSV values
  }}
/>
```

## 📱 Cross-Device Support

The eyedropper feature works across all devices with intelligent fallbacks:

### Desktop Browsers

- **Chrome/Edge**: Native EyeDropper API for system-wide color picking
- **Firefox/Safari**: Screen capture with canvas-based pixel sampling

### Mobile & Tablet

- **Touch Events**: Optimized touch interaction for mobile devices
- **Pointer Events**: Full stylus and pen support for tablets
- **Fallback**: Native color input as final fallback

### Keyboard Support

- **Enter**: Pick color from screen center
- **Escape**: Cancel eyedropper mode

## 🎨 Styling & Customization

### Background Colors

```tsx
// Light theme
<ZColorPicker pickerBgColor="#ffffff" />

// Dark theme
<ZColorPicker pickerBgColor="#1a1a1a" />

// Transparent
<ZColorPicker pickerBgColor="transparent" />
```

### CSS Customization

Override component styles with higher specificity:

```css
/* Custom picker size */
.z-color-picker canvas {
  border: 2px solid #e2e8f0;
}

/* Custom button styles */
.z-color-picker button {
  border-radius: 8px;
}

/* Custom color rings */
.z-color-picker .w-6.h-6 {
  width: 2rem;
  height: 2rem;
}
```

## ⚡ TypeScript Usage

### Type-Safe Color Handling

```tsx
import { ZColorPicker, type ZColorResult, type RGBAColor } from "@zzro/z-color-picker";

// Single format - direct type
const handleHexChange = (color: string) => {
  console.log("Hex color:", color);
};

// Multiple formats - object type
const handleMultipleFormats = (color: ZColorResult<["hex", "rgba"]>) => {
  console.log(color.hex);   // string
  console.log(color.rgba);  // RGBAColor
};

// Component usage
<ZColorPicker
  formats={["hex"]}
  onChange={handleHexChange}
/>

<ZColorPicker
  formats={["hex", "rgba"]}
  onChange={handleMultipleFormats}
/>
```

### Generic Type Constraints

```tsx
// Constrain formats to specific types
function ColorPicker<T extends ["hex"] | ["rgba"] | ["hex", "rgba"]>({
  formats,
  onChange,
}: {
  formats: T;
  onChange: (color: ZColorResult<T>) => void;
}) {
  return <ZColorPicker formats={formats} onChange={onChange} />;
}
```

## 🏗️ Architecture

### No Framework Dependencies

- **Vanilla CSS**: No Tailwind, Bootstrap, or other CSS frameworks required
- **Pure React**: Only React as peer dependency
- **Lightweight**: Minimal bundle size with tree-shakeable exports

### Performance Optimizations

- **Canvas Rendering**: High-performance color wheel with anti-aliasing
- **Memoized Calculations**: Optimized re-renders with React.useMemo
- **High-DPI Support**: Crisp rendering on retina displays
- **Touch Optimized**: Responsive interaction for all input types

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/nikhilswain/z-color-picker.git
cd z-color-picker
npm install
npm run dev
```

### Build Library

```bash
npm run build:lib
```

## 📄 License

MIT © [nikhilswain](https://github.com/nikhilswain)

---

**Made with ❤️ for the React community**
