import * as tokensUtils from "./tokens.mjs";

/** @typedef {import("./tokens.mjs").ColorScheme} ColorScheme */

/**
 * Options for {@link generateTheme}.
 * @typedef {object} ThemeOptions
 * @property {string} [sourceColor="#1D5D78"] - Seed color as a hex string (e.g. `"#6750A4"`).
 * @property {ColorScheme} [scheme="light"] - Color scheme variant.
 */

/**
 * Generates Material Design 3 color tokens from a source color and injects
 * them as CSS custom properties on `:root` (`document.documentElement`).
 *
 * Existing inline values on `:root` are overwritten; other properties are
 * left untouched.
 *
 * @param {ThemeOptions} [options]
 * @returns {void}
 * @throws {TypeError} If `sourceColor` is not a hex color or `scheme` is not `"light"` / `"dark"`.
 *
 * @example
 * import { generateTheme } from "@symblight/md-colors/client";
 * generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
 */
export function generateTheme(options = {}) {
  const tokens = tokensUtils.generateTokens(options);

  const root = document.documentElement;
  for (const [variable, value] of Object.entries(tokens)) {
    root.style.setProperty(variable, value);
  }
}
