import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import {
  argbFromHex,
  themeFromSourceColor,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeContent,
  Hct,
} from "@material/material-color-utilities";
import { converter, formatCss } from "culori";

let oklch = converter("oklch");

// Get the theme from a hex color

// Print out the theme as JSON
function setSchemeProperties(scheme, suffix = "") {
  let result = {};
  for (const [key, value] of Object.entries(scheme)) {
    const token = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    const color = hexFromArgb(value);
    const converted = oklch(color);
    const name = formatCss(converted);
    const variableName = `--md-sys-color-${token}${suffix}`;
    result[variableName] = name;
  }

  return result;
}

function template(variables) {
  return `:root {
          ${variables}
    }`;
}

function normalizeCSSVariablesContent(variables = {}) {
  let str = "";

  for (const cssVar in variables) {
    str += `${cssVar}: ${variables[cssVar]};\n`;
  }

  return str;
}

const materialColors = {
  "surface-container-highest": MaterialDynamicColors.surfaceContainerHighest,
  "surface-container-high": MaterialDynamicColors.surfaceContainerHigh,
  "surface-dim": MaterialDynamicColors.surfaceDim,
  "surface-bright": MaterialDynamicColors.surfaceBright,
  "surface-container-lowest": MaterialDynamicColors.surfaceContainerLowest,
  "surface-container-low": MaterialDynamicColors.surfaceContainerLow,
};

function generateCSSFile() {
  const theme = themeFromSourceColor(argbFromHex("#54a0ff"), []);

  const scheme = new SchemeContent(
    Hct.fromInt(argbFromHex("#54a0ff")),
    false,
    0
  );
  let palette = {};
  for (const [key, value] of Object.entries(materialColors)) {
    palette[key] = value.getArgb(scheme);
  }
  const currentTheme = theme.schemes.light.toJSON();
  const tokens = setSchemeProperties({ ...currentTheme, ...palette });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.resolve(__dirname, "./");

  const content = normalizeCSSVariablesContent(tokens);
  const themeBody = template(content);

  fs.writeFile(path.join(outputPath, "colors.css"), themeBody, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}
generateCSSFile();
