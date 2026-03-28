import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import * as tokensUtils from "./tokens.mjs";

function template(variables) {
  return `:root {
          ${variables}
    }`;
}

function normalizeCSSVariablesContent(variables = {}) {
  let str = "";

  for (const cssVar in variables) {
    str += `${cssVar}: ${variables[cssVar]};\n`;
  }

  return str;
}

function generateCSSFile(config = { scheme: "light", sourceColor: "#1D5D78" }) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.resolve(__dirname, "./");

  const tokens = tokensUtils.generateTokens(config);
  const stringTokens = normalizeCSSVariablesContent(tokens);
  const themeBody = template(stringTokens);

  fs.writeFile(path.join(outputPath, "colors.css"), themeBody, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}
generateCSSFile({ scheme: "dark", sourceColor: "#1D5D78" });
