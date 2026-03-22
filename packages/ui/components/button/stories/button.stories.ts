import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import logout from "@material-design-icons/svg/filled/logout.svg?raw";

import "../button.ts";
import "../../icon/icon.ts";

import type Button from "../button.ts";

function ButtonStory({
  variant = "filled",
  children,
  disabled = false,
  loading = false,
  href,
}: Button) {
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

const meta = {
  title: "Button",
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
} satisfies Meta<Button>;
export default meta;

type Story = StoryObj<Button>;

export const Regular: Story = {
  args: {
    children: unsafeHTML(`Label`) as HTMLCollection,
    disabled: false,
  },
};

export const AllVariants: Story = {
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

export const AllVariantsDisabled: Story = {
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

export const AllVariantsLoading: Story = {
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

export const WithIcon: Story = {
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

export const AsLink: Story = {
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
