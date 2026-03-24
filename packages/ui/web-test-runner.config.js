import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";

// Transforms `import icon from "./foo.svg?raw"` → plain string default export
function svgRawPlugin() {
  return {
    name: "svg-raw",
    resolveMimeType(context) {
      if (
        context.path.endsWith(".svg") &&
        context.querystring.includes("raw")
      ) {
        return "js";
      }
    },
    async transform(context) {
      if (
        context.path.endsWith(".svg") &&
        context.querystring.includes("raw")
      ) {
        const escaped = context.body
          .replace(/\\/g, "\\\\")
          .replace(/`/g, "\\`")
          .replace(/\$\{/g, "\\${");
        return { body: `export default \`${escaped}\`;` };
      }
    },
  };
}

// Transforms `import styles from "./foo.css?inline"` → Lit CSSResult module
function cssInlinePlugin() {
  return {
    name: "css-inline",
    resolveMimeType(context) {
      if (
        context.path.endsWith(".css") &&
        context.querystring.includes("inline")
      ) {
        return "js";
      }
    },
    async transform(context) {
      if (
        context.path.endsWith(".css") &&
        context.querystring.includes("inline")
      ) {
        const escaped = context.body
          .replace(/\\/g, "\\\\")
          .replace(/`/g, "\\`")
          .replace(/\$\{/g, "\\${");
        return {
          body: `import { css } from "lit";\nexport default css\`${escaped}\`;`,
        };
      }
    },
  };
}

export default {
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    exclude: ["**/node_modules/**", "**/dist/**"],
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  files: ["components/**/*.spec.ts", "!node_modules/", "!.wireit/"],
  plugins: [
    svgRawPlugin(),
    cssInlinePlugin(),
    esbuildPlugin({ ts: true, tsconfig: "./tsconfig.json" }),
  ],
  browsers: [playwrightLauncher({ product: "chromium" })],
};
