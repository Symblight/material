import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import logout from "@material-design-icons/svg/filled/logout.svg?raw";

import type ButtonProps from "../fab-button";

import "../fab-button";

function Button({
  variant = "filled",
  children,
  danger = false,
  disabled = false,
  loading = false,
  href,
}: ButtonProps) {
  return html`
    <md-fab-button
      variant=${variant}
      ?danger=${danger}
      ?disabled=${disabled}
      ?loading=${loading}
      href=${href}
    >
      ${children}
    </md-fab-button>
  `;
}

const meta = {
  title: "FABButton",
  component: "md-fab-button",
  tags: ["autodocs"],
  render: Button,
  argTypes: {
    variant: {
      options: ["filled", "outlined", "text", "elevated", "tonal"],
      control: { type: "select" },
    },
    danger: {
      control: { type: "boolean" },
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
} satisfies Meta<ButtonProps>;
export default meta;

type Story = StoryObj<ButtonProps>;

export const Regular: Story = {
  args: {
    children: unsafeHTML(`Label`) as HTMLCollection,
    disabled: false,
    danger: false,
    href: undefined,
  },
};
