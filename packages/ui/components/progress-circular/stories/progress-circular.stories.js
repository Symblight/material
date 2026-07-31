import { html } from "lit";

import "../progress-circular";

/** @import MdProgressCircularProps from "../progress-circular" */

/** @type {import("@storybook/web-components").Meta<MdProgressCircularProps>} */
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
  render: (args) =>
    html`<md-progress-circular .value=${args.value}></md-progress-circular>`,
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<MdProgressCircularProps>} Story */

/** @type {Story} */
export const Indeterminate = {
  args: {},
};

/** @type {Story} */
export const Determinate = {
  args: { value: 0.65 },
};

/** @type {Story} */
export const Sizes = {
  render: () => html`
    <div style="display:flex;align-items:center;gap:24px;">
      <md-progress-circular style="font-size:24px;"></md-progress-circular>
      <md-progress-circular style="font-size:48px;"></md-progress-circular>
      <md-progress-circular style="font-size:72px;"></md-progress-circular>
    </div>
  `,
};
