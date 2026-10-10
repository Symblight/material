import {
  argbFromHex,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeTonalSpot,
  Hct,
} from "@material/material-color-utilities";
import { converter, formatCss } from "culori";

/**
 * Color scheme variant.
 * @typedef {"light" | "dark"} ColorScheme
 */

/**
 * Options for {@link generateTokens}.
 * @typedef {object} TokenConfig
 * @property {string} sourceColor - Seed color as a hex string (e.g. `"#6750A4"`).
 * @property {ColorScheme} scheme - Color scheme variant.
 */

/**
 * Map of `--md-sys-color-*` CSS custom property names to oklch color strings.
 * @typedef {Record<string, string>} ColorTokens
 */

/**
 * Converts an sRGB hex string to a culori oklch color object.
 * @type {(color: string) => { mode: "oklch", l: number, c: number, h?: number, alpha?: number } | undefined}
 */
let oklch = converter("oklch");

/** Seed color used when none is given. */
export const DEFAULT_SOURCE_COLOR = "#1D5D78";

/** Matches `#rgb` and `#rrggbb` hex colors. */
const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * MD3 color roles emitted as tokens, in output order. Names match the static
 * members of {@link MaterialDynamicColors} and are kebab-cased into
 * `--md-sys-color-*` names. `background`, `onBackground` and `surfaceVariant`
 * are deprecated in M3 but kept for compatibility.
 *
 * @see https://m3.material.io/styles/color/roles
 */
const COLOR_ROLES = /** @type {const} */ ([
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "inversePrimary",
  "primaryFixed",
  "primaryFixedDim",
  "onPrimaryFixed",
  "onPrimaryFixedVariant",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "secondaryFixed",
  "secondaryFixedDim",
  "onSecondaryFixed",
  "onSecondaryFixedVariant",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "tertiaryFixed",
  "tertiaryFixedDim",
  "onTertiaryFixed",
  "onTertiaryFixedVariant",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "surfaceDim",
  "surfaceBright",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "surfaceTint",
  "inverseSurface",
  "inverseOnSurface",
  "outline",
  "outlineVariant",
  "shadow",
  "scrim",
  "background",
  "onBackground",
]);

/**
 * Validates and normalizes a partial token config, filling in defaults per
 * field. Accepts unchecked strings (e.g. CLI input).
 *
 * @param {{ sourceColor?: string, scheme?: string }} [config]
 * @returns {TokenConfig}
 * @throws {TypeError} If `sourceColor` is not a hex color or `scheme` is not `"light"` / `"dark"`.
 */
export function resolveConfig({ sourceColor = DEFAULT_SOURCE_COLOR, scheme = "light" } = {}) {
  if (typeof sourceColor !== "string" || !HEX_RE.test(sourceColor)) {
    throw new TypeError(`sourceColor must be a hex color like "#6750A4", got ${JSON.stringify(sourceColor)}`);
  }
  if (scheme !== "light" && scheme !== "dark") {
    throw new TypeError(`scheme must be "light" or "dark", got ${JSON.stringify(scheme)}`);
  }
  return { sourceColor, scheme: /** @type {ColorScheme} */ (scheme) };
}

/**
 * Converts a Material color scheme object into a map of CSS custom property
 * names to oklch color values.
 *
 * Each camelCase key is converted to kebab-case and prefixed with
 * `--md-sys-color-`. An optional suffix can be appended to the variable name.
 *
 * @param {Record<string, number>} scheme - Map of token names to ARGB integers.
 * @param {string} [suffix=""] - Optional suffix appended to every variable name.
 * @returns {ColorTokens} Map of CSS variable names to oklch strings.
 *
 * @example
 * const vars = setSchemeProperties({ primary: 0xff1d5d78 });
 * // { "--md-sys-color-primary": "oklch(…)" }
 */
export function setSchemeProperties(scheme, suffix = "") {
  /** @type {ColorTokens} */
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
 * Generates the full set of Material Design 3 color tokens for a given source
 * color and color scheme.
 *
 * Every role is resolved from a single tonal-spot {@link SchemeTonalSpot}
 * (the M3 default variant), so surface tones keep their spec ordering. All
 * color values are expressed as oklch CSS strings so they can be used directly
 * in `var(--md-sys-color-*)` declarations.
 *
 * @param {Partial<TokenConfig>} [config] - Missing fields default to
 *   `sourceColor: "#1D5D78"` and `scheme: "light"`.
 * @returns {ColorTokens} Map of CSS variable names to oklch color strings.
 * @throws {TypeError} If `sourceColor` is not a hex color or `scheme` is not `"light"` / `"dark"`.
 *
 * @example
 * const tokens = generateTokens({ sourceColor: "#6750A4", scheme: "dark" });
 * // { "--md-sys-color-primary": "oklch(…)", … }
 */
export function generateTokens(config = {}) {
  const { sourceColor, scheme } = resolveConfig(config);
  const dynamicScheme = new SchemeTonalSpot(
    Hct.fromInt(argbFromHex(sourceColor)),
    scheme === "dark",
    0
  );

  /** @type {Record<string, number>} */
  let palette = {};
  for (const role of COLOR_ROLES) {
    palette[role] = MaterialDynamicColors[role].getArgb(dynamicScheme);
  }

  return setSchemeProperties(palette);
}
