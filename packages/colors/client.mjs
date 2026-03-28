import * as tokensUtils from "./tokens.mjs";

/**
 * Generates Material Design 3 color tokens from a source color and injects
 * them as CSS custom properties on `:root` (`document.documentElement`).
 *
 * After calling this function every `var(--md-sys-color-*)` token in the page
 * reflects the chosen color scheme derived from `sourceColor`.
 *
 * Exposed on `window` so it can be called from plain `<script>` tags or
 * browser DevTools without an import.
 *
 * @param {{ sourceColor: string, scheme?: "light" | "dark" }} [options]
 * @param {string} options.sourceColor - Seed color as a hex string (e.g. `"#6750A4"`).
 * @param {"light" | "dark"} [options.scheme="light"] - Color scheme variant.
 * @returns {void}
 *
 * @example
 * window.generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
 */
window.generateTheme = function ({ sourceColor, scheme = "light" } = {}) {
  const tokens = tokensUtils.generateTokens({
    sourceColor,
    scheme,
  });

  const root = document.documentElement;
  for (const [variable, value] of Object.entries(tokens)) {
    root.style.setProperty(variable, value);
  }
};
