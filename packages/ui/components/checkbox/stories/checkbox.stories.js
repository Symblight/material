import { html } from "lit";
import { ref } from "lit/directives/ref.js";

import "../checkbox";

/** @import Checkbox from "../checkbox.js" */

/** @param {Checkbox} props */
function Template({
  disabled,
  checked,
  indeterminate,
  name,
  id,
  value,
  error,
}) {
  return html`<md-checkbox
    ?disabled=${disabled}
    ?checked=${checked}
    ?error=${error}
    ?indeterminate=${indeterminate}
    id=${id}
    name=${name}
    value=${value}
  ></md-checkbox>`;
}

/** @type {import("@storybook/web-components").Meta<Checkbox>} */
const meta = {
  title: "Components/Checkbox",
  component: "md-checkbox",
  tags: ["autodocs"],
  render: Template,
  argTypes: {
    checked: {
      control: { type: "boolean" },
    },
    indeterminate: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    error: {
      control: { type: "boolean" },
    },
    name: {
      control: { type: "text" },
    },
    id: {
      control: { type: "text" },
    },
    value: {
      control: { type: "text" },
    },
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<Checkbox>} Story */

// ─── Regular — controls-driven playground ───────────────────────────────────

/** @type {Story} */
export const Regular = {};

// ─── With label — the checkbox is wrapped in a native <label>, so clicking
// the text toggles the box too, not just the box itself ────────────────────

/** @type {Story} */
export const Label = {
  args: {},
  render: () =>
    html`<label style="display: flex;align-items: center;">
      <md-checkbox></md-checkbox>
      Label
    </label> `,
};

// ─── Change events — checking/unchecking updates a live readout below, so
// the `change` event (re-dispatched from the native input) is actually
// observable instead of just asserted in prose ──────────────────────────────

/** @type {Story} */
export const ChangeEvent = {
  render: () => {
    /** @type {HTMLElement | undefined} */
    let log;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <md-checkbox
          @change=${(/** @type {Event} */ e) => {
            if (!log) return;
            const checked = /** @type {HTMLInputElement} */ (
              /** @type {unknown} */ (e.target)
            ).checked;
            log.textContent = `checked: ${checked}`;
          }}
        ></md-checkbox>
        <span
          ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        >
          checked: false
        </span>
      </div>
    `;
  },
};

// ─── Select-all — the classic parent/children indeterminate pattern: the
// header checkbox reflects mixed selection (checked / unchecked /
// indeterminate) and toggling it cascades to every child ────────────────────

/** @type {Story} */
export const SelectAll = {
  render: () => {
    const items = ["Apples", "Bananas", "Cherries"];
    /** @type {Record<string, boolean>} */
    const state = Object.fromEntries(items.map((item) => [item, false]));
    /** @type {any} */
    let headerCheckbox;
    /** @type {Record<string, any>} */
    const itemCheckboxes = {};

    function syncHeader() {
      if (!headerCheckbox) return;
      const values = items.map((item) => state[item]);
      const allChecked = values.every(Boolean);
      const someChecked = values.some(Boolean);
      headerCheckbox.checked = allChecked;
      headerCheckbox.indeterminate = !allChecked && someChecked;
    }

    /** @param {boolean} checked */
    function toggleAll(checked) {
      items.forEach((item) => {
        state[item] = checked;
        if (itemCheckboxes[item]) itemCheckboxes[item].checked = checked;
      });
      syncHeader();
    }

    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label
          style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500;"
        >
          <md-checkbox
            ${ref((el) => (headerCheckbox = el))}
            @change=${(/** @type {Event} */ e) =>
              toggleAll(
                /** @type {HTMLInputElement} */ (
                  /** @type {unknown} */ (e.target)
                ).checked,
              )}
          ></md-checkbox>
          Select all
        </label>
        ${items.map(
          (item) => html`
            <label
              style="display: flex; align-items: center; gap: 0.5rem; padding-inline-start: 1.5rem;"
            >
              <md-checkbox
                ${ref((el) => (itemCheckboxes[item] = el))}
                @change=${(/** @type {Event} */ e) => {
                  state[item] = /** @type {HTMLInputElement} */ (
                    /** @type {unknown} */ (e.target)
                  ).checked;
                  syncHeader();
                }}
              ></md-checkbox>
              ${item}
            </label>
          `,
        )}
      </div>
    `;
  },
};
