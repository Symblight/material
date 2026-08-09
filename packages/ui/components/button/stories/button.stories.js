import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ref } from "lit/directives/ref.js";
import logout from "@material-design-icons/svg/filled/logout.svg?raw";

import "../button.js";
import "../../icon/icon.js";

/** @import Button from "../button.js" */

/** @param {Button} props */
function ButtonStory({
  variant = "filled",
  children,
  disabled = false,
  loading = false,
  href,
}) {
  return html`
    <md-button
      variant=${variant}
      ?disabled=${disabled}
      ?loading=${loading}
      href=${href}
    >
      ${children}
    </md-button>
  `;
}

/** @type {import("@storybook/web-components").Meta<Button>} */
const meta = {
  title: "Components/Button",
  component: "md-button",
  tags: ["autodocs"],
  render: ButtonStory,
  argTypes: {
    variant: {
      options: ["filled", "outlined", "text", "elevated", "tonal"],
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    href: {
      control: { type: "text" },
    },
    loading: {
      control: { type: "boolean" },
    },
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<Button>} Story */

// ─── Regular — controls-driven playground ───────────────────────────────────

/** @type {Story} */
export const Regular = {
  args: {
    children: /** @type {HTMLCollection} */ (unsafeHTML(`Label`)),
    disabled: false,
  },
};

// ─── Variants — all five visual styles side by side ─────────────────────────

/** @type {Story} */
export const AllVariants = {
  render: () => html`
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
      <md-button variant="filled">Filled</md-button>
      <md-button variant="outlined">Outlined</md-button>
      <md-button variant="text">Text</md-button>
      <md-button variant="elevated">Elevated</md-button>
      <md-button variant="tonal">Tonal</md-button>
    </div>
  `,
};

// ─── Disabled — every variant, non-interactive ──────────────────────────────

/** @type {Story} */
export const AllVariantsDisabled = {
  render: () => html`
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
      <md-button variant="filled" disabled>Filled</md-button>
      <md-button variant="outlined" disabled>Outlined</md-button>
      <md-button variant="text" disabled>Text</md-button>
      <md-button variant="elevated" disabled>Elevated</md-button>
      <md-button variant="tonal" disabled>Tonal</md-button>
    </div>
  `,
};

// ─── Loading — static snapshot of the spinner state (see AsyncAction below
// for the actual click → loading → settle flow) ─────────────────────────────

/** @type {Story} */
export const AllVariantsLoading = {
  render: () => html`
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
      <md-button variant="filled" loading>Filled</md-button>
      <md-button variant="outlined" loading>Outlined</md-button>
      <md-button variant="text" loading>Text</md-button>
      <md-button variant="elevated" loading>Elevated</md-button>
      <md-button variant="tonal" loading>Tonal</md-button>
    </div>
  `,
};

// ─── With icon — leading icon slot, every variant ───────────────────────────

/** @type {Story} */
export const WithIcon = {
  render: () => html`
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
      <md-button variant="filled">
        Sign out
        <md-icon slot="icon">${unsafeSVG(logout)}</md-icon>
      </md-button>
      <md-button variant="outlined">
        Sign out
        <md-icon slot="icon">${unsafeSVG(logout)}</md-icon>
      </md-button>
      <md-button variant="text">
        Sign out
        <md-icon slot="icon">${unsafeSVG(logout)}</md-icon>
      </md-button>
      <md-button variant="elevated">
        Sign out
        <md-icon slot="icon">${unsafeSVG(logout)}</md-icon>
      </md-button>
      <md-button variant="tonal">
        Sign out
        <md-icon slot="icon">${unsafeSVG(logout)}</md-icon>
      </md-button>
    </div>
  `,
};

// ─── As link — href renders a native <a>, disabled removes it from tab
// order and blocks navigation even though it's still an anchor ─────────────

/** @type {Story} */
export const AsLink = {
  render: () => html`
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
      <md-button variant="filled" href="https://m3.material.io">
        Open link
      </md-button>
      <md-button variant="outlined" href="https://m3.material.io" disabled>
        Disabled link
      </md-button>
    </div>
  `,
};

// ─── Click events — every click is logged live below the button, and the
// disabled button's handler never fires — proving `click` is genuinely
// suppressed, not just visually greyed out ──────────────────────────────────

/** @type {Story} */
export const Clicks = {
  render: () => {
    /** @type {HTMLElement | undefined} */
    let log;
    let count = 0;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="display:flex;gap:1rem;align-items:center;">
          <md-button
            @click=${() => {
              count += 1;
              if (log) {
                log.textContent = `Clicked ${count} time${count === 1 ? "" : "s"}.`;
              }
            }}
          >
            Click me
          </md-button>
          <md-button
            disabled
            @click=${() => {
              if (log) {
                log.textContent =
                  "This should never appear — disabled buttons don't fire click.";
              }
            }}
          >
            Disabled
          </md-button>
        </div>
        <span
          ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        >
          Click the button — the count updates live below. Disabled never
          increments it.
        </span>
      </div>
    `;
  },
};

// ─── Async action — loading toggles on click, matching a real "submit and
// wait for a response" flow: the button disables interaction and shows a
// spinner while `loading` is true, then reverts on its own ─────────────────

/** @type {Story} */
export const AsyncAction = {
  render: () => {
    /** @type {Button | undefined} */
    let button;
    return html`
      <md-button
        variant="tonal"
        ${ref((el) => (button = /** @type {Button | undefined} */ (el)))}
        @click=${() => {
          if (!button || button.loading) return;
          button.loading = true;
          setTimeout(() => {
            if (button) button.loading = false;
          }, 1500);
        }}
      >
        Save changes
      </md-button>
    `;
  },
};
