import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import close from "@material-design-icons/svg/filled/close.svg?raw";

import "../dialog.ts";
import "../../button/button.ts";
import "../../text-field/text-field.ts";

import type PvDialogProps from "../dialog.ts";

function Template({ open }: PvDialogProps) {
  function handleToggle() {
    const dialog = document.querySelector("md-dialog");

    if (!dialog) return;

    if (!dialog.open) {
      dialog.show();
    } else {
      dialog.close();
    }
  }
  return html`
    <md-button @click=${handleToggle}>Open</md-button>
    <md-dialog>
      <div
        slot="headline"
        style="display: flex; gap: 1rem;justify-content: space-between;align-items: center;"
      >
        <h3 style="margin: 0;padding: 0;">Dialog headline</h3>
        <div class="dialog__button-close">
          <md-icon-button variant="standard">
            <md-icon>${unsafeSVG(close)}</md-icon>
          </md-icon-button>
        </div>
      </div>
      <div>
        <form>
          <p>
          Material Design is an adaptable system of guidelines, components, and
          tools that support the best practices of user interface design. Backed
          by open-source code, Material Design streamlines collaboration between
          designers and developers, and helps teams quickly build beautiful
          products.
          </p>
          <md-text-field></md-text-field>
        </form>
      </div>
      <div
        slot="footer"
        style="display: flex;justify-content: flex-end;gap: 1rem;"
      >
        <md-button variant="text" @click=${handleToggle}>Submit</md-button>
        <md-button variant="tonal" @click=${handleToggle}>Cancel</md-button>
      </div>
    </md-dialog>
  `;
}

const meta = {
  title: "Dialog",
  component: "md-dialog",
  tags: ["autodocs"],
  render: Template,
  argTypes: {
    open: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<PvDialogProps>;
export default meta;

type Story = StoryObj<PvDialogProps>;
export const Regular: Story = {
  args: {},
};
