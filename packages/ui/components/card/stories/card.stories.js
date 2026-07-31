import { html } from "lit";

import "../card.js";
import "../../button/button.js";

/** @import {MdCard} from "../card.js" */

/** @type {import("@storybook/web-components").Meta<MdCard>} */
const meta = {
  title: "Card",
  component: "md-card",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["elevated", "filled", "outlined"],
      description: "Visual style of the card.",
    },
    interactive: {
      control: { type: "boolean" },
      description:
        "Enables ripple, hover/pressed/focus-visible states, pointer cursor, and keyboard interaction.",
    },
    disabled: {
      control: { type: "boolean" },
      description:
        "Disables the card when interactive. Applies opacity and removes from tab order.",
    },
    href: {
      control: { type: "text" },
      description:
        "When set alongside interactive, renders the inner surface as an <a> element.",
    },
  },
  args: {
    variant: "elevated",
    interactive: false,
    disabled: false,
    href: undefined,
  },
};

export default meta;
/** @typedef {import("@storybook/web-components").StoryObj<MdCard>} Story */

/** Default elevated card with body content in the default slot. */
/** @type {Story} */
export const Elevated = {
  args: { variant: "elevated" },
  render: ({ variant }) => html`
    <md-card variant=${variant} style="max-inline-size: 360px; padding: 1rem;">
      <p style="margin: 0;">
        A simple elevated card. Uses
        <code>--md-sys-color-surface-container-low</code> as the background and
        renders an <code>md-shadow</code> at elevation level 1.
      </p>
    </md-card>
  `,
};

/** Filled card uses the highest surface container colour with no shadow. */
/** @type {Story} */
export const Filled = {
  args: { variant: "filled" },
  render: ({ variant }) => html`
    <md-card variant=${variant} style="max-inline-size: 360px; padding: 1rem;">
      <p style="margin: 0;">
        A filled card. Uses
        <code>--md-sys-color-surface-container-highest</code>. No shadow. Works
        well embedded in a larger surface.
      </p>
    </md-card>
  `,
};

/** Outlined card provides boundary definition without elevation. */
/** @type {Story} */
export const Outlined = {
  args: { variant: "outlined" },
  render: ({ variant }) => html`
    <md-card variant=${variant} style="max-inline-size: 360px; padding: 1rem;">
      <p style="margin: 0;">
        An outlined card. Uses <code>--md-sys-color-surface</code> with a 1px
        <code>--md-sys-color-outline-variant</code> border. No shadow.
      </p>
    </md-card>
  `,
};

/** Interactive card with ripple, hover, and focus-visible states. */
/** @type {Story} */
export const Interactive = {
  args: { variant: "elevated", interactive: true },
  render: ({ variant }) => html`
    <md-card
      variant=${variant}
      interactive
      style="max-inline-size: 360px; padding: 1rem; cursor: pointer;"
      @click=${() => alert("Card clicked!")}
    >
      <div slot="header" style="margin-block-end: 0.5rem;">
        <strong>Clickable Card</strong>
        <p style="margin: 0; font-size: 0.875rem; opacity: 0.7;">
          Subhead text
        </p>
      </div>
      <p style="margin: 0;">
        Click or press Enter/Space to activate. Hover to see the state layer.
      </p>
    </md-card>
  `,
};

/** Link card renders the inner surface as a native &lt;a&gt; element. */
/** @type {Story} */
export const LinkCard = {
  args: { variant: "elevated", interactive: true, href: "#" },
  render: ({ variant }) => html`
    <md-card
      variant=${variant}
      interactive
      href="#"
      style="max-inline-size: 360px; padding: 1rem;"
    >
      <div slot="header" style="margin-block-end: 0.5rem;">
        <strong>Link Card</strong>
        <p style="margin: 0; font-size: 0.875rem; opacity: 0.7;">
          Navigates to href
        </p>
      </div>
      <p style="margin: 0;">
        The entire card surface is an <code>&lt;a&gt;</code> element. Tab to
        focus and press Enter to navigate.
      </p>
    </md-card>
  `,
};

/** Card using all named slots: header, media, default body, and actions. */
/** @type {Story} */
export const WithAllSlots = {
  render: () => html`
    <md-card variant="elevated" style="max-inline-size: 360px;">
      <img
        slot="media"
        src="https://picsum.photos/seed/mdcard/400/200"
        alt="Sample media image"
        style="width: 100%; display: block;"
      />
      <div slot="header" style="padding: 1rem 1rem 0.5rem;">
        <strong>Card Headline</strong>
        <p style="margin: 0.25rem 0 0; font-size: 0.875rem; opacity: 0.7;">
          Subhead &middot; Supporting detail
        </p>
      </div>
      <p style="margin: 0; padding: 0 1rem 0.5rem;">
        Supporting body text that describes the card content and gives the user
        enough context to decide whether to take action.
      </p>
      <div slot="actions">
        <md-button variant="text">Cancel</md-button>
        <md-button variant="filled">Confirm</md-button>
      </div>
    </md-card>
  `,
};

/** Disabled interactive card: greyed out, removed from tab order. */
/** @type {Story} */
export const Disabled = {
  args: { variant: "elevated", interactive: true, disabled: true },
  render: ({ variant }) => html`
    <md-card
      variant=${variant}
      interactive
      disabled
      style="max-inline-size: 360px; padding: 1rem;"
    >
      <div slot="header" style="margin-block-end: 0.5rem;">
        <strong>Unavailable Card</strong>
        <p style="margin: 0; font-size: 0.875rem; opacity: 0.7;">
          This content is currently unavailable
        </p>
      </div>
      <p style="margin: 0;">
        The card is disabled: <code>opacity: 0.38</code>,
        <code>pointer-events: none</code>, and removed from the tab order.
      </p>
    </md-card>
  `,
};

/** All three variants rendered side by side for quick comparison. */
/** @type {Story} */
export const AllVariants = {
  render: () => html`
    <div
      style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;"
    >
      <md-card variant="elevated" style="inline-size: 240px; padding: 1rem;">
        <div slot="header" style="margin-block-end: 0.5rem;">
          <strong>Elevated</strong>
        </div>
        <p style="margin: 0; font-size: 0.875rem;">
          Surface container low with shadow at elevation 1.
        </p>
      </md-card>

      <md-card variant="filled" style="inline-size: 240px; padding: 1rem;">
        <div slot="header" style="margin-block-end: 0.5rem;">
          <strong>Filled</strong>
        </div>
        <p style="margin: 0; font-size: 0.875rem;">
          Surface container highest, no shadow.
        </p>
      </md-card>

      <md-card variant="outlined" style="inline-size: 240px; padding: 1rem;">
        <div slot="header" style="margin-block-end: 0.5rem;">
          <strong>Outlined</strong>
        </div>
        <p style="margin: 0; font-size: 0.875rem;">
          Surface colour with outline-variant border, no shadow.
        </p>
      </md-card>
    </div>
  `,
};
