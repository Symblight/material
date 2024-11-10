import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "../avatar";

import type AvatarProps from "../avatar.ts";

function Avatar({ src }: AvatarProps) {
  return html` <md-avatar src=${src}></md-avatar> `;
}

const meta = {
  title: "Avatars",
  component: "md-avatar",
  tags: ["autodocs"],
  render: Avatar,
  argTypes: {
    src: {
      control: { type: "text" }, // Automatically inferred when 'options' is defined
    },
  },
} satisfies Meta<AvatarProps>;
export default meta;

type Story = StoryObj<AvatarProps>;

export const Regular: Story = {
  args: {
    src: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Andrew_Lincoln_%2814774060355%29_%28cropped%29.jpg",
  },
};
