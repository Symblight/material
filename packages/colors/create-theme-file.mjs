import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import * as tokensUtils from "./tokens.mjs";

/** @typedef {import("./tokens.mjs").ColorScheme} ColorScheme */
/** @typedef {import("./tokens.mjs").ColorTokens} ColorTokens */

/**
 * Options for {@link generateCSSFile}.
 * @typedef {object} CSSFileConfig
 * @property {string} [sourceColor="#1D5D78"] - Seed color as a hex string.
 * @property {ColorScheme} [scheme="light"] - Color scheme variant.
 * @property {string} [output] - Absolute or relative output path for the CSS file.
 *   Relative paths resolve against `process.cwd()`. Defaults to `colors.css`
 *   next to this module.
 */

/**
 * Wraps serialized declarations in a `:root` rule.
 *
 * @param {string} variables - Declarations produced by {@link normalizeCSSVariablesContent}.
 * @returns {string} A complete `:root { … }` rule.
 */
function template(variables) {
  return `:root {
          ${variables}
    }`;
}

/**
 * Serializes a token map into newline-separated CSS declarations.
 *
 * @param {ColorTokens} [variables={}] - Map of CSS variable names to values.
 * @returns {string} One `name: value;` declaration per line.
 *
 * @example
 * normalizeCSSVariablesContent({ "--md-sys-color-primary": "oklch(…)" });
 * // "--md-sys-color-primary: oklch(…);\n"
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
 * @param {CSSFileConfig} [config]
 * @returns {Promise<string>} Resolves with the absolute path of the written file.
 * @throws {TypeError} If `sourceColor` is not a hex color or `scheme` is not `"light"` / `"dark"`.
 *   Rejects if the file cannot be written.
 *
 * @example
 * import { generateCSSFile } from "@symblight/md-colors";
 * await generateCSSFile({ sourceColor: "#6750A4", scheme: "dark", output: "./theme/colors.css" });
 */
export async function generateCSSFile(config = {}) {
  const { output, ...tokenConfig } = config;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = output
    ? path.resolve(output)
    : path.join(__dirname, "colors.css");

  const tokens = tokensUtils.generateTokens(tokenConfig);
  const stringTokens = normalizeCSSVariablesContent(tokens);
  const themeBody = template(stringTokens);

  await fs.writeFile(outputPath, themeBody);
  return outputPath;
}
