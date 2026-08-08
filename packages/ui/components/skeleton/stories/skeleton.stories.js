import { html } from "lit";

import "../skeleton.js";

/** @import { MdSkeleton } from "../skeleton.js" */

/**
 * @param {Partial<MdSkeleton>} props
 */
function SkeletonStory({ variant = "text" }) {
  return html`<md-skeleton
    variant=${variant}
    style="width: 200px;"
  ></md-skeleton>`;
}

/** @type {import("@storybook/web-components").Meta<MdSkeleton>} */
const meta = {
  title: "Skeleton",
  component: "md-skeleton",
  tags: ["autodocs"],
  render: SkeletonStory,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["text", "rectangular", "circular"],
      description: "Shape of the placeholder block.",
    },
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<MdSkeleton>} Story */

/** @type {Story} */
export const Text = {
  args: { variant: "text" },
};

/** @type {Story} */
export const Rectangular = {
  args: { variant: "rectangular" },
};

/** @type {Story} */
export const Circular = {
  render: () =>
    html`<md-skeleton
      variant="circular"
      style="width: 48px; height: 48px;"
    ></md-skeleton>`,
};

// ─── Varying widths — mimics real text of differing lengths ────────────────

/** @type {Story} */
export const VaryingWidths = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 0.5rem; width: 240px;"
    >
      <md-skeleton style="width: 80%;"></md-skeleton>
      <md-skeleton style="width: 55%;"></md-skeleton>
      <md-skeleton style="width: 70%;"></md-skeleton>
      <md-skeleton style="width: 40%;"></md-skeleton>
    </div>
  `,
};

// ─── Avatar + text placeholder — a common composed pattern ──────────────────

/** @type {Story} */
export const AvatarWithText = {
  render: () => html`
    <div
      style="display: flex; align-items: center; gap: 0.75rem; width: 280px;"
    >
      <md-skeleton
        variant="circular"
        style="width: 40px; height: 40px; flex: none;"
      ></md-skeleton>
      <div
        style="display: flex; flex-direction: column; gap: 0.375rem; flex: 1;"
      >
        <md-skeleton style="width: 40%;"></md-skeleton>
        <md-skeleton style="width: 70%;"></md-skeleton>
      </div>
    </div>
  `,
};
