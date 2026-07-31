import { html } from "lit";

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
  title: "Radio",
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

/** @type {Story} */
export const Regular = {};

/** @type {Story} */
export const Label = {
  args: {},
  render: () =>
    html`<label style="display: flex;align-items: center;">
      <md-radio></md-radio>
      Label
    </label> `,
};
