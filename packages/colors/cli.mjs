#!/usr/bin/env node

/**
 * `md-colors` CLI: writes a `:root` stylesheet of MD3 color tokens.
 *
 * Options:
 *   -c, --sourceColor  Seed color as a hex string (default: `#1D5D78`)
 *   -s, --scheme       `light` | `dark` (default: `light`)
 *   -o, --output       Output file path (default: `./colors.css`)
 *
 * @example
 * npx md-colors -c "#6750A4" -s dark -o ./theme/colors.css
 */

import { parseArgs } from "node:util";
import { generateCSSFile } from "./create-theme-file.mjs";
import { DEFAULT_SOURCE_COLOR, resolveConfig } from "./tokens.mjs";

const { values } = parseArgs({
  options: {
    sourceColor: { type: "string", short: "c", default: DEFAULT_SOURCE_COLOR },
    scheme: { type: "string", short: "s", default: "light" },
    output: { type: "string", short: "o", default: "./colors.css" },
  },
});

const { output } = values;

try {
  const { sourceColor, scheme } = resolveConfig(values);
  const outputPath = await generateCSSFile({ sourceColor, scheme, output });
  console.log(`Generated ${outputPath} (sourceColor: ${sourceColor}, scheme: ${scheme})`);
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
