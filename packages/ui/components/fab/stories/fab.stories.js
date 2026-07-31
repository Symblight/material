import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import edit from "@material-design-icons/svg/filled/edit.svg?raw";

/** @import ButtonProps from "../fab" */

import "../fab.js";
import "../../icon/icon.js";

/** @param {ButtonProps} props */
function Button({
  variant = "surface",
  children,
  disabled = false,
  size = "m",
  label = "",
  href,
}) {
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

/** @type {import("@storybook/web-components").Meta<ButtonProps>} */
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
    },
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<ButtonProps>} Story */

/** @type {Story} */
export const Regular = {
  args: {
    children: /** @type {HTMLCollection} */ (
      /** @type {unknown} */ (
        html`<md-icon slot="icon">${unsafeSVG(edit)}</md-icon>`
      )
    ),
    disabled: false,
    href: undefined,
  },
};
