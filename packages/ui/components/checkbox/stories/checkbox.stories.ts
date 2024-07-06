import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import "../checkbox";

import type Checkbox from "../checkbox.ts";

function Template({
  disabled,
  checked,
  indeterminate,
  name,
  id,
  value,
  error,
}: Checkbox) {
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
} satisfies Meta<Checkbox>;
export default meta;

type Story = StoryObj<Checkbox>;

export const Regular: Story = {};

export const Label: Story = {
  args: {},
  render: () =>
    html`<label style="display: flex;align-items: center;">
      <md-checkbox></md-checkbox>
      Label
    </label> `,
};
