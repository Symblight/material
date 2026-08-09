import { html } from "lit";

import "../select";
import "../../button/button.js";

/** @import SelectProps from "../select.js" */

/** @param {SelectProps} props */
function Select({ variant, disabled }) {
  const handleChange = (event) => {
    console.log(event.target.value);
  };
  return html`
    <md-select
      label="Role"
      ?disabled=${disabled}
      variant=${variant}
      @change=${handleChange}
    >
      <md-option value="">--Please choose an option--</md-option>
      <md-option value="tutor"> Tutor </md-option>
      <md-option value="student" selected> Student </md-option>
      <md-option value="classroom"> Classroom </md-option>
    </md-select>
  `;
}

/** @type {import("@storybook/web-components").Meta<SelectProps>} */
const meta = {
  title: "Components/Select",
  component: "md-select",
  tags: ["autodocs"],
  render: Select,
  argTypes: {
    variant: {
      options: ["filled", "outlined"],
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<SelectProps>} Story */

/** @type {Story} */
export const Regular = {
  args: {},
};

/** @type {Story} */
export const Form = {
  args: {},
  render: ({}) => {
    function handleSubmit(e) {
      e.preventDefault();
      const formData = new FormData(/** @type {HTMLFormElement} */ (e.target));
      console.log(formData);
    }

    function handleReset() {
      document.querySelector("form")?.reset();
    }

    async function handleLoad() {
      const fetcher = () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(["Mirro", "Quizlet", "Google meet"]), 300),
        );

      const result = await fetcher();

      const selectEl = document.querySelector("#select");
      result.forEach((el) => {
        const optionEl = document.createElement("md-option");
        optionEl.setAttribute("value", el);
        optionEl.innerText = el;
        selectEl.appendChild(optionEl);
      });
    }

    return html`<form @submit=${handleSubmit}>
        <md-select id="select" name="my-select"> </md-select>
        <md-button type="submit">Submit</md-button>
        <md-button type="button" @click=${handleReset}>Reset</md-button>
      </form>

      <md-button @click=${handleLoad}>Load more</md-button> `;
  },
};

/** @type {Story} */
export const Outlined = {
  args: { variant: "outlined" },
};

/** @type {Story} */
export const Disabled = {
  args: { disabled: true },
};

/** @type {Story} */
export const Required = {
  args: {},
  render: () => html`
    <form
      @submit=${(e) => {
        e.preventDefault();
        console.log(new FormData(/** @type {HTMLFormElement} */ (e.target)));
      }}
    >
      <md-select label="Role" name="role" required>
        <md-option value="">--Please choose an option--</md-option>
        <md-option value="tutor">Tutor</md-option>
        <md-option value="student">Student</md-option>
      </md-select>
      <md-button type="submit">Submit</md-button>
    </form>
  `,
};

/** @type {Story} */
export const Multiple = {
  args: {},
  render: () => html`
    <md-select label="Roles" name="roles" multiple size=${4}>
      <md-option value="tutor">Tutor</md-option>
      <md-option value="student" selected>Student</md-option>
      <md-option value="classroom">Classroom</md-option>
      <md-option value="online">Online</md-option>
    </md-select>
  `,
};

/** @type {Story} */
export const Group = {
  args: {},
  render: () => {
    return html`
      <md-select label="Location" name="my-select">
        <md-option value="">--Please choose an option--</md-option>
        <md-optgroup label="Person">
          <md-option value="tutor"> Tutor </md-option>
          <md-option value="student"> Student </md-option>
        </md-optgroup>
        <md-hr></md-hr>
        <md-optgroup label="Place">
          <md-option value="classroom"> Classroom </md-option>
          <md-option value="online"> Online </md-option>
        </md-optgroup>
      </md-select>
    `;
  },
};
