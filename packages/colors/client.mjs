import * as tokensUtils from "./tokens.mjs";

/**
 * Generates Material Design 3 color tokens from a source color and injects
 * them as CSS custom properties on `:root` (`document.documentElement`).
 *
 * @param {{ sourceColor: string, scheme?: "light" | "dark" }} [options]
 * @param {string} options.sourceColor - Seed color as a hex string (e.g. `"#6750A4"`).
 * @param {"light" | "dark"} [options.scheme="light"] - Color scheme variant.
 * @returns {void}
 *
 * @example
 * import { generateTheme } from "@symblight/md-colors/client";
 * generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
 *
 */
export function generateTheme({ sourceColor, scheme = "light" } = {}) {
  const tokens = tokensUtils.generateTokens({ sourceColor, scheme });

  const root = document.documentElement;
  for (const [variable, value] of Object.entries(tokens)) {
    root.style.setProperty(variable, value);
  }
}
