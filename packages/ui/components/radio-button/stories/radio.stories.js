import { html } from "lit";
import { ref } from "lit/directives/ref.js";

import "../radio-button";

/** @import Radio from "../radio-button.js" */

/** @param {Radio} props */
function Template({ disabled, checked, name, id, value, error }) {
  return html`<md-radio
    ?disabled=${disabled}
    ?checked=${checked}
    ?error=${error}
    id=${id}
    name=${name}
    value=${value}
  ></md-radio>`;
}

/** @type {import("@storybook/web-components").Meta<Radio>} */
const meta = {
  title: "Components/Radio",
  component: "md-radio",
  tags: ["autodocs"],
  render: Template,
  argTypes: {
    checked: {
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

/** @typedef {import("@storybook/web-components").StoryObj<Radio>} Story */

// ─── Regular — controls-driven playground ───────────────────────────────────

/** @type {Story} */
export const Regular = {};

// ─── With label — the radio is wrapped in a native <label>, so clicking the
// text selects it too, not just the circle itself ──────────────────────────

/** @type {Story} */
export const Label = {
  args: {},
  render: () =>
    html`<label style="display: flex;align-items: center;">
      <md-radio></md-radio>
      Label
    </label> `,
};

// ─── Change events — selecting updates a live readout below, so the
// `change` event (re-dispatched from the native input) is actually
// observable instead of just asserted in prose ──────────────────────────────

/** @type {Story} */
export const ChangeEvent = {
  render: () => {
    /** @type {HTMLElement | undefined} */
    let log;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <md-radio
          checked
          name="demo"
          value="demo"
          @change=${(/** @type {Event} */ e) => {
            if (!log) return;
            const checked = /** @type {Radio} */ (
              /** @type {unknown} */ (e.target)
            ).checked;
            log.textContent = `checked: ${checked}`;
          }}
        ></md-radio>
        <span
          ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        >
          checked: true
        </span>
      </div>
    `;
  },
};

// ─── Radio group — mutual exclusivity is NOT automatic from a shared `name`
// alone (unlike native radio inputs). RadioSelectionController only
// deselects siblings when it finds an ancestor <fieldset> or <form> to scope
// the group to (see radio-selection.js `select()` — it early-returns with
// no group found). Omitting the wrapper silently breaks exclusivity: every
// option can end up checked at once ─────────────────────────────────────────

/** @type {Story} */
export const RadioGroup = {
  render: () => {
    const options = [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise" },
    ];
    /** @type {HTMLElement | undefined} */
    let log;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <fieldset
          style="display: flex; flex-direction: column; gap: 0.5rem; border: none; margin: 0; padding: 0;"
        >
          ${options.map(
            (option, i) => html`
              <label style="display: flex; align-items: center; gap: 0.5rem;">
                <md-radio
                  name="plan"
                  value=${option.value}
                  ?checked=${i === 0}
                  @change=${(/** @type {Event} */ e) => {
                    if (!log) return;
                    const checked = /** @type {Radio} */ (
                      /** @type {unknown} */ (e.target)
                    ).checked;
                    if (checked) log.textContent = `Selected: ${option.value}`;
                  }}
                ></md-radio>
                ${option.label}
              </label>
            `,
          )}
        </fieldset>
        <span
          ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        >
          Selected: free
        </span>
      </div>
    `;
  },
};
