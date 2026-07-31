import { html } from "lit";

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
  title: "Checkbox",
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

/** @type {Story} */
export const Regular = {};

/** @type {Story} */
export const Label = {
  args: {},
  render: () =>
    html`<label style="display: flex;align-items: center;">
      <md-checkbox></md-checkbox>
      Label
    </label> `,
};
