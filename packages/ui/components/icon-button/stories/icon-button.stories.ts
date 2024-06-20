import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import settings from "@material-design-icons/svg/outlined/settings.svg?raw";
import visibility from "@material-design-icons/svg/outlined/visibility.svg?raw";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import "../icon-button.ts";
import "../../icon/icon.ts";

import type IconButtonProps from "../icon-button.ts";

function IconButton({
  variant = "standard",
  children,
  disabled = false,
  toggle = false,
  selected = true,
  href,
}: IconButtonProps) {
  return html`
    <md-icon-button
      variant=${variant}
      ?disabled=${disabled}
      ?toggle=${toggle}
      ?selected=${selected}
      href=${href}
    >
      ${children}
    </md-icon-button>
  `;
}

const meta = {
  title: "Icon Button",
  component: "md-icon-button",
  tags: ["autodocs"],
  render: IconButton,
  argTypes: {
    variant: {
      options: ["filled", "outlined", "standard", "tonal"],
      control: { type: "select" },
    },
    selected: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    toggle: {
      control: { type: "boolean" },
    },
    href: {
      control: { type: "text" },
    },
  },
  args: {
    children: html` <md-icon
      >${unsafeSVG(settings)}</md-icon
    >` as unknown as HTMLCollection,
  },
} satisfies Meta<IconButtonProps>;
export default meta;

type Story = StoryObj<IconButtonProps>;

export const Regular: Story = {
  args: {
    children: html`<md-icon
      >${unsafeSVG(settings)}</md-icon
    >` as unknown as HTMLCollection,
    disabled: false,
    href: undefined,
  },
};

export const Selected: Story = {
  args: {
    children: html` <md-icon slot="selected">${unsafeSVG(visibility)}</md-icon
      ><md-icon>${unsafeSVG(settings)}</md-icon>` as unknown as HTMLCollection,
    disabled: false,
    href: undefined,
  },
};
