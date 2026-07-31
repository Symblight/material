import { html } from "lit";

import "../ripple.js";

/** @import MdRippleProps from "../ripple.js" */
import "./styles.css";

function Ripple() {
  return html`<div class="ripple-container"><md-ripple> </md-ripple></div>`;
}

/** @type {import("@storybook/web-components").Meta<MdRippleProps>} */
const meta = {
  title: "Ripple",
  component: "md-ripple",
  tags: ["autodocs"],
  render: Ripple,
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<MdRippleProps>} Story */
/** @type {Story} */
export const Regular = {
  args: {},
};
