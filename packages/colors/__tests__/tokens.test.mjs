import { converter } from "culori";
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

  it("fills in missing config fields with defaults", () => {
    expect(generateTokens({ scheme: "dark" })).toEqual(
      generateTokens({ sourceColor: "#1D5D78", scheme: "dark" })
    );
    expect(generateTokens({ sourceColor: SOURCE_COLOR })).toEqual(
      generateTokens({ sourceColor: SOURCE_COLOR, scheme: "light" })
    );
  });

  it("throws a TypeError for an invalid source color", () => {
    expect(() => generateTokens({ sourceColor: "purple" })).toThrow(TypeError);
  });

  it("throws a TypeError for an invalid scheme", () => {
    expect(() => generateTokens({ scheme: "sepia" })).toThrow(TypeError);
  });

  it("includes every MD3 color role", () => {
    const keys = Object.keys(generateTokens({ sourceColor: SOURCE_COLOR }));
    const roles = [
      "surface-container",
      "surface-tint",
      ...["primary", "secondary", "tertiary"].flatMap((c) => [
        `${c}-fixed`,
        `${c}-fixed-dim`,
        `on-${c}-fixed`,
        `on-${c}-fixed-variant`,
      ]),
    ];
    for (const role of roles) {
      expect(keys).toContain(`--md-sys-color-${role}`);
    }
    expect(keys).toHaveLength(49);
  });

  it.each(["light", "dark"])("keeps surface tones in spec order (%s)", (scheme) => {
    const tokens = generateTokens({ sourceColor: SOURCE_COLOR, scheme });
    const lightness = (role) => converter("oklch")(tokens[`--md-sys-color-${role}`]).l;

    expect(lightness("surface-dim")).toBeLessThanOrEqual(lightness("surface"));
    expect(lightness("surface")).toBeLessThanOrEqual(lightness("surface-bright"));

    // Containers step away from the background: darker in light, lighter in dark.
    const containers = ["lowest", "low", "", "high", "highest"].map((level) =>
      lightness(level ? `surface-container-${level}` : "surface-container")
    );
    for (let i = 1; i < containers.length; i++) {
      if (scheme === "light") expect(containers[i]).toBeLessThan(containers[i - 1]);
      else expect(containers[i]).toBeGreaterThan(containers[i - 1]);
    }
  });
});
