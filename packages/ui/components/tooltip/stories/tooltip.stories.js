import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import moreVert from "@material-design-icons/svg/outlined/more_vert.svg?raw";
import favorite from "@material-design-icons/svg/outlined/favorite.svg?raw";
import favoriteBorder from "@material-design-icons/svg/outlined/favorite_border.svg?raw";

import "../index.js";
import "../../button/button.js";
import "../../icon-button/icon-button.js";
import "../../icon/icon.js";

/** @import { MdTooltip } from "../tooltip.js" */

/** @type {import("@storybook/web-components").Meta<MdTooltip>} */
const meta = {
  title: "Components/Tooltip",
  component: "md-tooltip",
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
      description:
        "Preferred floating-ui placement relative to the anchor. MD3 plain tooltips default above the anchor.",
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
        'How the surface is rendered/positioned — same semantics as md-menu\'s "positioning". "popover" (default) uses the native Popover API for top-layer rendering, falling back to "fixed" if unsupported.',
    },
    showDelay: {
      control: { type: "number" },
      description:
        "Milliseconds to wait after pointerenter/focusin before showing the tooltip.",
    },
    hideDelay: {
      control: { type: "number" },
      description:
        "Milliseconds to wait after pointerleave/focusout before hiding the tooltip.",
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

/** @typedef {import("@storybook/web-components").StoryObj<MdTooltip>} Story */

/**
 * A plain tooltip anchored to an icon button, shown above the anchor by
 * default (MD3 plain tooltip's default placement). Hover or focus the
 * button to reveal it.
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
      <md-icon-button id="tooltip-trigger" aria-label="More actions">
        <md-icon>${unsafeSVG(moreVert)}</md-icon>
      </md-icon-button>
    </div>
    <md-tooltip
      for="tooltip-trigger"
      placement=${placement}
      offset=${offset}
      ?flip=${flip}
      positioning=${positioning}
      show-delay=${showDelay}
      hide-delay=${hideDelay}
    >
      More actions
    </md-tooltip>
  `,
};

/**
 * All four cardinal placements shown side by side — hover each button.
 */
/** @type {Story} */
export const Placements = {
  render: () => html`
    <div style="display:flex; gap: 4rem; padding: 4rem;">
      ${["top", "bottom", "left", "right"].map(
        (placement) => html`
          <div
            style="display:flex; flex-direction:column; align-items:center; gap: 0.5rem;"
          >
            <md-button id="placement-${placement}" variant="outlined">
              ${placement}
            </md-button>
            <md-tooltip for="placement-${placement}" placement=${placement}>
              Tooltip (${placement})
            </md-tooltip>
          </div>
        `,
      )}
    </div>
  `,
};

/**
 * A longer label wraps within the plain tooltip's max-width instead of
 * growing unbounded.
 */
/** @type {Story} */
export const LongLabel = {
  render: () => html`
    <div style="display:flex; justify-content:center; padding: 4rem;">
      <md-button id="long-label-trigger" variant="outlined">
        Hover me
      </md-button>
    </div>
    <md-tooltip for="long-label-trigger">
      This is a longer tooltip label that demonstrates text wrapping inside the
      plain tooltip's max width.
    </md-tooltip>
  `,
};

/**
 * `show-delay`/`hide-delay` set to `0` for an instant, no-delay tooltip —
 * compare against the default-delay example above.
 */
/** @type {Story} */
export const NoDelay = {
  render: () => html`
    <div style="display:flex; justify-content:center; padding: 4rem;">
      <md-button id="no-delay-trigger" variant="outlined"> Hover me </md-button>
    </div>
    <md-tooltip for="no-delay-trigger" show-delay="0" hide-delay="0">
      Instant tooltip
    </md-tooltip>
  `,
};

/**
 * A tooltip anchored to a single toggleable icon button (`toggle` +
 * controlled `selected`). Click the button to toggle it — the icon swaps
 * (default vs. `slot="selected"`) and the tooltip label switches between its
 * two states (MD3 "favorite" toggle pattern). The `selected` control below
 * only sets the *initial* state on render, since `md-icon-button` doesn't
 * flip `selected` on click by itself — the consumer owns that, same as here.
 */
/**
 * @type {import("@storybook/web-components").StoryObj<
 *   MdTooltip & { selected: boolean }
 * >}
 */
export const ToggleIconButton = {
  argTypes: {
    selected: {
      control: { type: "boolean" },
      description:
        "Initial value of md-icon-button's `selected` attribute — click the button in the canvas to toggle it from there.",
    },
  },
  args: {
    selected: false,
  },
  render: ({ selected }) => {
    /** @param {boolean} isSelected */
    const label = (isSelected) =>
      isSelected ? "Remove from favorites" : "Add to favorites";

    /** @param {Event} event */
    const onToggle = (event) => {
      const button = /** @type {HTMLElement & { selected: boolean }} */ (
        event.currentTarget
      );
      button.selected = !button.selected;
      button.setAttribute("aria-label", label(button.selected));

      const tooltip = document.getElementById("favorite-tooltip");
      if (tooltip) tooltip.textContent = label(button.selected);
    };

    return html`
      <div style="display:flex; justify-content:center; padding: 4rem;">
        <md-icon-button
          id="favorite-toggle"
          toggle
          ?selected=${selected}
          aria-label=${label(selected)}
          @click=${onToggle}
        >
          <md-icon>${unsafeSVG(favoriteBorder)}</md-icon>
          <md-icon slot="selected">${unsafeSVG(favorite)}</md-icon>
        </md-icon-button>
      </div>
      <md-tooltip id="favorite-tooltip" for="favorite-toggle">
        ${label(selected)}
      </md-tooltip>
    `;
  },
};
