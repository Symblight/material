#!/usr/bin/env node

import { parseArgs } from "node:util";
import { generateCSSFile } from "./create-theme-file.mjs";

const { values } = parseArgs({
  options: {
    sourceColor: { type: "string", short: "c", default: "#1D5D78" },
    scheme: { type: "string", short: "s", default: "light" },
    output: { type: "string", short: "o", default: "./colors.css" },
  },
});

const { sourceColor, scheme, output } = values;

if (scheme !== "light" && scheme !== "dark") {
  console.error(`Error: --scheme must be "light" or "dark", got "${scheme}"`);
  process.exit(1);
}

generateCSSFile({ sourceColor, scheme, output });
console.log(`Generated ${output} (sourceColor: ${sourceColor}, scheme: ${scheme})`);
