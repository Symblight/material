import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ref, createRef } from "lit/directives/ref.js";
import close from "@material-design-icons/svg/filled/close.svg?raw";

import "../dialog.js";
import "../../button/button.js";
import "../../text-field/text-field.js";

/** @import PvDialogProps from "../dialog.js" */

/** @param {PvDialogProps} props */
function Template({ open }) {
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
            Material Design is an adaptable system of guidelines, components,
            and tools that support the best practices of user interface design.
            Backed by open-source code, Material Design streamlines
            collaboration between designers and developers, and helps teams
            quickly build beautiful products.
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

/** @type {import("@storybook/web-components").Meta<PvDialogProps>} */
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
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<PvDialogProps>} Story */
/** @type {Story} */
export const Regular = {
  args: {},
};

/**
 * `md-dialog` only toggles visibility — it never resets content projected
 * into its slots. If a field's value should clear when the dialog closes,
 * wrap it in a `<form>` and reset that form yourself (e.g. on the dialog's
 * `closed` event). `md-text-field` is a form-associated custom element, so
 * `form.reset()` triggers its native `formResetCallback` correctly.
 */
function FormResetTemplate() {
  /** @type {import("lit/directives/ref.js").Ref<import("../dialog.js").default>} */
  const dialogRef = createRef();
  /** @type {import("lit/directives/ref.js").Ref<HTMLFormElement>} */
  const formRef = createRef();

  function handleOpen() {
    dialogRef.value?.show();
  }

  function handleCancel() {
    dialogRef.value?.close();
  }

  function handleSubmit() {
    dialogRef.value?.close();
  }

  function handleClosed() {
    formRef.value?.reset();
  }

  return html`
    <md-button @click=${handleOpen}>Open with form</md-button>
    <md-dialog ${ref(dialogRef)} @closed=${handleClosed}>
      <div
        slot="headline"
        style="display: flex; gap: 1rem;justify-content: space-between;align-items: center;"
      >
        <h3 style="margin: 0;padding: 0;">Sign in</h3>
        <div class="dialog__button-close">
          <md-icon-button variant="standard" @click=${handleCancel}>
            <md-icon>${unsafeSVG(close)}</md-icon>
          </md-icon-button>
        </div>
      </div>
      <div>
        <form ${ref(formRef)}>
          <p>
            Type something below, close the dialog (Cancel, Submit, or the close
            icon), then reopen it — the field is empty again because closing
            resets the form.
          </p>
          <md-text-field name="email" label="Email"></md-text-field>
        </form>
      </div>
      <div
        slot="footer"
        style="display: flex;justify-content: flex-end;gap: 1rem;"
      >
        <md-button variant="text" @click=${handleCancel}>Cancel</md-button>
        <md-button variant="tonal" @click=${handleSubmit}>Submit</md-button>
      </div>
    </md-dialog>
  `;
}

/** @type {Story} */
export const FormWithReset = {
  render: FormResetTemplate,
};
