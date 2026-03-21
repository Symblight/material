import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import edit from "@material-design-icons/svg/filled/edit.svg?raw";

import type ChipProps from "../chip";

import "../chip.ts";
import "../../icon/icon.ts";

function Chip({ variant = "outlined", children, disabled = false }: ChipProps) {
  return html`
    <md-chip variant=${variant} ?disabled=${disabled}> ${children} </md-chip>
  `;
}

const meta = {
  title: "Chip",
  component: "md-chip",
  tags: ["autodocs"],
  render: Chip,
  argTypes: {
    variant: {
      options: ["elevated", "outlined"],
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    children: {
      control: { type: "text" },
      type: "string",
      value: "sds",
    },
  },
} satisfies Meta<ChipProps>;
export default meta;

type Story = StoryObj<ChipProps>;

export const Regular: Story = {
  args: {
    children: html`Label` as unknown as HTMLCollection,
    disabled: false,
    href: undefined,
  },
};
