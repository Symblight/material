import { html } from "lit";

import "../index.js";
import "../../button/button.js";

/** @import { MdSnackbar } from "../snackbar.js" */

const LONG_TEXT =
  "This is a longer supporting text that wraps onto a second line so the two-line snackbar layout can be demonstrated.";

/** @type {import("@storybook/web-components").Meta<MdSnackbar>} */
const meta = {
  title: "Components/Snackbar",
  component: "md-snackbar",
  tags: ["autodocs"],
  argTypes: {
    showClose: {
      control: { type: "boolean" },
      description:
        "Shows a close icon button. Clicking it only dispatches a `close` event.",
    },
    multiline: {
      control: { type: "boolean" },
      description: "Two-line layout (68dp minimum height).",
    },
    stacked: {
      control: { type: "boolean" },
      description: "Longer-action layout: the action moves below the text.",
    },
    closeLabel: {
      control: { type: "text" },
      description: "Accessible label of the close icon button.",
    },
  },
  args: {
    showClose: false,
    multiline: false,
    stacked: false,
    closeLabel: "Close",
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<MdSnackbar>} Story */

/** @param {MdSnackbar} args */
const renderSnackbar = (
  { showClose, multiline, stacked, closeLabel },
  content,
  action,
) => html`
  <md-snackbar
    ?show-close=${showClose}
    ?multiline=${multiline}
    ?stacked=${stacked}
    close-label=${closeLabel}
  >
    ${content}
    ${action ? html`<md-button slot="action" variant="text">${action}</md-button>` : null}
  </md-snackbar>
`;

/** Single-line snackbar with supporting text only. */
/** @type {Story} */
export const Default = {
  render: (args) => renderSnackbar(args, "Single-line snackbar"),
};

/** Single-line snackbar with an action. */
/** @type {Story} */
export const WithAction = {
  render: (args) => renderSnackbar(args, "Message archived", "Undo"),
};

/** Snackbar with a close icon button. The click only emits `close`. */
/** @type {Story} */
export const WithClose = {
  args: { showClose: true },
  render: (args) => renderSnackbar(args, "Message archived", "Undo"),
};

/** Two-line supporting text. */
/** @type {Story} */
export const TwoLine = {
  args: { multiline: true, showClose: true },
  render: (args) => renderSnackbar(args, LONG_TEXT, "Action"),
};

/** Longer action: the action sits below the supporting text. */
/** @type {Story} */
export const LongerAction = {
  args: { stacked: true, showClose: true },
  render: (args) => renderSnackbar(args, LONG_TEXT, "Longer action"),
};

/** All layout variants side by side. */
/** @type {Story} */
export const AllVariants = {
  render: () => html`
    <div
      style="display:flex; flex-direction:column; gap:1rem; align-items:flex-start;"
    >
      <md-snackbar>Single-line</md-snackbar>
      <md-snackbar>
        Single-line with action
        <md-button slot="action" variant="text">Action</md-button>
      </md-snackbar>
      <md-snackbar show-close multiline>
        ${LONG_TEXT}
        <md-button slot="action" variant="text">Action</md-button>
      </md-snackbar>
      <md-snackbar show-close stacked>
        ${LONG_TEXT}
        <md-button slot="action" variant="text">Longer action</md-button>
      </md-snackbar>
    </div>
  `,
};
