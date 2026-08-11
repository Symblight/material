import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import edit from "@material-design-icons/svg/outlined/edit.svg?raw";
import cloud from "@material-design-icons/svg/outlined/cloud.svg?raw";
import share from "@material-design-icons/svg/outlined/share.svg?raw";

import "../select";
// NOT covered by the "../select" import above — that specifier actually
// resolves straight to `../select.js` (this directory happens to contain a
// same-named file), not the `../index.js` barrel, so `md-native-select`
// needs its own explicit import here.
import "../native-select.js";
import "../../button/button.js";
import "../../icon/icon.js";

/** @import SelectProps from "../select.js" */

/** @param {SelectProps} props */
function Select({ variant, disabled }) {
  const handleChange = (event) => {
    console.log(event.target.value);
  };
  return html`
    <md-select
      label="Role"
      ?disabled=${disabled}
      variant=${variant}
      @change=${handleChange}
    >
      <md-option value="">--Please choose an option--</md-option>
      <md-option value="tutor"> Tutor </md-option>
      <md-option value="student" selected> Student </md-option>
      <md-option value="classroom"> Classroom </md-option>
    </md-select>
  `;
}

/** @type {import("@storybook/web-components").Meta<SelectProps>} */
const meta = {
  title: "Components/Select",
  component: "md-select",
  tags: ["autodocs"],
  render: Select,
  argTypes: {
    variant: {
      options: ["filled", "outlined"],
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<SelectProps>} Story */

/** @type {Story} */
export const Regular = {
  args: {},
};

/** @type {Story} */
export const Form = {
  args: {},
  render: ({}) => {
    function handleSubmit(e) {
      e.preventDefault();
      const formData = new FormData(/** @type {HTMLFormElement} */ (e.target));
      console.log(formData);
    }

    function handleReset() {
      document.querySelector("form")?.reset();
    }

    async function handleLoad() {
      const fetcher = () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(["Mirro", "Quizlet", "Google meet"]), 300),
        );

      const result = await fetcher();

      const selectEl = document.querySelector("#select");
      result.forEach((el) => {
        const optionEl = document.createElement("md-option");
        optionEl.setAttribute("value", el);
        optionEl.innerText = el;
        selectEl.appendChild(optionEl);
      });
    }

    return html`<form @submit=${handleSubmit}>
        <md-select id="select" name="my-select"> </md-select>
        <md-button type="submit">Submit</md-button>
        <md-button type="button" @click=${handleReset}>Reset</md-button>
      </form>

      <md-button @click=${handleLoad}>Load more</md-button> `;
  },
};

/** @type {Story} */
export const Outlined = {
  args: { variant: "outlined" },
};

/** @type {Story} */
export const Disabled = {
  args: { disabled: true },
};

/** @type {Story} */
export const Required = {
  args: {},
  render: () => html`
    <form
      @submit=${(e) => {
        e.preventDefault();
        console.log(new FormData(/** @type {HTMLFormElement} */ (e.target)));
      }}
    >
      <md-select label="Role" name="role" required>
        <md-option value="">--Please choose an option--</md-option>
        <md-option value="tutor">Tutor</md-option>
        <md-option value="student">Student</md-option>
      </md-select>
      <md-button type="submit">Submit</md-button>
    </form>
  `,
};

/**
 * `multiple`/`size` are real native `<select>` attributes with no menu-mode
 * equivalent (there's no multi-select UI in the `md-menu`-popover path) —
 * they live on `md-native-select` only, not `md-select`.
 */
/** @type {Story} */
export const Multiple = {
  args: {},
  render: () => html`
    <md-native-select label="Roles" name="roles" multiple size="4">
      <option value="tutor">Tutor</option>
      <option value="student" selected>Student</option>
      <option value="classroom">Classroom</option>
      <option value="online">Online</option>
    </md-native-select>
  `,
};

/** @type {Story} */
export const Group = {
  args: {},
  render: () => {
    return html`
      <md-select label="Location" name="my-select">
        <md-option value="">--Please choose an option--</md-option>
        <md-option-group label="Person">
          <md-option value="tutor"> Tutor </md-option>
          <md-option value="student"> Student </md-option>
        </md-option-group>
        <md-hr></md-hr>
        <md-option-group label="Place">
          <md-option value="classroom"> Classroom </md-option>
          <md-option value="online"> Online </md-option>
        </md-option-group>
      </md-select>
    `;
  },
};

// ── md-native-select vs. md-select (menu mode) ───────────────────────────

/**
 * `md-native-select` and `md-select` are two separate components now (they
 * used to be a single `md-select` flipped by a `native` boolean attribute —
 * split apart for the same reason `md-menu-item`'s old `type="menuitem" |
 * "option"` attribute was split into `md-menu-item`/`md-option`: a boolean
 * flag flipping a component's entire identity/rendering is the wrong shape).
 * Both are real, form-associated controls (`FormAssociateMixin`/
 * `ElementInternals` value handling), side by side here for comparison —
 * the difference is what opens when you click it, and what kind of
 * children each one takes:
 *
 * - **`md-native-select`** (left) — the browser's own OS/platform `<select>`
 *   dropdown opens; plain text only, no icons. Takes real `<option>`
 *   elements as children (not `md-option` — a custom element can't be a
 *   genuine child of a native `<select>`, and can't even be *slotted* into
 *   one from a shadow root; see `components/select/native-select.js`).
 * - **`md-select`** (right) — the visible, interactive control is an
 *   `md-menu` popover instead, so richer content (here, a leading icon per
 *   option) actually renders, and the selected row gets an automatic
 *   checkmark. Takes `md-option` children. A native `<select>` still exists
 *   underneath, visually hidden — kept in sync as the form's
 *   `validationTarget`/value mirror, but it's not what the user opens/
 *   clicks. See `components/select/select.js`.
 */
/** @type {Story} */
export const NativeVsMenuMode = {
  render: () => html`
    <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: start;">
      <div>
        <p
          style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0 0 0.5rem;"
        >
          md-native-select (browser dropdown)
        </p>
        <md-native-select label="Sort by" name="sort-native">
          <option value="name" selected>Name</option>
          <option value="date">Date modified</option>
          <option value="size">Size</option>
        </md-native-select>
      </div>

      <div>
        <p
          style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0 0 0.5rem;"
        >
          md-select (md-menu popover)
        </p>
        <md-select label="Sort by" name="sort-menu" style="width: 204px;">
          <md-option value="name" selected>
            <md-icon slot="leading">${unsafeSVG(edit)}</md-icon>
            Name
          </md-option>
          <md-option value="date">
            <md-icon slot="leading">${unsafeSVG(cloud)}</md-icon>
            Date modified
          </md-option>
          <md-option value="size">
            <md-icon slot="leading">${unsafeSVG(share)}</md-icon>
            Size
          </md-option>
        </md-select>
      </div>
    </div>
  `,
};
