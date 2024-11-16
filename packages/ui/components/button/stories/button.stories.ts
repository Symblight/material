import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import logout from "@material-design-icons/svg/filled/logout.svg?raw";

import "../button.ts";
import "../../icon/icon.ts";

import type PvButtonProps from "../button.ts";

function Button({
  variant = "filled",
  children,
  disabled = false,
  loading = false,
  href,
}: PvButtonProps) {
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
  render: Button,
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
    children: {
      control: { type: "text" },
      type: "string",
      defaultValue: unsafeHTML(`Button`) as HTMLCollection,
    },
  },
} satisfies Meta<PvButtonProps>;
export default meta;

type Story = StoryObj<PvButtonProps>;

export const Regular: Story = {
  args: {
    children: unsafeHTML(`Label`) as HTMLCollection,
    disabled: false,
    danger: false,
    href: undefined,
  },
};

export const WithIconContent: Story = {
  args: {
    children: html`Sign out
      <md-icon slot="icon" name="logout"
        >${unsafeSVG(logout)}</md-icon
      >` as unknown as HTMLCollection,
    variant: "filled",
  },
};
