import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import "../assist-chip.ts";
import "../suggestion-chip.ts";
import "../filter-chip.ts";
import "../input-chip.ts";

import calendarIcon from "@material-design-icons/svg/filled/calendar_today.svg?raw";
import directionsIcon from "@material-design-icons/svg/filled/directions.svg?raw";
import tuneIcon from "@material-design-icons/svg/filled/tune.svg?raw";
import tagIcon from "@material-design-icons/svg/filled/tag.svg?raw";
import smartToyIcon from "@material-design-icons/svg/filled/smart_toy.svg?raw";
import checkIcon from "@material-design-icons/svg/filled/check.svg?raw";

const meta = {
  title: "Components/Chips",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj;

// ── Assist Chip ──────────────────────────────────────────────────────────────

export const AssistChip: Story = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
      <md-assist-chip variant="outlined">Outlined</md-assist-chip>
      <md-assist-chip variant="elevated">Elevated</md-assist-chip>
      <md-assist-chip variant="outlined">
        <span slot="leading-icon">${unsafeSVG(calendarIcon)}</span>
        With Icon
      </md-assist-chip>
      <md-assist-chip variant="elevated">
        <span slot="leading-icon">${unsafeSVG(directionsIcon)}</span>
        Elevated + Icon
      </md-assist-chip>
      <md-assist-chip variant="outlined" disabled>Disabled</md-assist-chip>
    </div>
  `,
};

// ── Filter Chip ──────────────────────────────────────────────────────────────

export const FilterChip: Story = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
      <md-filter-chip>Clothes</md-filter-chip>
      <md-filter-chip selected>
        <span slot="selected-icon">${unsafeSVG(checkIcon)}</span>
        Shoes
      </md-filter-chip>
      <md-filter-chip>
        <span slot="leading-icon">${unsafeSVG(tuneIcon)}</span>
        With Icon
      </md-filter-chip>
      <md-filter-chip selected>
        <span slot="selected-icon">${unsafeSVG(checkIcon)}</span>
        Selected + check
      </md-filter-chip>
      <md-filter-chip variant="elevated">Elevated</md-filter-chip>
      <md-filter-chip disabled>Disabled</md-filter-chip>
    </div>
  `,
};

// ── Input Chip ───────────────────────────────────────────────────────────────

export const InputChip: Story = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
      <md-input-chip removable>React</md-input-chip>
      <md-input-chip removable selected>TypeScript</md-input-chip>
      <md-input-chip removable>
        <span slot="leading-icon">${unsafeSVG(tagIcon)}</span>
        With Icon
      </md-input-chip>
      <md-input-chip removable avatar>
        <img slot="avatar" src="https://i.pravatar.cc/24" alt="Avatar" />
        Jane Doe
      </md-input-chip>
      <md-input-chip removable disabled>Disabled</md-input-chip>
      <md-input-chip>No remove button</md-input-chip>
    </div>
  `,
};

// ── Suggestion Chip ──────────────────────────────────────────────────────────

export const SuggestionChip: Story = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
      <md-suggestion-chip variant="outlined">Good morning!</md-suggestion-chip>
      <md-suggestion-chip variant="outlined">Set a reminder</md-suggestion-chip>
      <md-suggestion-chip variant="elevated">Elevated</md-suggestion-chip>
      <md-suggestion-chip variant="outlined">
        <span slot="leading-icon">${unsafeSVG(smartToyIcon)}</span>
        AI suggestion
      </md-suggestion-chip>
      <md-suggestion-chip variant="outlined" disabled>Disabled</md-suggestion-chip>
    </div>
  `,
};

// ── All Chips ─────────────────────────────────────────────────────────────────

export const AllChips: Story = {
  name: "All Chips",
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:1rem;">
      <div>
        <p style="font-size:0.75rem;color:#666;margin-bottom:0.5rem;">Assist</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <md-assist-chip variant="outlined">
            <span slot="leading-icon">${unsafeSVG(calendarIcon)}</span>
            Add to calendar
          </md-assist-chip>
          <md-assist-chip variant="elevated">
            <span slot="leading-icon">${unsafeSVG(directionsIcon)}</span>
            Get directions
          </md-assist-chip>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;color:#666;margin-bottom:0.5rem;">Filter</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <md-filter-chip>All</md-filter-chip>
          <md-filter-chip selected>
            <span slot="selected-icon">${unsafeSVG(checkIcon)}</span>
            Nearby
          </md-filter-chip>
          <md-filter-chip>Saved</md-filter-chip>
          <md-filter-chip>Rated 4+</md-filter-chip>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;color:#666;margin-bottom:0.5rem;">Input</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <md-input-chip removable>TypeScript</md-input-chip>
          <md-input-chip removable selected>React</md-input-chip>
          <md-input-chip removable>
            <span slot="leading-icon">${unsafeSVG(tagIcon)}</span>
            Design
          </md-input-chip>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;color:#666;margin-bottom:0.5rem;">Suggestion</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <md-suggestion-chip>Good morning!</md-suggestion-chip>
          <md-suggestion-chip>Set a timer</md-suggestion-chip>
          <md-suggestion-chip variant="elevated">
            <span slot="leading-icon">${unsafeSVG(smartToyIcon)}</span>
            AI generated
          </md-suggestion-chip>
        </div>
      </div>
    </div>
  `,
};
