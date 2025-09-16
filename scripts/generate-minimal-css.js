#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Scan component files to extract Tailwind classes
const componentPath = path.join(__dirname, "../src/components");
const extractedClasses = new Set();

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Extract className attributes with various quote types
  const classNameRegex = /className=["'`]([^"'`]*?)["'`]/g;
  const templateLiteralRegex = /className=\{`([^`]*?)`\}/g;

  let match;

  // Regular className="..." patterns
  while ((match = classNameRegex.exec(content)) !== null) {
    const classes = match[1].split(/\s+/);
    classes.forEach((cls) => {
      if (cls.trim() && !cls.includes("${")) {
        extractedClasses.add(cls.trim());
      }
    });
  }

  // Template literal className={`...`} patterns
  while ((match = templateLiteralRegex.exec(content)) !== null) {
    const staticParts = match[1].split(/\$\{[^}]*\}/);
    staticParts.forEach((part) => {
      const classes = part.split(/\s+/);
      classes.forEach((cls) => {
        if (cls.trim()) {
          extractedClasses.add(cls.trim());
        }
      });
    });
  }
}

// Recursively scan all component files
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.match(/\.(tsx|ts|jsx|js)$/)) {
      scanFile(filePath);
    }
  });
}

console.log("🔍 Scanning components for Tailwind classes...");
scanDirectory(componentPath);

// Add dynamic classes that might be used conditionally
const dynamicClasses = [
  "border-blue-500",
  "border-4",
  "hover:border-gray-500",
  "hover:scale-110",
  "hover:shadow-md",
  "hover:bg-blue-600",
];

dynamicClasses.forEach((cls) => extractedClasses.add(cls));

const allClasses = Array.from(extractedClasses).sort();
console.log(
  `📋 Found ${allClasses.length} classes:`,
  allClasses.slice(0, 10).join(", "),
  "..."
);

// Create a temporary HTML file with all extracted classes
// This tricks Tailwind into generating CSS for exactly these classes
const tempHtmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Extracted Classes</title>
</head>
<body>
  <!-- Auto-generated from component scanning -->
  <div class="${allClasses.join(" ")}"></div>
  
  <!-- Custom range slider class (not Tailwind) -->
  <input class="range-thumb" />
</body>
</html>`;

const tempHtmlPath = path.join(__dirname, "../temp-classes.html");
fs.writeFileSync(tempHtmlPath, tempHtmlContent);

console.log("📝 Created temporary HTML file with extracted classes");

// Create custom CSS for range slider (Tailwind doesn't have this)
const customCSS = `
/* Custom range slider styles */
.range-thumb {
  appearance: none;
  cursor: grab;
}

.range-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  cursor: grab;
  background: #fff;
  border: 2px solid #333;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.range-thumb::-moz-range-thumb {
  cursor: grab;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
`;

// Ensure dist directory exists
const distDir = path.join(__dirname, "../dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  // Create a minimal Tailwind input file (no base styles)
  const minimalInputCSS = `@tailwind utilities;`;
  const tempInputPath = path.join(__dirname, "../temp-input.css");
  fs.writeFileSync(tempInputPath, minimalInputCSS);

  // Use Tailwind CLI to generate CSS from the temporary HTML file
  console.log("⚡ Running Tailwind CLI to generate minimal CSS...");

  const tempCssPath = path.join(__dirname, "../temp-tailwind.css");
  const command = `npx tailwindcss -c tailwind.config.lib.js -i ${tempInputPath} -o ${tempCssPath} --content "${tempHtmlPath}" --minify`;

  execSync(command, {
    cwd: path.join(__dirname, ".."),
    stdio: ["inherit", "pipe", "inherit"],
  });

  // Read the generated Tailwind CSS
  const tailwindCSS = fs.readFileSync(tempCssPath, "utf8");

  // Combine custom CSS with Tailwind CSS
  const finalCSS = `/* Auto-generated minimal CSS for Z Color Picker Library */
/* Generated on: ${new Date().toISOString()} */
/* Classes found: ${allClasses.length} */

${customCSS}

${tailwindCSS}`;

  // Write final CSS
  const outputPath = path.join(distDir, "z-color-picker.css");
  fs.writeFileSync(outputPath, finalCSS);

  // Clean up temporary files
  fs.unlinkSync(tempHtmlPath);
  fs.unlinkSync(tempInputPath);
  fs.unlinkSync(tempCssPath);

  const stats = fs.statSync(outputPath);
  console.log(`✅ Generated minimal CSS: ${stats.size} bytes`);
  console.log(
    `📦 Reduction: ~${Math.round(
      ((15000 - stats.size) / 15000) * 100
    )}% smaller than full Tailwind`
  );
} catch (error) {
  console.error("❌ Error generating CSS:", error.message);

  // Clean up on error
  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
  const tempInputPath = path.join(__dirname, "../temp-input.css");
  if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
  const tempCssPath = path.join(__dirname, "../temp-tailwind.css");
  if (fs.existsSync(tempCssPath)) fs.unlinkSync(tempCssPath);

  process.exit(1);
}
