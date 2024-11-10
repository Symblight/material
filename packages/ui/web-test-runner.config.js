import { playwrightLauncher } from "@web/test-runner-playwright";
import { vitePlugin } from "@remcovaes/web-test-runner-vite-plugin";

export default {
  nodeResolve: true, // Resolves Node.js-style module imports
  coverage: true, // Enables coverage reporting

  files: ["**/*test.ts", "!node_modules/", "!.wireit/"],
  plugins: [vitePlugin()],

  browsers: [
    playwrightLauncher({ product: "chromium" }), // Test in Chromium (can add firefox or webkit here)
  ],
  setupFiles: ["test/setupJest.js"],
};
