import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import "../segmented-button.js";
import "../segmented-button-group.js";
import "../../icon/icon.js";

import musicIcon from "@material-design-icons/svg/outlined/music_note.svg?raw";
import movieIcon from "@material-design-icons/svg/outlined/movie.svg?raw";
import bookIcon from "@material-design-icons/svg/outlined/book.svg?raw";

/** @type {import("@storybook/web-components").Meta} */
const meta = {
  title: "Components/Segmented Button",
  component: "md-segmented-button-group",
  tags: ["autodocs"],
  argTypes: {
    multiselect: {
      control: "boolean",
      description:
        "Enables independent toggle selection instead of single-select.",
    },
    value: {
      control: "text",
      description: "The selected value (single-select mode only).",
    },
    label: {
      control: "text",
      description: "Accessible name for the group (aria-label).",
    },
    disabled: {
      control: "boolean",
      description: "Cascades a disabled state down to every segment.",
    },
  },
};

export default meta;

/** @typedef {import("@storybook/web-components").StoryObj} Story */

function handleChange(e) {
  // eslint-disable-next-line no-console
  console.log("change", e.detail);
}

// ── Default (single-select) ───────────────────────────────────────────────────

/** Single-select group — clicking a segment selects it and deselects the others. */
export const Default = {
  args: { label: "View density" },
  render: ({ label }) => html`
    <md-segmented-button-group
      label=${label}
      value="day"
      @change=${handleChange}
    >
      <md-segmented-button value="day">Day</md-segmented-button>
      <md-segmented-button value="week">Week</md-segmented-button>
      <md-segmented-button value="month">Month</md-segmented-button>
    </md-segmented-button-group>
  `,
};

// ── Multi-select ───────────────────────────────────────────────────────────────

/** Multi-select group — each segment toggles independently. */
export const MultiSelect = {
  args: { label: "Text style" },
  render: ({ label }) => html`
    <md-segmented-button-group
      multiselect
      label=${label}
      .values=${["bold"]}
      @change=${handleChange}
    >
      <md-segmented-button value="bold">Bold</md-segmented-button>
      <md-segmented-button value="italic">Italic</md-segmented-button>
      <md-segmented-button value="underline">Underline</md-segmented-button>
    </md-segmented-button-group>
  `,
};

// ── With leading icons ───────────────────────────────────────────────────────────

/** Segments with a leading icon — swapped for a checkmark once selected. */
export const WithIcons = {
  render: () => html`
    <md-segmented-button-group label="Media type" value="music">
      <md-segmented-button value="music">
        <md-icon slot="icon">${unsafeSVG(musicIcon)}</md-icon>
        Music
      </md-segmented-button>
      <md-segmented-button value="movies">
        <md-icon slot="icon">${unsafeSVG(movieIcon)}</md-icon>
        Movies
      </md-segmented-button>
      <md-segmented-button value="books">
        <md-icon slot="icon">${unsafeSVG(bookIcon)}</md-icon>
        Books
      </md-segmented-button>
    </md-segmented-button-group>
  `,
};

// ── Icon-only ─────────────────────────────────────────────────────────────────

/** Icon-only segments — no label slot content. */
export const IconOnly = {
  render: () => html`
    <md-segmented-button-group label="Media type" value="music">
      <md-segmented-button value="music">
        <md-icon slot="icon">${unsafeSVG(musicIcon)}</md-icon>
      </md-segmented-button>
      <md-segmented-button value="movies">
        <md-icon slot="icon">${unsafeSVG(movieIcon)}</md-icon>
      </md-segmented-button>
      <md-segmented-button value="books">
        <md-icon slot="icon">${unsafeSVG(bookIcon)}</md-icon>
      </md-segmented-button>
    </md-segmented-button-group>
  `,
};

// ── Disabled ──────────────────────────────────────────────────────────────────

/** Disabled group — cascades disabled to every segment. */
export const Disabled = {
  render: () => html`
    <md-segmented-button-group label="View density" value="day" disabled>
      <md-segmented-button value="day">Day</md-segmented-button>
      <md-segmented-button value="week">Week</md-segmented-button>
      <md-segmented-button value="month">Month</md-segmented-button>
    </md-segmented-button-group>
  `,
};

// ── Disabled segment ──────────────────────────────────────────────────────────

/** A single disabled segment inside an otherwise enabled group — skipped by arrow-key navigation. */
export const WithDisabledSegment = {
  render: () => html`
    <md-segmented-button-group label="View density" value="day">
      <md-segmented-button value="day">Day</md-segmented-button>
      <md-segmented-button value="week" disabled>Week</md-segmented-button>
      <md-segmented-button value="month">Month</md-segmented-button>
    </md-segmented-button-group>
  `,
};

// ── All Variants ──────────────────────────────────────────────────────────────

/** All segmented button states side-by-side. */
export const AllVariants = {
  name: "All Variants",
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 2rem; font-family: sans-serif;"
    >
      <div>
        <p style="font-size: 0.75rem; color: #666; margin: 0 0 0.5rem;">
          Single-select
        </p>
        <md-segmented-button-group label="View density" value="day">
          <md-segmented-button value="day">Day</md-segmented-button>
          <md-segmented-button value="week">Week</md-segmented-button>
          <md-segmented-button value="month">Month</md-segmented-button>
        </md-segmented-button-group>
      </div>

      <div>
        <p style="font-size: 0.75rem; color: #666; margin: 0 0 0.5rem;">
          Multi-select
        </p>
        <md-segmented-button-group
          multiselect
          label="Text style"
          .values=${["bold"]}
        >
          <md-segmented-button value="bold">Bold</md-segmented-button>
          <md-segmented-button value="italic">Italic</md-segmented-button>
          <md-segmented-button value="underline">Underline</md-segmented-button>
        </md-segmented-button-group>
      </div>

      <div>
        <p style="font-size: 0.75rem; color: #666; margin: 0 0 0.5rem;">
          With icons
        </p>
        <md-segmented-button-group label="Media type" value="music">
          <md-segmented-button value="music">
            <md-icon slot="icon">${unsafeSVG(musicIcon)}</md-icon>
            Music
          </md-segmented-button>
          <md-segmented-button value="movies">
            <md-icon slot="icon">${unsafeSVG(movieIcon)}</md-icon>
            Movies
          </md-segmented-button>
        </md-segmented-button-group>
      </div>

      <div>
        <p style="font-size: 0.75rem; color: #666; margin: 0 0 0.5rem;">
          Disabled
        </p>
        <md-segmented-button-group label="View density" value="day" disabled>
          <md-segmented-button value="day">Day</md-segmented-button>
          <md-segmented-button value="week">Week</md-segmented-button>
          <md-segmented-button value="month">Month</md-segmented-button>
        </md-segmented-button-group>
        <md-segmented-button-group label="View density" value="day">
          <md-segmented-button value="day">Day</md-segmented-button>
          <md-segmented-button value="week" disabled>Week</md-segmented-button>
          <md-segmented-button value="month">Month</md-segmented-button>
        </md-segmented-button-group>
      </div>
    </div>
  `,
};
