import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import search from "@material-design-icons/svg/outlined/search.svg?raw";
import cancel from "@material-design-icons/svg/outlined/cancel.svg?raw";
import visibility from "@material-design-icons/svg/outlined/visibility.svg?raw";
import visibilityOff from "@material-design-icons/svg/outlined/visibility_off.svg?raw";

import "../text-field.js";
import "../../icon/icon.js";
import "../../button/button.js";
import "../../icon-button/icon-button.js";
import "../../checkbox/checkbox.js";
import "../../radio-button/radio-button.js";

/** @import { TextField as MdTextFieldProps } from "../text-field.js" */

/** @param {MdTextFieldProps} props */
function Template({
  slot,
  disabled = false,
  readOnly = false,
  suffixText,
  prefixText,
  value,
  type,
  error,
  placeholder,
  multiline,
  variant = "filled",
  label = "label",
}) {
  function handleChange(e) {
    console.log(e.target.value, "value");
  }
  return html`
    <md-text-field
      ?disabled=${disabled}
      ?readOnly=${readOnly}
      ?error=${error}
      ?multiline=${multiline}
      placeholder=${placeholder}
      label=${label}
      value=${value}
      type=${type}
      variant=${variant}
      suffix-text=${suffixText}
      prefix-text=${prefixText}
      @change=${handleChange}
    >
      ${slot}
    </md-text-field>
  `;
}

/** @type {import("@storybook/web-components").Meta<MdTextFieldProps>} */
const meta = {
  title: "TextField",
  component: "md-text-field",
  tags: ["autodocs"],
  render: Template,
  argTypes: {
    variant: {
      options: ["filled", "outlined"],
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    multiline: {
      control: { type: "boolean" },
    },
    readOnly: {
      control: { type: "boolean" },
    },
    error: {
      control: { type: "boolean" },
    },
    type: {
      options: ["number", "text", "password"],
      control: { type: "select" }, // Automatically inferred when 'options' is defined
    },
    placeholder: {
      control: { type: "text" },
    },
    label: {
      control: { type: "text" },
    },
    suffixText: {
      control: { type: "text" },
    },
    prefixText: {
      control: { type: "text" },
    },
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<MdTextFieldProps>} Story */
/** @type {Story} */
export const Regular = {
  args: {
    disabled: false,
    readOnly: false,
    value: "",
  },
};

/** @type {Story} */
export const TrailingAndLeading = {
  args: {
    slot: /** @type {string} */ (
      /** @type {unknown} */ (
        html` <md-icon slot="trailing"> ${unsafeSVG(cancel)} </md-icon>

          <md-icon slot="leading"> ${unsafeSVG(search)} </md-icon>`
      )
    ),
  },
};

/** @type {Story} */
export const SupportingText = {
  argTypes: {
    variant: {
      options: ["filled", "j"],
      control: { type: "select" },
    },
    error: {
      control: { type: "boolean" },
    },
  },
  args: {
    error: true,
  },
  render: ({ error }) => {
    return html`
      <md-text-field
        ?error=${error}
        id="text-field"
        name="username"
        label="Username"
      >
        <span slot="help-text"
          >This field is required. Please be "Positive"This field is
          required.</span
        >
      </md-text-field>
      <md-text-field
        ?error=${error}
        id="text-field"
        name="username"
        label="Username"
        variant="outlined"
      >
        <span slot="help-text"
          >This field is required. Please be "Positive" etc text....</span
        >
      </md-text-field>
    `;
  },
};
/** @type {Story} */
export const Invalid = {
  args: {
    error: true,
  },
  render: ({ error }) => {
    function handleSubmit(e) {
      e.preventDefault();
      const formData = new FormData(/** @type {HTMLFormElement} */ (e.target));
      console.log(formData);
    }

    function handleReset() {
      document.querySelector("form")?.reset();
    }

    function handleDisable() {
      const group = document.querySelector("fieldset");
      if (!group) return;

      if (!group.hasAttribute("disabled")) {
        group.setAttribute("disabled", "");
      } else {
        group.removeAttribute("disabled");
      }
    }

    return html`<form @submit=${handleSubmit}>
      <md-text-field id="text-field" name="username" label="Username" required>
        <md-icon slot="trailing"> ${unsafeSVG(search)} </md-icon>
        <span slot="help-text"
          >This field is required. Please be "Positive"</span
        >
      </md-text-field>
      <md-text-field
        type="email"
        id="email"
        name="email"
        label="Email"
        required
        error
      >
        <md-icon slot="trailing"> ${unsafeSVG(search)} </md-icon>
        <span slot="help-text">This field is required</span>
      </md-text-field>
      <md-checkbox j value="test" name="nametest"></md-checkbox>
      <fieldset>
        <legend>Select a maintenance drone:</legend>
        <label>
          <md-radio required value="read" name="my-radio"></md-radio>
          test radio
        </label>
        <label>
          <md-radio required value="read2" name="my-radio"></md-radio>
          test radio2
        </label>
      </fieldset>

      <md-button type="submit">Submit</md-button>
      <md-button type="button" @click=${handleReset}>Reset</md-button>
      <md-button type="button" variant="tonal" @click=${handleDisable}
        >Disable radio</md-button
      >
    </form> `;
  },
};

/** @type {Story} */
export const Textarea = {
  render: Template,
  args: {
    multiline: true,
  },
};

/** @type {Story} */
export const Password = {
  args: {},
  render: () => {
    return html`
      <md-text-field
        id="text-field"
        name="Password"
        label="Password"
        type="password"
      >
        <md-icon-button slot="trailing" toggle>
          <md-icon> ${unsafeSVG(visibility)} </md-icon>
          <md-icon slot="selected"> ${unsafeSVG(visibilityOff)} </md-icon>
        </md-icon-button>
      </md-text-field>
      <md-text-field
        variant="outlined"
        name="Password"
        label="Password"
        type="password"
      >
        <md-icon-button slot="trailing" toggle>
          <md-icon> ${unsafeSVG(visibility)} </md-icon>
          <md-icon slot="selected"> ${unsafeSVG(visibilityOff)} </md-icon>
        </md-icon-button>
      </md-text-field>
    `;
  },
};

/** @type {Story} */
export const CustomInputSelect = {
  args: {
    value: " ",
    slot: /** @type {string} */ (
      /** @type {unknown} */ (
        html`
          <select
            slot="input"
            style=" appearance: none; margin: 0;padding: 0;background: none;color: currentColor;border: 0;font-size: inherit;cursor: pointer;height: 1.5rem;line-height: 1.5rem;outline: none;"
            name="foods"
            id="hr-select"
          >
            <option value="">Choose a food</option>
            <hr />
            <optgroup label="Fruit">
              <option value="apple">Apples</option>
              <option value="banana">Bananas</option>
              <option value="cherry">Cherries</option>
              <option value="damson">Damsons</option>
            </optgroup>
            <hr />
            <optgroup label="Vegetables">
              <option value="artichoke">Artichokes</option>
              <option value="broccoli">Broccoli</option>
              <option value="cabbage">Cabbages</option>
            </optgroup>
            <hr />
            <optgroup label="Meat">
              <option value="beef">Beef</option>
              <option value="chicken">Chicken</option>
              <option value="pork">Pork</option>
            </optgroup>
            <hr />
            <optgroup label="Fish">
              <option value="cod">Cod</option>
              <option value="haddock">Haddock</option>
              <option value="salmon">Salmon</option>
              <option value="turbot">Turbot</option>
            </optgroup>
          </select>
        `
      )
    ),
  },
};
