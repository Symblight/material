import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import inboxIcon from "@material-design-icons/svg/filled/inbox.svg?raw";
import sendIcon from "@material-design-icons/svg/filled/send.svg?raw";
import draftsIcon from "@material-design-icons/svg/filled/drafts.svg?raw";
import deleteIcon from "@material-design-icons/svg/filled/delete.svg?raw";
import chevronRightIcon from "@material-design-icons/svg/filled/chevron_right.svg?raw";
import settingsIcon from "@material-design-icons/svg/filled/settings.svg?raw";
import personIcon from "@material-design-icons/svg/filled/person.svg?raw";
import notificationsIcon from "@material-design-icons/svg/filled/notifications.svg?raw";
import lockIcon from "@material-design-icons/svg/filled/lock.svg?raw";

import "../list.ts";
import "../../checkbox/checkbox.ts";
import "../../icon/icon.ts";

const meta = {
  title: "Components/List",
  component: "md-list",
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * Basic non-interactive list. Each item has a leading icon and trailing
 * text metadata. Slots collapse when empty.
 */
export const Basic: Story = {
  render: () => html`
    <md-list style="max-inline-size: 360px; border-radius: 0.75rem;">
      <md-list-item>
        <md-icon slot="leading">${unsafeSVG(inboxIcon)}</md-icon>
        Inbox
        <span slot="trailing">24</span>
      </md-list-item>
      <md-list-item>
        <md-icon slot="leading">${unsafeSVG(sendIcon)}</md-icon>
        Sent
        <span slot="trailing">5</span>
      </md-list-item>
      <md-list-item>
        <md-icon slot="leading">${unsafeSVG(draftsIcon)}</md-icon>
        Drafts
        <span slot="trailing">2</span>
      </md-list-item>
      <md-list-item>
        <md-icon slot="leading">${unsafeSVG(deleteIcon)}</md-icon>
        Trash
        <span slot="trailing">0</span>
      </md-list-item>
    </md-list>
  `,
};

/**
 * Two-line list items using the `overline` and `supporting-text` slots.
 * The item height grows automatically to accommodate all three text rows.
 */
export const TwoLine: Story = {
  render: () => html`
    <md-list style="max-inline-size: 360px; border-radius: 0.75rem;">
      <md-list-item>
        <span slot="overline">Work</span>
        Project Alpha
        <span slot="supporting-text">Due in 3 days</span>
        <span slot="trailing">Jan 6</span>
      </md-list-item>
      <md-list-item>
        <span slot="overline">Personal</span>
        Dentist Appointment
        <span slot="supporting-text">Confirmed — 2:30 PM</span>
        <span slot="trailing">Jan 9</span>
      </md-list-item>
      <md-list-item>
        <span slot="overline">Work</span>
        Team Retrospective
        <span slot="supporting-text">Zoom link in calendar</span>
        <span slot="trailing">Jan 12</span>
      </md-list-item>
      <md-list-item>
        <span slot="overline">Personal</span>
        Grocery Shopping
        <span slot="supporting-text">See shared list</span>
        <span slot="trailing">Jan 14</span>
      </md-list-item>
    </md-list>
  `,
};

/**
 * Interactive button items with leading avatar and trailing checkbox.
 * Arrow keys navigate between items; the checkbox is independently clickable.
 */
export const InteractiveButtons: Story = {
  render: () => html`
    <md-list style="max-inline-size: 360px; border-radius: 0.75rem;">
      <md-list-item button>
        <img slot="leading" src="https://i.pravatar.cc/40?img=1" alt="Alice" />
        Alice Johnson
        <span slot="supporting-text">alice@example.com</span>
        <md-checkbox slot="trailing"></md-checkbox>
      </md-list-item>
      <md-list-item>
        <img slot="leading" src="https://i.pravatar.cc/40?img=2" alt="Bob" />
        Non interactive
        <span slot="supporting-text">bob@example.com</span>
        <md-checkbox slot="trailing"></md-checkbox>
      </md-list-item>
      <md-list-item button>
        <img slot="leading" src="https://i.pravatar.cc/40?img=3" alt="Carol" />
        Carol Williams
        <span slot="supporting-text">carol@example.com</span>
        <md-checkbox slot="trailing"></md-checkbox>
      </md-list-item>
      <md-list-item button>
        <img slot="leading" src="https://i.pravatar.cc/40?img=4" alt="Dave" />
        Dave Brown
        <span slot="supporting-text">dave@example.com</span>
        <md-checkbox slot="trailing"></md-checkbox>
      </md-list-item>
    </md-list>
  `,
};

/**
 * Interactive link items rendered as `<a>` elements. Each item has a
 * leading media thumbnail and a trailing chevron icon.
 */
export const InteractiveLinks: Story = {
  render: () => html`
    <md-list style="max-inline-size: 360px; border-radius: 0.75rem;">
      <md-list-item href="/settings">
        <md-icon slot="leading">${unsafeSVG(settingsIcon)}</md-icon>
        Settings
        <span slot="supporting-text">Manage your preferences</span>
        <md-icon slot="trailing">${unsafeSVG(chevronRightIcon)}</md-icon>
      </md-list-item>
      <md-list-item href="/profile">
        <md-icon slot="leading">${unsafeSVG(personIcon)}</md-icon>
        Profile
        <span slot="supporting-text">Edit your personal details</span>
        <md-icon slot="trailing">${unsafeSVG(chevronRightIcon)}</md-icon>
      </md-list-item>
      <md-list-item href="/notifications">
        <md-icon slot="leading">${unsafeSVG(notificationsIcon)}</md-icon>
        Notifications
        <span slot="supporting-text">Configure alerts and reminders</span>
        <md-icon slot="trailing">${unsafeSVG(chevronRightIcon)}</md-icon>
      </md-list-item>
      <md-list-item href="/privacy">
        <md-icon slot="leading">${unsafeSVG(lockIcon)}</md-icon>
        Privacy
        <span slot="supporting-text">Control your data and visibility</span>
        <md-icon slot="trailing">${unsafeSVG(chevronRightIcon)}</md-icon>
      </md-list-item>
    </md-list>
  `,
};

/**
 * Leading selection: each item has an `md-checkbox` in the `leading-selection`
 * slot, placing the control on the left side before the text zone.
 */
export const LeadingSelection: Story = {
  render: () => html`
    <md-list style="max-inline-size: 360px; border-radius: 0.75rem;">
      <md-list-item button>
        <md-checkbox slot="leading"></md-checkbox>
        Select all items
      </md-list-item>
      <md-list-item button>
        <md-checkbox slot="leading"></md-checkbox>
        Inbox
        <span slot="supporting-text">24 messages</span>
      </md-list-item>
      <md-list-item button>
        <md-checkbox slot="leading"></md-checkbox>
        Sent
        <span slot="supporting-text">5 messages</span>
      </md-list-item>
      <md-list-item button>
        <md-checkbox slot="leading"></md-checkbox>
        Drafts
        <span slot="supporting-text">2 messages</span>
      </md-list-item>
    </md-list>
  `,
};
