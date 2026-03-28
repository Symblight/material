import { jest } from "@jest/globals";

// Stub browser globals before importing the module
const setPropertyMock = jest.fn();

global.document = {
  documentElement: {
    style: {
      setProperty: setPropertyMock,
    },
  },
};

global.window = global;

await import("../client.mjs");

describe("window.generateTheme", () => {
  beforeEach(() => {
    setPropertyMock.mockClear();
  });

  it("is registered on window", () => {
    expect(typeof window.generateTheme).toBe("function");
  });

  it("calls setProperty for each token", () => {
    window.generateTheme({ sourceColor: "#6750A4", scheme: "light" });
    expect(setPropertyMock).toHaveBeenCalled();
  });

  it("sets CSS variable names starting with --md-sys-color-", () => {
    window.generateTheme({ sourceColor: "#6750A4", scheme: "light" });
    for (const [name] of setPropertyMock.mock.calls) {
      expect(name).toMatch(/^--md-sys-color-/);
    }
  });

  it("sets oklch values", () => {
    window.generateTheme({ sourceColor: "#6750A4", scheme: "light" });
    for (const [, value] of setPropertyMock.mock.calls) {
      expect(value).toMatch(/^oklch\(/);
    }
  });

  it("defaults scheme to light when not provided", () => {
    window.generateTheme({ sourceColor: "#6750A4" });
    expect(setPropertyMock).toHaveBeenCalled();
  });

  it("works with dark scheme", () => {
    window.generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
    expect(setPropertyMock).toHaveBeenCalled();
  });

  it("light and dark produce different primary values", () => {
    window.generateTheme({ sourceColor: "#6750A4", scheme: "light" });
    const lightCalls = setPropertyMock.mock.calls.slice();
    setPropertyMock.mockClear();

    window.generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
    const darkCalls = setPropertyMock.mock.calls.slice();

    const lightPrimary = lightCalls.find(([k]) => k === "--md-sys-color-primary")?.[1];
    const darkPrimary = darkCalls.find(([k]) => k === "--md-sys-color-primary")?.[1];
    expect(lightPrimary).not.toBe(darkPrimary);
  });
});
