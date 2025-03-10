import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import edit from "@material-design-icons/svg/filled/edit.svg?raw";

import type ButtonProps from "../fab";

import "../fab.ts";
import "../../icon/icon.ts";

function Button({
  variant = "surface",
  children,
  disabled = false,
  size = "m",
  label = "",
  href,
}: ButtonProps) {
  return html`
    <md-fab
      variant=${variant}
      size=${size}
      ?disabled=${disabled}
      label=${label}
      href=${href}
    >
      ${children}
    </md-fab>
  `;
}

const meta = {
  title: "FABs",
  component: "md-fab",
  tags: ["autodocs"],
  render: Button,
  argTypes: {
    label: {
      control: { type: "text" },
    },
    variant: {
      options: ["surface", "primary", "secondary", "tertiary"],
      control: { type: "select" },
    },
    size: {
      options: ["s", "m", "l"],
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    href: {
      control: { type: "text" },
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
    children: html`<md-icon slot="icon"
      >${unsafeSVG(edit)}</md-icon
    >` as unknown as HTMLCollection,
    disabled: false,
    href: undefined,
  },
};
