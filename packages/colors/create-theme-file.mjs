import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import * as tokensUtils from "./tokens.mjs";

/**
 * @param {Record<string, string>} variables
 * @returns {string}
 */
function template(variables) {
  return `:root {
          ${variables}
    }`;
}

/**
 * @param {Record<string, string>} variables
 * @returns {string}
 */
function normalizeCSSVariablesContent(variables = {}) {
  let str = "";
  for (const cssVar in variables) {
    str += `${cssVar}: ${variables[cssVar]};\n`;
  }
  return str;
}

/**
 * Generates a `colors.css` file containing `:root`-scoped MD3 color tokens
 * derived from the given source color and scheme.
 *
 * @param {{ scheme?: "light" | "dark", sourceColor?: string, output?: string }} [config]
 * @param {string} [config.sourceColor="#1D5D78"] - Seed color as a hex string.
 * @param {"light" | "dark"} [config.scheme="light"] - Color scheme variant.
 * @param {string} [config.output] - Absolute or relative output path for the CSS file.
 *   Defaults to `colors.css` next to this module.
 * @returns {void}
 *
 * @example
 * import { generateCSSFile } from "@symblight/md-colors";
 * generateCSSFile({ sourceColor: "#6750A4", scheme: "dark", output: "./theme/colors.css" });
 */
export function generateCSSFile(config = {}) {
  const { scheme = "light", sourceColor = "#1D5D78", output } = config;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = output
    ? path.resolve(output)
    : path.join(__dirname, "colors.css");

  const tokens = tokensUtils.generateTokens({ scheme, sourceColor });
  const stringTokens = normalizeCSSVariablesContent(tokens);
  const themeBody = template(stringTokens);

  fs.writeFile(outputPath, themeBody, (err) => {
    if (err) {
      console.error(err);
    }
  });
}
