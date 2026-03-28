import { generateTokens, setSchemeProperties } from "../tokens.mjs";

const SOURCE_COLOR = "#6750A4";
const CSS_VAR_RE = /^--md-sys-color-[a-z0-9-]+$/;
const OKLCH_RE = /^oklch\(/;

describe("setSchemeProperties", () => {
  it("returns an empty object for an empty scheme", () => {
    expect(setSchemeProperties({})).toEqual({});
  });

  it("converts camelCase keys to kebab-case CSS variable names", () => {
    const result = setSchemeProperties({ primary: 0xff1d5d78 });
    expect(Object.keys(result)).toContain("--md-sys-color-primary");
  });

  it("converts nested camelCase to kebab-case", () => {
    const result = setSchemeProperties({ onPrimaryContainer: 0xff000000 });
    expect(Object.keys(result)).toContain("--md-sys-color-on-primary-container");
  });

  it("appends suffix to variable names when provided", () => {
    const result = setSchemeProperties({ primary: 0xff1d5d78 }, "-dark");
    expect(Object.keys(result)).toContain("--md-sys-color-primary-dark");
  });

  it("produces oklch color values", () => {
    const result = setSchemeProperties({ primary: 0xff6750a4 });
    const value = result["--md-sys-color-primary"];
    expect(value).toMatch(OKLCH_RE);
  });
});

describe("generateTokens", () => {
  it("returns an object with CSS variable keys for light scheme", () => {
    const tokens = generateTokens({ sourceColor: SOURCE_COLOR, scheme: "light" });
    expect(typeof tokens).toBe("object");
    for (const key of Object.keys(tokens)) {
      expect(key).toMatch(CSS_VAR_RE);
    }
  });

  it("returns an object with CSS variable keys for dark scheme", () => {
    const tokens = generateTokens({ sourceColor: SOURCE_COLOR, scheme: "dark" });
    for (const key of Object.keys(tokens)) {
      expect(key).toMatch(CSS_VAR_RE);
    }
  });

  it("includes core MD3 tokens", () => {
    const tokens = generateTokens({ sourceColor: SOURCE_COLOR, scheme: "light" });
    const keys = Object.keys(tokens);
    expect(keys).toContain("--md-sys-color-primary");
    expect(keys).toContain("--md-sys-color-secondary");
    expect(keys).toContain("--md-sys-color-tertiary");
    expect(keys).toContain("--md-sys-color-background");
    expect(keys).toContain("--md-sys-color-surface");
    expect(keys).toContain("--md-sys-color-error");
  });

  it("includes surface container tokens from MaterialDynamicColors", () => {
    const tokens = generateTokens({ sourceColor: SOURCE_COLOR, scheme: "light" });
    const keys = Object.keys(tokens);
    expect(keys).toContain("--md-sys-color-surface-container-highest");
    expect(keys).toContain("--md-sys-color-surface-container-high");
    expect(keys).toContain("--md-sys-color-surface-dim");
    expect(keys).toContain("--md-sys-color-surface-bright");
    expect(keys).toContain("--md-sys-color-surface-container-lowest");
    expect(keys).toContain("--md-sys-color-surface-container-low");
  });

  it("all values are oklch color strings", () => {
    const tokens = generateTokens({ sourceColor: SOURCE_COLOR, scheme: "light" });
    for (const value of Object.values(tokens)) {
      expect(value).toMatch(OKLCH_RE);
    }
  });

  it("light and dark schemes produce different token values", () => {
    const light = generateTokens({ sourceColor: SOURCE_COLOR, scheme: "light" });
    const dark = generateTokens({ sourceColor: SOURCE_COLOR, scheme: "dark" });
    expect(light["--md-sys-color-primary"]).not.toBe(dark["--md-sys-color-primary"]);
  });

  it("different source colors produce different token values", () => {
    const a = generateTokens({ sourceColor: "#6750A4", scheme: "light" });
    const b = generateTokens({ sourceColor: "#1D5D78", scheme: "light" });
    expect(a["--md-sys-color-primary"]).not.toBe(b["--md-sys-color-primary"]);
  });

  it("uses defaults when called with no arguments", () => {
    const tokens = generateTokens();
    expect(Object.keys(tokens).length).toBeGreaterThan(0);
  });
});
