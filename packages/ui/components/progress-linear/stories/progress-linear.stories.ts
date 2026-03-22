import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import "../progress-linear";

import type MdProgressLinear from "../progress-linear";

const meta = {
  title: "Progress linear",
  component: "md-progress-linear",
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Determinate progress (0–1). Omit for indeterminate.",
    },
  },
  render: (args: MdProgressLinear) =>
    html`<md-progress-linear .value=${args.value}></md-progress-linear>`,
} satisfies Meta<MdProgressLinear>;
export default meta;

type Story = StoryObj<MdProgressLinear>;

export const Indeterminate: Story = {
  args: {},
};

export const Determinate: Story = {
  args: { value: 0.65 },
};

export const DeterminateEmpty: Story = {
  args: { value: 0 },
};

export const DeterminateFull: Story = {
  args: { value: 1 },
};
