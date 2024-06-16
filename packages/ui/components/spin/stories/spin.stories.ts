import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import "../spin.ts";

import type MdSpinProps from "../spin.ts";

function Spin({ size }: MdSpinProps) {
  return html` <md-spin size=${size}> </md-spin> `;
}

const meta = {
  title: "Spin",
  component: "md-spin",
  tags: ["autodocs"],
  argTypes: {
    size: {
      options: ["xs", "s", "m", "l"],
      control: { type: "select" },
    },
  },
  render: Spin,
} satisfies Meta<MdSpinProps>;
export default meta;

type Story = StoryObj<MdSpinProps>;
export const Regular: Story = {
  args: {},
};