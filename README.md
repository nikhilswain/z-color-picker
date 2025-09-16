# Z Color Picker

An enhanced, performant, and cross-device compatible React color picker with HSV color space, eyedropper support, and flexible format output.

## Features

- 🎨 **HSV Color Space**: More intuitive color selection with hue, saturation, and value
- 🎯 **Cross-Device Eyedropper**: Native EyeDropper API with fallbacks for all devices (tablets, stylus, touch)
- 📱 **Touch-Friendly**: Optimized for desktop, mobile, and tablet use
- 🔥 **High Performance**: Canvas-based rendering with high-DPI support and anti-aliasing
- 📦 **Flexible Output**: Support for multiple color formats (hex, rgb, hsl, hsv, with alpha)
- 🎭 **Professional Layout**: Eyedropper + color rings + brightness bar
- 🌈 **Color Presets**: Built-in color palette with active state highlighting
- ⚡ **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install z-color-picker
```

## Quick Start

```tsx
import { ZColorPicker } from "z-color-picker";
import "z-color-picker/styles"; // Import the CSS styles

function App() {
  const handleColorChange = (colorResult) => {
    console.log("Selected color:", colorResult);
  };

  return (
    <ZColorPicker
      size={300}
      initialColor="#ff5733"
      onColorChange={handleColorChange}
      showEyedropper={true}
    />
  );
}
```

### CSS Import Options

The component requires CSS styles to work properly. You have several options to import them:

**Option 1: Named import (recommended)**

```tsx
import "z-color-picker/styles";
```

**Option 2: Direct CSS import**

```tsx
import "z-color-picker/dist/z-color-picker.css";
```

**Option 3: In your CSS file**

```css
@import "z-color-picker/styles";
/* or */
@import "z-color-picker/dist/z-color-picker.css";
```

> **Note**: The CSS file (~1.8KB) contains only the utility classes used by the color picker component. No additional Tailwind CSS setup is required in your project.

### For Developers: CSS Maintenance

If you modify the component and add/remove Tailwind classes:

1. **Update classes in component**: Add or remove classes in `src/components/ZColorPicker.tsx`
2. **Update minimal.css**: Add any new utility classes to `src/styles/minimal.css`
3. **Rebuild CSS**: Run `npm run build:css-optimized` to extract classes and update the optimized CSS
4. **Build library**: Run `npm run build:lib` to build the complete library

The CSS build process automatically scans the component file and extracts all used Tailwind classes to keep the bundle minimal.

## Color Format Examples

### Single Format Output

```tsx
// Hex string output
<ZColorPicker
  formats={["hex"]}
  onChange={(color: string) => console.log(color)} // "#ff6432"
/>

// RGB object output
<ZColorPicker
  formats={["rgb"]}
  onChange={(color: { r: number; g: number; b: number }) => console.log(color)}
/>
```

### Multiple Format Output

```tsx
<ZColorPicker
  formats={["hex", "rgb", "hsl"]}
  onChange={(color) => {
    console.log(color.hex); // "#ff6432"
    console.log(color.rgb); // { r: 255, g: 100, b: 50 }
    console.log(color.hsl); // { h: 15, s: 80, l: 60 }
  }}
/>
```

## Props

| Prop                | Type                                             | Default                        | Description                        |
| ------------------- | ------------------------------------------------ | ------------------------------ | ---------------------------------- |
| `size`              | `number`                                         | `300`                          | Size of the color picker in pixels |
| `initialColor`      | `{ r: number; g: number; b: number; a: number }` | `{ r: 255, g: 0, b: 0, a: 1 }` | Initial color value                |
| `onChange`          | `function`                                       | -                              | Callback fired when color changes  |
| `showEyedropper`    | `boolean`                                        | `false`                        | Show eyedropper tool               |
| `showBrightnessBar` | `boolean`                                        | `false`                        | Show brightness/value slider       |
| `showColorRings`    | `boolean`                                        | `false`                        | Show color preset rings            |
| `colorRingsPalette` | `string[]`                                       | Default palette                | Custom color palette for rings     |
| `formats`           | `string[]`                                       | -                              | Output color formats               |

## Format Types

- `"hex"` - Hexadecimal string (e.g., "#ff6432")
- `"rgb"` - RGB object (e.g., { r: 255, g: 100, b: 50 })
- `"rgba"` - RGBA object with alpha (e.g., { r: 255, g: 100, b: 50, a: 0.8 })
- `"hsl"` - HSL object (e.g., { h: 15, s: 80, l: 60 })
- `"hsla"` - HSLA object with alpha (e.g., { h: 15, s: 80, l: 60, a: 0.8 })
- `"hsv"` - HSV object (e.g., { h: 15, s: 80, v: 100 })
- `"hsva"` - HSVA object with alpha (e.g., { h: 15, s: 80, v: 100, a: 0.8 })

## Cross-Device Support

The eyedropper feature works across all devices:

- **Desktop**: Native EyeDropper API (Chrome, Edge)
- **Unsupported Browsers**: Screen capture with canvas sampling
- **Touch Devices**: Touch events for tablet/phone interaction
- **Stylus/Pen**: Pointer events for precise selection
- **Keyboard**: Enter to pick center, Escape to cancel

## Styling

The component uses Tailwind CSS classes. Make sure you have Tailwind CSS installed and configured in your project, or override the styles as needed.

## TypeScript

Full TypeScript support is included:

```tsx
import { ZColorPicker, type ZColorResult } from "z-color-picker";

// Type-safe color handling
const handleColorChange = (color: ZColorResult<["hex", "rgb"]>) => {
  console.log(color.hex); // string
  console.log(color.rgb); // { r: number; g: number; b: number }
};
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
