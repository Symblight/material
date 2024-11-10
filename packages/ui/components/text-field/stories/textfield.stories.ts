import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Meta, StoryObj } from "@storybook/web-components";
import search from "@material-design-icons/svg/outlined/search.svg?raw";
import cancel from "@material-design-icons/svg/outlined/cancel.svg?raw";
import visibility from "@material-design-icons/svg/outlined/visibility.svg?raw";
import visibilityOff from "@material-design-icons/svg/outlined/visibility_off.svg?raw";

import "../text-field.ts";
import "../../icon/icon.ts";
import "../../button/button.ts";
import "../../icon-button/icon-button.ts";
import "../../checkbox/checkbox.ts";
import "../../radio-button/radio-button.ts";

import { type TextField as MdTextFieldProps } from "../text-field.ts";

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
}: MdTextFieldProps) {
  function handleChange(e: any) {
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
      defaultValue: "Label",
    },
    suffixText: {
      control: { type: "text" },
    },
    prefixText: {
      control: { type: "text" },
    },
  },
} satisfies Meta<MdTextFieldProps>;
export default meta;

type Story = StoryObj<MdTextFieldProps>;
export const Regular: Story = {
  args: {
    disabled: false,
    readOnly: false,
    value: "",
  },
};

export const TrailingAndLeading: Story = {
  args: {
    slot: html` <md-icon slot="trailing"> ${unsafeSVG(cancel)} </md-icon>

      <md-icon slot="leading">
        ${unsafeSVG(search)}
      </md-icon>` as unknown as string,
  },
};

export const SupportingText: Story = {
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
export const Invalid: Story = {
  args: {
    error: true,
  },
  render: ({ error }) => {
    function handleSubmit(e: Event) {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
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

export const Textarea: Story = {
  render: Template,
  args: {
    multiline: true,
  },
};

export const Password: Story = {
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
