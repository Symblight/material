import { html } from "lit";
import { ref } from "lit/directives/ref.js";

import "../switch.js";
/** @import MdSwitch from "../switch.js" */

/** @type {import("@storybook/web-components").Meta<MdSwitch>} */
const meta = {
  title: "Components/Switch",
  tags: ["autodocs"],
  render: ({ selected, disabled, icons }) => html`
    <md-switch
      ?selected=${selected}
      ?disabled=${disabled}
      ?icons=${icons}
    ></md-switch>
  `,
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    icons: { control: "boolean" },
  },
  args: {
    selected: false,
    disabled: false,
    icons: false,
  },
};

export default meta;
/** @typedef {import("@storybook/web-components").StoryObj<MdSwitch>} Story */

// ─── Unselected / Selected — controls-driven playground ─────────────────────

/** @type {Story} */
export const Unselected = {
  args: { selected: false },
};

/** @type {Story} */
export const Selected = {
  args: { selected: true },
};

// ─── With icons — check/x glyph shown inside the handle ─────────────────────

/** @type {Story} */
export const WithIcons = {
  args: { selected: false, icons: true },
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <md-switch icons></md-switch>
      <md-switch icons selected></md-switch>
    </div>
  `,
};

// ─── Disabled — both states, non-interactive ────────────────────────────────

/** @type {Story} */
export const Disabled = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <md-switch disabled></md-switch>
      <md-switch disabled selected></md-switch>
    </div>
  `,
};

// ─── All states — every combination side by side ────────────────────────────

/** @type {Story} */
export const AllStates = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <md-switch id="switch"></md-switch>
        <label for="switch">Unselected</label>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <md-switch selected></md-switch>
        <label>Selected</label>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <md-switch icons></md-switch>
        <label>Unselected with icon</label>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <md-switch icons selected></md-switch>
        <label>Selected with icon</label>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <md-switch disabled></md-switch>
        <label>Disabled unselected</label>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <md-switch disabled selected></md-switch>
        <label>Disabled selected</label>
      </div>
    </div>
  `,
};

// ─── Change events — toggling updates a live readout below, so the
// `change` event (re-dispatched from the native input) is actually
// observable instead of just asserted in prose ──────────────────────────────

/** @type {Story} */
export const ChangeEvent = {
  render: () => {
    /** @type {HTMLElement | undefined} */
    let log;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <md-switch
          @change=${(/** @type {Event} */ e) => {
            if (!log) return;
            const selected = /** @type {MdSwitch} */ (
              /** @type {unknown} */ (e.target)
            ).selected;
            log.textContent = `selected: ${selected}`;
          }}
        ></md-switch>
        <span
          ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        >
          selected: false
        </span>
      </div>
    `;
  },
};

// ─── Settings list — a common composed pattern: label + switch rows, each
// wired independently, with a live summary of which are currently on ───────

/** @type {Story} */
export const SettingsList = {
  render: () => {
    const settings = [
      { key: "email", label: "Email notifications", selected: true },
      { key: "push", label: "Push notifications", selected: false },
      { key: "sms", label: "SMS alerts", selected: false },
    ];
    /** @type {HTMLElement | undefined} */
    let log;

    function updateLog() {
      if (!log) return;
      const enabled = settings
        .filter((setting) => setting.selected)
        .map((setting) => setting.label);
      log.textContent =
        enabled.length === 0
          ? "Nothing enabled."
          : `Enabled: ${enabled.join(", ")}`;
    }

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 0.75rem; width: 17.5rem;"
      >
        ${settings.map(
          (setting) => html`
            <label
              style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;"
            >
              <span>${setting.label}</span>
              <md-switch
                ?selected=${setting.selected}
                @change=${(/** @type {Event} */ e) => {
                  setting.selected = /** @type {MdSwitch} */ (
                    /** @type {unknown} */ (e.target)
                  ).selected;
                  updateLog();
                }}
              ></md-switch>
            </label>
          `,
        )}
        <span
          ${ref((el) => {
            log = /** @type {HTMLElement | undefined} */ (el);
            updateLog();
          })}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        ></span>
      </div>
    `;
  },
};
