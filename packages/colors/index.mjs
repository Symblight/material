/**
 * Node entry point for `@symblight/md-colors`.
 * @module @symblight/md-colors
 */

/** @typedef {import("./tokens.mjs").ColorScheme} ColorScheme */
/** @typedef {import("./tokens.mjs").TokenConfig} TokenConfig */
/** @typedef {import("./tokens.mjs").ColorTokens} ColorTokens */
/** @typedef {import("./create-theme-file.mjs").CSSFileConfig} CSSFileConfig */

export { generateTokens, setSchemeProperties, DEFAULT_SOURCE_COLOR } from "./tokens.mjs";
export { generateCSSFile } from "./create-theme-file.mjs";
