import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import notifications from "@material-design-icons/svg/outlined/notifications.svg?raw";
import mail from "@material-design-icons/svg/outlined/mail.svg?raw";
import settings from "@material-design-icons/svg/outlined/settings.svg?raw";
import shoppingCart from "@material-design-icons/svg/outlined/shopping_cart.svg?raw";

import "../badge.ts";
import "../../avatar/avatar.ts";
import "../../icon-button/icon-button.ts";
import "../../icon/icon.ts";

import type { MdBadge } from "../badge.ts";

function BadgeStory({ value = "", max = 999 }: Partial<MdBadge>) {
  return html` <md-badge value=${value} .max=${max}></md-badge> `;
}

const meta = {
  title: "Badge",
  component: "md-badge",
  tags: ["autodocs"],
  render: BadgeStory,
  argTypes: {
    value: {
      control: { type: "text" },
      description: "Badge label. Leave empty for the small dot variant.",
    },
    max: {
      control: { type: "number" },
      description: "Maximum number before truncating with '+'.",
    },
  },
} satisfies Meta<MdBadge>;

export default meta;
type Story = StoryObj<MdBadge>;

export const SmallDot: Story = {
  args: { value: "" },
};

export const WithNumber: Story = {
  args: { value: "3" },
};

export const LargeNumber: Story = {
  args: { value: "1200", max: 999 },
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display:flex;gap:2rem;align-items:center;flex-wrap:wrap;">
      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;"
      >
        <md-badge></md-badge>
        <span style="font-size:12px;color:#666;">Small (dot)</span>
      </div>
      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;"
      >
        <md-badge value="3"></md-badge>
        <span style="font-size:12px;color:#666;">Single digit</span>
      </div>
      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;"
      >
        <md-badge value="99"></md-badge>
        <span style="font-size:12px;color:#666;">Two digits</span>
      </div>
      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;"
      >
        <md-badge value="1200"></md-badge>
        <span style="font-size:12px;color:#666;">Overflow (999+)</span>
      </div>
    </div>
  `,
};

export const OnIconButton: Story = {
  render: () => html`
    <div style="display:flex;gap:2rem;align-items:center;flex-wrap:wrap;">
      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;"
      >
        <div style="position:relative;display:inline-flex;">
          <md-icon-button variant="standard">
            <md-icon>${unsafeSVG(notifications)}</md-icon>
          </md-icon-button>
          <md-badge
            value="3"
            style="position:absolute;top:2px;right:2px;"
          ></md-badge>
        </div>
        <span style="font-size:12px;color:#666;">Notifications (3)</span>
      </div>

      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;"
      >
        <div style="position:relative;display:inline-flex;">
          <md-icon-button variant="standard">
            <md-icon>${unsafeSVG(mail)}</md-icon>
          </md-icon-button>
          <md-badge
            value="99"
            style="position:absolute;top:2px;right:2px;"
          ></md-badge>
        </div>
        <span style="font-size:12px;color:#666;">Mail (99)</span>
      </div>

      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;"
      >
        <div style="position:relative;display:inline-flex;">
          <md-icon-button variant="standard">
            <md-icon>${unsafeSVG(shoppingCart)}</md-icon>
          </md-icon-button>
          <md-badge
            value="1500"
            style="position:absolute;top:2px;right:2px;"
          ></md-badge>
        </div>
        <span style="font-size:12px;color:#666;">Cart (overflow)</span>
      </div>

      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;"
      >
        <div style="position:relative;display:inline-flex;">
          <md-icon-button variant="filled">
            <md-icon>${unsafeSVG(settings)}</md-icon>
          </md-icon-button>
          <md-badge style="position:absolute;top:2px;right:2px;"></md-badge>
        </div>
        <span style="font-size:12px;color:#666;">Settings (dot)</span>
      </div>
    </div>
  `,
};

export const OnAvatar: Story = {
  render: () => html`
    <div style="display:flex;gap:2.5rem;align-items:center;flex-wrap:wrap;">
      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;"
      >
        <div style="position:relative;display:inline-flex;">
          <md-avatar
            src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Andrew_Lincoln_%2814774060355%29_%28cropped%29.jpg"
          ></md-avatar>
          <md-badge
            value="2"
            style="position:absolute;top:0;right:0;"
          ></md-badge>
        </div>
        <span style="font-size:12px;color:#666;">With count</span>
      </div>

      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;"
      >
        <div style="position:relative;display:inline-flex;">
          <md-avatar
            src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Andrew_Lincoln_%2814774060355%29_%28cropped%29.jpg"
          ></md-avatar>
          <md-badge style="position:absolute;top:0;right:0;"></md-badge>
        </div>
        <span style="font-size:12px;color:#666;">Online (dot)</span>
      </div>

      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;"
      >
        <div style="position:relative;display:inline-flex;">
          <md-avatar></md-avatar>
          <md-badge
            value="7"
            style="position:absolute;top:0;right:0;"
          ></md-badge>
        </div>
        <span style="font-size:12px;color:#666;">No image + count</span>
      </div>
    </div>
  `,
};
