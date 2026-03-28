import { jest } from "@jest/globals";

const setPropertyMock = jest.fn();

global.document = {
  documentElement: {
    style: { setProperty: setPropertyMock },
  },
};

const { generateTheme } = await import("../client.mjs");

describe("generateTheme", () => {
  beforeEach(() => {
    setPropertyMock.mockClear();
  });

  it("is exported as a named function", () => {
    expect(typeof generateTheme).toBe("function");
  });

  it("calls setProperty for each token", () => {
    generateTheme({ sourceColor: "#6750A4", scheme: "light" });
    expect(setPropertyMock).toHaveBeenCalled();
  });

  it("sets CSS variable names starting with --md-sys-color-", () => {
    generateTheme({ sourceColor: "#6750A4", scheme: "light" });
    for (const [name] of setPropertyMock.mock.calls) {
      expect(name).toMatch(/^--md-sys-color-/);
    }
  });

  it("sets oklch values", () => {
    generateTheme({ sourceColor: "#6750A4", scheme: "light" });
    for (const [, value] of setPropertyMock.mock.calls) {
      expect(value).toMatch(/^oklch\(/);
    }
  });

  it("defaults scheme to light when not provided", () => {
    generateTheme({ sourceColor: "#6750A4" });
    expect(setPropertyMock).toHaveBeenCalled();
  });

  it("works with dark scheme", () => {
    generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
    expect(setPropertyMock).toHaveBeenCalled();
  });

  it("light and dark produce different primary values", () => {
    generateTheme({ sourceColor: "#6750A4", scheme: "light" });
    const lightCalls = setPropertyMock.mock.calls.slice();
    setPropertyMock.mockClear();

    generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
    const darkCalls = setPropertyMock.mock.calls.slice();

    const lightPrimary = lightCalls.find(([k]) => k === "--md-sys-color-primary")?.[1];
    const darkPrimary = darkCalls.find(([k]) => k === "--md-sys-color-primary")?.[1];
    expect(lightPrimary).not.toBe(darkPrimary);
  });

  it("does not register anything on window", () => {
    expect((global.window ?? {}).generateTheme).toBeUndefined();
  });
});
