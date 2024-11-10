import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import "../radio-button";

import type Radio from "../radio-button.ts";

function Template({ disabled, checked, name, id, value, error }: Radio) {
  return html`<md-radio
    ?disabled=${disabled}
    ?checked=${checked}
    ?error=${error}
    id=${id}
    name=${name}
    value=${value}
  ></md-radio>`;
}

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
} satisfies Meta<Radio>;
export default meta;

type Story = StoryObj<Radio>;

export const Regular: Story = {};

export const Label: Story = {
  args: {},
  render: () =>
    html`<label style="display: flex;align-items: center;">
      <md-radio></md-radio>
      Label
    </label> `,
};
