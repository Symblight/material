import { html } from "lit";

import "../avatar";

/** @import AvatarProps from "../avatar.js" */

/** @param {AvatarProps} props */
function Avatar({ src }) {
  return html` <md-avatar src=${src}></md-avatar> `;
}

/** @type {import("@storybook/web-components").Meta<AvatarProps>} */
const meta = {
  title: "Components/Avatar",
  component: "md-avatar",
  tags: ["autodocs"],
  render: Avatar,
  argTypes: {
    src: {
      control: { type: "text" }, // Automatically inferred when 'options' is defined
    },
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<AvatarProps>} Story */

/** @type {Story} */
export const Regular = {
  args: {
    src: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Andrew_Lincoln_%2814774060355%29_%28cropped%29.jpg",
  },
};
