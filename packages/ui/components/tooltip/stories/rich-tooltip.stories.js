import { html } from "lit";

import "../index.js";
import "../../button/button.js";

/** @import { MdRichTooltip } from "../rich-tooltip.js" */

/** @type {import("@storybook/web-components").Meta<MdRichTooltip>} */
const meta = {
  title: "Components/Rich Tooltip",
  component: "md-rich-tooltip",
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: { type: "select" },
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "right",
      ],
      description: "Preferred floating-ui placement relative to the anchor.",
    },
    offset: {
      control: { type: "number" },
      description: "Pixel gap between the anchor and the tooltip surface.",
    },
    flip: {
      control: { type: "boolean" },
      description:
        "Repositions the tooltip to the opposite side when it would overflow the viewport.",
    },
    positioning: {
      control: { type: "select" },
      options: ["popover", "fixed", "absolute", "document"],
      description:
        'How the surface is rendered/positioned — same semantics as md-menu\'s "positioning".',
    },
    showDelay: {
      control: { type: "number" },
      description:
        "Milliseconds to wait after pointerenter/focusin before showing the tooltip.",
    },
    hideDelay: {
      control: { type: "number" },
      description:
        "Milliseconds to wait after pointerleave/focusout before hiding the tooltip. Hovering onto the tooltip surface itself cancels this, so the user can reach the action buttons.",
    },
  },
  args: {
    placement: "top",
    offset: 4,
    flip: true,
    positioning: "popover",
    showDelay: 500,
    hideDelay: 300,
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<MdRichTooltip>} Story */

/**
 * A rich tooltip with a subhead and supporting text, no actions.
 */
/** @type {Story} */
export const Default = {
  render: ({
    placement,
    offset,
    flip,
    positioning,
    showDelay,
    hideDelay,
  }) => html`
    <div style="display:flex; justify-content:center; padding: 4rem;">
      <md-button id="rich-tooltip-trigger" variant="outlined">
        Hover me
      </md-button>
    </div>
    <md-rich-tooltip
      for="rich-tooltip-trigger"
      placement=${placement}
      offset=${offset}
      ?flip=${flip}
      positioning=${positioning}
      show-delay=${showDelay}
      hide-delay=${hideDelay}
    >
      <span slot="subhead">Add to favorites</span>
      Save this item to your favorites list so you can find it again later.
    </md-rich-tooltip>
  `,
};

/**
 * A rich tooltip with up to two text-button actions. Because
 * `md-rich-tooltip` cancels its hide timer while the pointer is over its own
 * surface, the pointer can move from the anchor onto the surface to click
 * an action without the tooltip dismissing first.
 */
/** @type {Story} */
export const WithActions = {
  render: () => html`
    <div style="display:flex; justify-content:center; padding: 4rem;">
      <md-button id="rich-tooltip-actions-trigger" variant="outlined">
        Hover me
      </md-button>
    </div>
    <md-rich-tooltip for="rich-tooltip-actions-trigger">
      <span slot="subhead">Delete file?</span>
      This action can be undone from the trash for the next 30 days.
      <md-button
        slot="actions"
        variant="text"
        @click=${() => console.log("undo")}
      >
        Undo
      </md-button>
      <md-button
        slot="actions"
        variant="text"
        @click=${() => console.log("dismiss")}
      >
        Dismiss
      </md-button>
    </md-rich-tooltip>
  `,
};

/**
 * No subhead — supporting text only. The subhead row collapses entirely
 * when nothing is slotted into it.
 */
/** @type {Story} */
export const BodyOnly = {
  render: () => html`
    <div style="display:flex; justify-content:center; padding: 4rem;">
      <md-button id="rich-tooltip-body-only-trigger" variant="outlined">
        Hover me
      </md-button>
    </div>
    <md-rich-tooltip for="rich-tooltip-body-only-trigger">
      Supporting text describing this control, with no subhead.
    </md-rich-tooltip>
  `,
};
