import { html } from "lit";
import settings from "@material-design-icons/svg/outlined/settings.svg?raw";
import visibility from "@material-design-icons/svg/outlined/visibility.svg?raw";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import "../icon-button.js";
import "../../icon/icon.js";

/** @import IconButtonProps from "../icon-button.js" */

/** @param {IconButtonProps} props */
function IconButton({
  variant = "standard",
  children,
  disabled = false,
  toggle = false,
  selected = true,
  href,
}) {
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

/** @type {import("@storybook/web-components").Meta<IconButtonProps>} */
const meta = {
  title: "Components/Icon Button",
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
    children: /** @type {HTMLCollection} */ (
      /** @type {unknown} */ (
        html` <md-icon>${unsafeSVG(settings)}</md-icon>
          <md-icon slot="selected">${unsafeSVG(visibility)}</md-icon
          ><md-icon></md-icon>`
      )
    ),
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<IconButtonProps>} Story */

/** @type {Story} */
export const Regular = {
  args: {
    children: /** @type {HTMLCollection} */ (
      /** @type {unknown} */ (
        html` <md-icon slot="selected">${unsafeSVG(visibility)}</md-icon
          ><md-icon>${unsafeSVG(settings)}</md-icon>`
      )
    ),
    disabled: false,
    href: undefined,
  },
};

/** @type {Story} */
export const Selected = {
  args: {
    children: /** @type {HTMLCollection} */ (
      /** @type {unknown} */ (
        html` <md-icon slot="selected">${unsafeSVG(visibility)}</md-icon
          ><md-icon>${unsafeSVG(settings)}</md-icon>`
      )
    ),
    disabled: false,
    href: undefined,
  },
};
