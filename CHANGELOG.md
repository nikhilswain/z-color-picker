# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-09-23

### 🚀 Major Improvement - Required Formats Prop

#### Made `formats` Prop Required

- **BREAKING**: The `formats` prop is now **required** for better type safety and clarity
- **Eliminates confusion**: No more guessing what format the component will return
- **Better developer experience**: Clear, predictable API with explicit format specification
- **Improved TypeScript errors**: More helpful error messages when types don't match

#### Benefits

- **No more implicit defaults**: You explicitly choose what formats you want
- **Type safety**: Handler types must match the specified formats exactly
- **Clear intent**: Code is more readable and maintainable
- **Better IntelliSense**: IDE provides better autocomplete and error detection

### 🔄 Migration Guide

#### Before (v2.0.2 and earlier)

```tsx
// This was confusing - formats defaulted to ["rgba", "hsva"]
<ZColorPicker onChange={(color) => {
  // TypeScript error if you expected different format
  console.log(color.rgb); // ❌ Error: Property 'rgb' doesn't exist on type '{ rgba: RGBAColor; hsva: HSVAColor; }'
}} />

// The component would return { rgba: ..., hsva: ... } by default
<ZColorPicker
  // No formats prop = defaulted to ["rgba", "hsva"]
  onChange={(color) => {
    console.log(color.rgba); // ✅ This worked
    console.log(color.hsva); // ✅ This worked
    // But unclear to users what was available
  }}
/>
```

#### After (v2.2.0)

```tsx
// Now explicit and clear - you get exactly what you specify
<ZColorPicker
  formats={["rgb"]}  // ✅ Required: explicitly request RGB format
  onChange={(color: ZColorResult<["rgb"]>) => {
    console.log(color.rgb); // ✅ TypeScript knows this is { rgb: RGBColor }
  }}
/>

// For the old default behavior, be explicit
<ZColorPicker
  formats={["rgba", "hsva"]}  // ✅ Explicit: same as old default
  onChange={(color: ZColorResult<["rgba", "hsva"]>) => {
    console.log(color.rgba); // ✅ Works perfectly
    console.log(color.hsva); // ✅ Works perfectly
  }}
/>

// Single format with proper typing
<ZColorPicker
  formats={["hex"]}
  onChange={(color: ZColorResult<["hex"]>) => {
    console.log(color.hex); // ✅ "string" - perfectly typed
  }}
/>
```

### 📖 Common Format Combinations

```tsx
// Most common: RGBA for full color with alpha
<ZColorPicker formats={["rgba"]} onChange={(c) => c.rgba} />

// Web colors: Hex for CSS
<ZColorPicker formats={["hex"]} onChange={(c) => c.hex} />

// Design tools: HSV for color wheels
<ZColorPicker formats={["hsv"]} onChange={(c) => c.hsv} />

// Multiple outputs: Get all formats you need
<ZColorPicker
  formats={["hex", "rgba", "hsl"]}
  onChange={(c) => ({
    hex: c.hex,
    rgba: c.rgba,
    hsl: c.hsl
  })}
/>
```

## [2.0.0] - 2025-09-18

### 🚀 Major Changes

#### Removed Tailwind CSS Dependency

- **BREAKING**: Completely removed Tailwind CSS framework dependency
- Replaced with vanilla CSS utility classes (~1.7KB gzipped)
- Significant bundle size reduction and zero external CSS framework dependencies
- All visual appearance remains identical

#### Streamlined TypeScript API

- **BREAKING**: Removed individual color type exports to simplify the public API
- **Removed exports**: `RGBColor`, `RGBAColor`, `HSVColor`, `HSVAColor`, `HSLColor`
- **Kept essential exports**: `ZColorResult`, `ZColorPickerProps`, `ColorFormatType`
- Improved type safety and reduced API surface area

#### Consistent ZColorResult Behavior

- **BREAKING**: `ZColorResult<["format"]>` now always returns `{ format: ColorType }` instead of `ColorType` directly
- Provides consistent behavior between single and multiple format outputs
- Better TypeScript inference and developer experience

### ✨ Added

- Comprehensive vanilla CSS utility system replacing Tailwind classes
- New `pickerBgColor` prop for customizing picker background
- Enhanced documentation with detailed TypeScript usage examples
- Complete type examples in README with inline types

### 🔧 Changed

- Simplified CSS build process - now copies vanilla CSS directly
- Updated component implementation to match consistent type behavior
- Removed complex CSS generation script in favor of direct file copying
- Enhanced README with comprehensive API documentation

### 🗑️ Removed

- Tailwind CSS and all related dependencies (`tailwindcss`, `@tailwindcss/cli`)
- Complex CSS generation script (`scripts/generate-minimal-css.js`)
- Individual color type exports from public API
- PostCSS Tailwind plugin configuration

### 🐛 Fixed

- TypeScript type consistency issues with single format outputs
- Component implementation now matches type definitions exactly
- Build process simplified and more reliable

### 📖 Documentation

- Complete README rewrite with comprehensive usage examples
- Added detailed TypeScript type examples and best practices
- Updated installation and usage instructions
- Added cross-device compatibility documentation

### 🏗️ Technical Details

**Bundle Size Impact:**

- Before: ~45KB (with Tailwind CSS)
- After: ~1.7KB gzipped (vanilla CSS only)
- ~96% bundle size reduction

**Migration Guide:**
If you were importing individual color types, update your imports:

```typescript
// Before (no longer available)
import { RGBColor, HSVColor } from "@zzro/z-color-picker";

// After (use inline types)
type RGBColor = { r: number; g: number; b: number };
type HSVColor = { h: number; s: number; v: number };

// Or use the main result type
import { ZColorResult } from "@zzro/z-color-picker";
type SingleRGB = ZColorResult<["rgb"]>; // { rgb: { r: number; g: number; b: number } }
```

If you were using single format outputs, update your handlers:

```typescript
// Before
<ZColorPicker
  formats={["rgb"]}
  onChange={(color) => console.log(color.r, color.g, color.b)} // color was RGBColor directly
/>

// After
<ZColorPicker
  formats={["rgb"]}
  onChange={(result) => console.log(result.rgb.r, result.rgb.g, result.rgb.b)} // result is { rgb: RGBColor }
/>
```

## [1.0.6] - Previous Version

- Previous stable release with Tailwind CSS dependency
- Full feature set with complex type exports
- Larger bundle size but same functionality

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes
