import { html } from "lit";

import "../progress-linear";

/** @import MdProgressLinear from "../progress-linear" */

/** @type {import("@storybook/web-components").Meta<MdProgressLinear>} */
const meta = {
  title: "Components/Progress Linear",
  component: "md-progress-linear",
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Determinate progress (0–1). Omit for indeterminate.",
    },
  },
  render: (args) =>
    html`<md-progress-linear .value=${args.value}></md-progress-linear>`,
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<MdProgressLinear>} Story */

/** @type {Story} */
export const Indeterminate = {
  args: {},
};

/** @type {Story} */
export const Determinate = {
  args: { value: 0.65 },
};

/** @type {Story} */
export const DeterminateEmpty = {
  args: { value: 0 },
};

/** @type {Story} */
export const DeterminateFull = {
  args: { value: 1 },
};
