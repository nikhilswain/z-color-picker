# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
