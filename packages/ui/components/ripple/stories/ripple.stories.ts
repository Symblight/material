import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import "../ripple.ts";

import type MdRippleProps from "../ripple.ts";
import "./styles.css";

function Ripple() {
  return html`<div class="ripple-container"><md-ripple> </md-ripple></div>`;
}

const meta = {
  title: "Ripple",
  component: "md-ripple",
  tags: ["autodocs"],
  render: Ripple,
} satisfies Meta<MdRippleProps>;
export default meta;

type Story = StoryObj<MdRippleProps>;
export const Regular: Story = {
  args: {},
};
