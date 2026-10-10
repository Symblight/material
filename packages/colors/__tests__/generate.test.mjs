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

  it("writes a CSS file to the given output path", async () => {
    const output = path.join(tmpDir, "colors.css");
    await generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output });

    expect(fs.existsSync(output)).toBe(true);
  });

  it("output contains :root block", async () => {
    const output = path.join(tmpDir, "colors.css");
    await generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output });

    const content = fs.readFileSync(output, "utf8");
    expect(content).toMatch(/:root\s*\{/);
  });

  it("output contains --md-sys-color-* variables", async () => {
    const output = path.join(tmpDir, "colors.css");
    await generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output });

    const content = fs.readFileSync(output, "utf8");
    expect(content).toMatch(/--md-sys-color-primary:/);
    expect(content).toMatch(/--md-sys-color-surface:/);
  });

  it("values are oklch color strings", async () => {
    const output = path.join(tmpDir, "colors.css");
    await generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output });

    const content = fs.readFileSync(output, "utf8");
    expect(content).toMatch(/oklch\(/);
  });

  it("dark scheme produces different output than light", async () => {
    const lightOutput = path.join(tmpDir, "light.css");
    const darkOutput = path.join(tmpDir, "dark.css");

    await generateCSSFile({ sourceColor: "#6750A4", scheme: "light", output: lightOutput });
    await generateCSSFile({ sourceColor: "#6750A4", scheme: "dark", output: darkOutput });

    const light = fs.readFileSync(lightOutput, "utf8");
    const dark = fs.readFileSync(darkOutput, "utf8");
    expect(light).not.toBe(dark);
  });

  it("uses default sourceColor and scheme when called with no args", async () => {
    const output = path.join(tmpDir, "default.css");
    await generateCSSFile({ output });

    expect(fs.existsSync(output)).toBe(true);
  });

  it("resolves with the absolute output path", async () => {
    const output = path.join(tmpDir, "colors.css");
    await expect(generateCSSFile({ output })).resolves.toBe(path.resolve(output));
  });

  it("rejects when the file cannot be written", async () => {
    const output = path.join(tmpDir, "missing-dir", "colors.css");
    await expect(generateCSSFile({ output })).rejects.toThrow();
  });
});
