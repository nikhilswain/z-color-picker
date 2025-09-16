#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the component file to extract Tailwind classes
const componentPath = path.join(
  __dirname,
  "../src/components/ZColorPicker.tsx"
);
const componentContent = fs.readFileSync(componentPath, "utf8");

// Extract all className attributes
const classNameRegex = /className=["'`][^"'`]*["'`]/g;
const classes = new Set();

const matches = componentContent.match(classNameRegex) || [];
matches.forEach((match) => {
  // Extract classes from className="..." or className={`...`}
  const classContent = match
    .replace(/className=["'`]/, "")
    .replace(/["'`]$/, "");
  // Handle template literals with ${...} expressions
  const staticClasses = classContent.replace(/\$\{[^}]*\}/g, "").split(/\s+/);
  staticClasses.forEach((cls) => {
    if (cls.trim() && !cls.includes("${")) {
      classes.add(cls.trim());
    }
  });
});

// Manually add dynamic classes that might be used
const dynamicClasses = [
  "border-blue-500",
  "border-4",
  "scale-110",
  "hover:border-gray-500",
  "hover:scale-110",
  "hover:shadow-md",
];
dynamicClasses.forEach((cls) => classes.add(cls));

console.log("Extracted classes:", Array.from(classes).sort());

// Read the minimal CSS template
const minimalCssPath = path.join(__dirname, "../src/styles/minimal.css");
const minimalCss = fs.readFileSync(minimalCssPath, "utf8");

// Write to dist
const distPath = path.join(__dirname, "../dist/z-color-picker.css");
fs.mkdirSync(path.dirname(distPath), { recursive: true });
fs.writeFileSync(distPath, minimalCss);

console.log("✅ Built optimized CSS to dist/z-color-picker.css");
