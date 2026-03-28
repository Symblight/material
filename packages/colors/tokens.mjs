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

const materialColors = {
  "surface-container-highest": MaterialDynamicColors.surfaceContainerHighest,
  "surface-container-high": MaterialDynamicColors.surfaceContainerHigh,
  "surface-dim": MaterialDynamicColors.surfaceDim,
  "surface-bright": MaterialDynamicColors.surfaceBright,
  "surface-container-lowest": MaterialDynamicColors.surfaceContainerLowest,
  "surface-container-low": MaterialDynamicColors.surfaceContainerLow,
};

/**
 * Converts a Material color scheme object into a map of CSS custom property
 * names to oklch color values.
 *
 * Each camelCase key is converted to kebab-case and prefixed with
 * `--md-sys-color-`. An optional suffix can be appended to the variable name.
 *
 * @param {Record<string, number>} scheme - Map of token names to ARGB integers.
 * @param {string} [suffix=""] - Optional suffix appended to every variable name.
 * @returns {Record<string, string>} Map of CSS variable names to oklch strings.
 *
 * @example
 * const vars = setSchemeProperties({ primary: 0xff1d5d78 });
 * // { "--md-sys-color-primary": "oklch(…)" }
 */
export function setSchemeProperties(scheme, suffix = "") {
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

/**
 * Generates a full set of Material Design 3 color tokens for a given source
 * color and color scheme.
 *
 * Tokens cover the standard MD3 scheme palette plus additional surface
 * container roles provided by {@link MaterialDynamicColors}. All color values
 * are expressed as oklch CSS strings so they can be used directly in
 * `var(--md-sys-color-*)` declarations.
 *
 * @param {{ scheme?: "light" | "dark", sourceColor?: string }} [config]
 * @param {string} [config.sourceColor="#1D5D78"] - Seed color as a hex string (e.g. `"#6750A4"`).
 * @param {"light" | "dark"} [config.scheme="light"] - Color scheme variant.
 * @returns {Record<string, string>} Map of CSS variable names to oklch color strings.
 *
 * @example
 * const tokens = generateTokens({ sourceColor: "#6750A4", scheme: "dark" });
 * // { "--md-sys-color-primary": "oklch(…)", … }
 */
export function generateTokens(config = { scheme: "light", sourceColor: "#1D5D78" }) {
  const theme = themeFromSourceColor(argbFromHex(config.sourceColor), []);

  const scheme = new SchemeContent(
    Hct.fromInt(argbFromHex(config.sourceColor)),
    config.scheme === "dark",
    0
  );
  let palette = {};
  for (const [key, value] of Object.entries(materialColors)) {
    palette[key] = value.getArgb(scheme);
  }
  const currentTheme = theme.schemes[config.scheme].toJSON();
  const tokens = setSchemeProperties({ ...currentTheme, ...palette });

  return tokens;
}
