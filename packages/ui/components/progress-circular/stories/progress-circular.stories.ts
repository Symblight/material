import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import "../progress-circular";

import type MdProgressCircularProps from "../progress-circular";

const meta = {
  title: "Progress circular",
  component: "md-progress-circular",
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Determinate progress (0–1). Omit for indeterminate.",
    },
  },
  render: (args: MdProgressCircularProps) =>
    html`<md-progress-circular .value=${args.value}></md-progress-circular>`,
} satisfies Meta<MdProgressCircularProps>;
export default meta;

type Story = StoryObj<MdProgressCircularProps>;

export const Indeterminate: Story = {
  args: {},
};

export const Determinate: Story = {
  args: { value: 0.65 },
};

export const Sizes: Story = {
  render: () => html`
    <div style="display:flex;align-items:center;gap:24px;">
      <md-progress-circular style="font-size:24px;"></md-progress-circular>
      <md-progress-circular style="font-size:48px;"></md-progress-circular>
      <md-progress-circular style="font-size:72px;"></md-progress-circular>
    </div>
  `,
};
