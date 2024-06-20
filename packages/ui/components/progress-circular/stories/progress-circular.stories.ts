import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import "../progress-circular";

import type MdProgressCircularProps from "../progress-circular";

function ProgressCircular() {
  return html`<div style="font-size: 4rem;">
    <md-progress-circular> </md-progress-circular>
  </div> `;
}

const meta = {
  title: "Progress circular",
  component: "md-progress-circular",
  tags: ["autodocs"],
  argTypes: {},
  render: ProgressCircular,
} satisfies Meta<MdProgressCircularProps>;
export default meta;

type Story = StoryObj<MdProgressCircularProps>;
export const Regular: Story = {
  args: {},
};
