import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { generateCSSFile } from "../create-theme-file.mjs";

describe("generateCSSFile", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "md-colors-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writes a CSS file to the given output path", (done) => {
    const output = path.join(tmpDir, "colors.css");
    generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output });

    setTimeout(() => {
      expect(fs.existsSync(output)).toBe(true);
      done();
    }, 100);
  });

  it("output contains :root block", (done) => {
    const output = path.join(tmpDir, "colors.css");
    generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output });

    setTimeout(() => {
      const content = fs.readFileSync(output, "utf8");
      expect(content).toMatch(/:root\s*\{/);
      done();
    }, 100);
  });

  it("output contains --md-sys-color-* variables", (done) => {
    const output = path.join(tmpDir, "colors.css");
    generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output });

    setTimeout(() => {
      const content = fs.readFileSync(output, "utf8");
      expect(content).toMatch(/--md-sys-color-primary:/);
      expect(content).toMatch(/--md-sys-color-surface:/);
      done();
    }, 100);
  });

  it("values are oklch color strings", (done) => {
    const output = path.join(tmpDir, "colors.css");
    generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output });

    setTimeout(() => {
      const content = fs.readFileSync(output, "utf8");
      expect(content).toMatch(/oklch\(/);
      done();
    }, 100);
  });

  it("dark scheme produces different output than light", (done) => {
    const lightOutput = path.join(tmpDir, "light.css");
    const darkOutput = path.join(tmpDir, "dark.css");

    generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output: lightOutput });
    generateCSSFile({ sourceColor: "#6750A4", scheme: "dark", output: darkOutput });

    setTimeout(() => {
      const light = fs.readFileSync(lightOutput, "utf8");
      const dark = fs.readFileSync(darkOutput, "utf8");
      expect(light).not.toBe(dark);
      done();
    }, 100);
  });

  it("uses default sourceColor and scheme when called with no args", (done) => {
    const output = path.join(tmpDir, "default.css");
    generateCSSFile({ output });

    setTimeout(() => {
      expect(fs.existsSync(output)).toBe(true);
      done();
    }, 100);
  });
});
