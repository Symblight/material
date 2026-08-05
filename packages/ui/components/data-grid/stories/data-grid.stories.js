import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import moreVert from "@material-design-icons/svg/outlined/more_vert.svg?raw";
import renameIcon from "@material-design-icons/svg/outlined/drive_file_rename_outline.svg?raw";
import deleteIcon from "@material-design-icons/svg/outlined/delete.svg?raw";

import "../index.js";
import "../../card/card.js";
import "../../chips/assist-chip.js";
import "../../button/button.js";
import "../../icon-button/icon-button.js";
import "../../icon/icon.js";
import "../../list/list.js";
import "../../dialog/dialog.js";
import "../../text-field/text-field.js";

/** @import { DataGridColumn } from "../data-grid.js" */
/** @import { MdDataGrid } from "../data-grid.js" */

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "Support"];

/** @param {number} count */
function makeRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    email: `item${i}@example.com`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    status: i % 3 === 0 ? "active" : "inactive",
  }));
}

/** @type {DataGridColumn[]} */
const BASIC_COLUMNS = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email" },
  { field: "department", headerName: "Department", width: 140 },
  { field: "status", headerName: "Status", width: 120 },
];

/** @type {import("@storybook/web-components").Meta} */
const meta = {
  title: "Data Grid",
  component: "md-data-grid",
  tags: ["autodocs"],
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj} Story */

// ─── Basic — columns/rows set imperatively, virtualized ─────────────────────

/** @type {Story} */
export const Basic = {
  render: () => html`
    <md-data-grid
      style="height: 320px; width: 720px; display: block;"
      ${ref((el) => {
        const grid = /** @type {MdDataGrid | undefined} */ (
          /** @type {unknown} */ (el)
        );
        if (!grid) return;
        grid.columns = BASIC_COLUMNS;
        grid.rows = makeRows(5000);
      })}
    ></md-data-grid>
  `,
};

// ─── Basic — no rows (empty state) ───────────────────────────────────────────

/** @type {Story} */
export const BasicEmpty = {
  render: () => html`
    <md-data-grid
      style="height: 320px; width: 720px; display: block;"
      ${ref((el) => {
        const grid = /** @type {MdDataGrid | undefined} */ (
          /** @type {unknown} */ (el)
        );
        if (!grid) return;
        grid.columns = BASIC_COLUMNS;
        grid.rows = [];
      })}
    ></md-data-grid>
  `,
};

// ─── Row spanning — consecutive equal values in a column merge vertically ──

/** @type {DataGridColumn[]} */
const ROW_SPAN_COLUMNS = [
  { field: "department", headerName: "Department", width: 160 },
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email" },
];

/** Grouped by department so equal adjacent values actually merge — row
 * spanning only sees adjacency, not the whole dataset. */
const ROW_SPAN_ROWS = DEPARTMENTS.flatMap((department, deptIndex) =>
  Array.from({ length: 3 }, (_, i) => {
    const id = deptIndex * 3 + i;
    return {
      id,
      department,
      name: `Item ${id}`,
      email: `item${id}@example.com`,
    };
  }),
);

/** @type {Story} */
export const RowSpanning = {
  render: () => html`
    <md-data-grid
      row-spanning
      style="height: 320px; width: 640px; display: block;"
      ${ref((el) => {
        const grid = /** @type {MdDataGrid | undefined} */ (
          /** @type {unknown} */ (el)
        );
        if (!grid) return;
        grid.columns = ROW_SPAN_COLUMNS;
        grid.rows = ROW_SPAN_ROWS;
      })}
    ></md-data-grid>
  `,
};

// ─── Row selection — highlight-based, not checkboxes. Click to select,
// Ctrl/Cmd-click to toggle additively, Shift-click for a range ─────────────

/** @type {Story} */
export const RowSelection = {
  render: () => {
    /** @type {HTMLElement | undefined} */
    let log;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <md-data-grid
          style="height: 320px; width: 720px; display: block;"
          @md-data-grid-row-selection-model-change=${(
            /** @type {CustomEvent} */ e,
          ) => {
            if (!log) return;
            const ids = [...e.detail];
            log.textContent =
              ids.length === 0 ? "No rows selected." : `Selected: ${ids}`;
          }}
          ${ref((el) => {
            const grid = /** @type {MdDataGrid | undefined} */ (
              /** @type {unknown} */ (el)
            );
            if (!grid) return;
            grid.columns = BASIC_COLUMNS;
            grid.rows = makeRows(20);
          })}
        ></md-data-grid>
        <span
          ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        >
          Click a row to select it. Hold Ctrl/Cmd to add/remove one row at a
          time, or Shift to select a range.
        </span>
      </div>
    `;
  },
};

// ─── Checkbox selection — same rowSelectionModel as RowSelection above,
// driven by an md-checkbox column (GRID_CHECKBOX_SELECTION_COL_DEF) instead
// of a plain row highlight ────────────────────────────────────────────────

/** @type {Story} */
export const CheckboxSelection = {
  render: () => {
    /** @type {HTMLElement | undefined} */
    let log;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <md-data-grid
          checkbox-selection
          style="height: 320px; width: 720px; display: block;"
          @md-data-grid-row-selection-model-change=${(
            /** @type {CustomEvent} */ e,
          ) => {
            if (!log) return;
            const ids = [...e.detail];
            log.textContent =
              ids.length === 0 ? "No rows selected." : `Selected: ${ids}`;
          }}
          ${ref((el) => {
            const grid = /** @type {MdDataGrid | undefined} */ (
              /** @type {unknown} */ (el)
            );
            if (!grid) return;
            grid.columns = BASIC_COLUMNS;
            grid.rows = makeRows(20);
          })}
        ></md-data-grid>
        <span
          ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        >
          Check a row's box to select it — checking another adds to the
          selection. The header checkbox selects/clears all 20 rows.
        </span>
      </div>
    `;
  },
};

// ─── Loading — md-progress-linear between the header and body, toggled via
// a ref (the grid never fetches anything itself) ────────────────────────────

/** @type {Story} */
export const LoadingWithRows = {
  render: () => {
    /** @type {MdDataGrid | undefined} */
    let grid;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <md-data-grid
          style="height: 320px; width: 720px; display: block;"
          ${ref((el) => {
            grid = /** @type {MdDataGrid | undefined} */ (
              /** @type {unknown} */ (el)
            );
            if (!grid) return;
            grid.columns = BASIC_COLUMNS;
            grid.rows = makeRows(20);
          })}
        ></md-data-grid>
        <div style="display: flex; gap: 0.5rem;">
          <md-button
            @click=${() => {
              if (!grid) return;
              grid.loading = true;
              setTimeout(() => {
                if (grid) grid.loading = false;
              }, 2000);
            }}
          >
            Simulate 2s reload (progress bar + overlay over existing rows)
          </md-button>
        </div>
      </div>
    `;
  },
};

// ─── Loading — rows still empty (first load), skeleton rows instead ────────

/** @type {Story} */
export const LoadingSkeleton = {
  render: () => {
    /** @type {MdDataGrid | undefined} */
    let grid;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <md-data-grid
          loading
          style="height: 320px; width: 720px; display: block;"
          ${ref((el) => {
            grid = /** @type {MdDataGrid | undefined} */ (
              /** @type {unknown} */ (el)
            );
            if (!grid) return;
            grid.columns = BASIC_COLUMNS;
            grid.rows = [];
          })}
        ></md-data-grid>
        <div style="display: flex; gap: 0.5rem;">
          <md-button
            @click=${() => {
              if (!grid) return;
              grid.rows = makeRows(20);
              grid.loading = false;
            }}
          >
            Finish loading (reveals real rows)
          </md-button>
        </div>
      </div>
    `;
  },
};

// ─── Column resize — drag handles on the header, live width readout ────────

/** @type {DataGridColumn[]} */
const RESIZE_COLUMNS = [
  { field: "id", headerName: "ID", width: 80, resizable: false },
  { field: "name", headerName: "Name", minWidth: 120, maxWidth: 400 },
  { field: "email", headerName: "Email" },
  { field: "department", headerName: "Department", width: 140 },
  { field: "status", headerName: "Status", width: 120 },
];

/** @type {Story} */
export const ColumnResize = {
  render: () => {
    /** @type {HTMLElement | undefined} */
    let log;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <md-data-grid
          style="height: 320px; width: 720px; display: block;"
          @md-data-grid-column-resize=${(/** @type {CustomEvent} */ e) => {
            if (!log) return;
            const { field, width, phase } = e.detail;
            log.textContent = `${field}: ${Math.round(width)}px (${phase})`;
          }}
          ${ref((el) => {
            const grid = /** @type {MdDataGrid | undefined} */ (
              /** @type {unknown} */ (el)
            );
            if (!grid) return;
            grid.columns = RESIZE_COLUMNS;
            grid.rows = makeRows(20);
          })}
        ></md-data-grid>
        <span
          ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
          style="font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
        >
          Drag a column's right edge to resize (ID is not resizable).
        </span>
      </div>
    `;
  },
};

// ─── Pagination — client mode ────────────────────────────────────────────────

/** @type {Story} */
export const PaginationClient = {
  render: () => html`
    <md-data-grid
      style="height: 320px; width: 720px; display: block;"
      ${ref((el) => {
        const grid = /** @type {MdDataGrid | undefined} */ (
          /** @type {unknown} */ (el)
        );
        if (!grid) return;
        grid.columns = BASIC_COLUMNS;
        grid.rows = makeRows(42);
        grid.paginationModel = { page: 0, pageSize: 8 };
      })}
    ></md-data-grid>
  `,
};

// ─── Pagination — server mode ────────────────────────────────────────────────

/** @param {number} page @param {number} pageSize */
function fetchServerPage(page, pageSize) {
  // Simulates a server that only ever returns one page's worth of rows.
  const all = makeRows(42);
  return {
    rows: all.slice(page * pageSize, (page + 1) * pageSize),
    totalCount: all.length,
  };
}

/** @type {Story} */
export const PaginationServer = {
  render: () => html`
    <md-data-grid
      pagination-mode="server"
      style="height: 320px; width: 720px; display: block;"
      @md-data-grid-pagination-model-change=${(
        /** @type {CustomEvent} */ e,
      ) => {
        const grid = /** @type {MdDataGrid} */ (
          /** @type {unknown} */ (e.target)
        );
        const { page, pageSize } = e.detail;
        const { rows, totalCount } = fetchServerPage(page, pageSize);
        grid.rows = rows;
        grid.rowCount = totalCount;
      }}
      ${ref((el) => {
        const grid = /** @type {MdDataGrid | undefined} */ (
          /** @type {unknown} */ (el)
        );
        if (!grid) return;
        grid.columns = BASIC_COLUMNS;
        grid.paginationMode = "server";
        grid.paginationModel = { page: 0, pageSize: 8 };
        const { rows, totalCount } = fetchServerPage(0, 8);
        grid.rows = rows;
        grid.rowCount = totalCount;
      })}
    ></md-data-grid>
  `,
};

// ─── Pagination — hidden footer, driven by external buttons ────────────────

/** @type {Story} */
export const HidePagination = {
  render: () => {
    /** @type {MdDataGrid | undefined} */
    let grid;
    return html`
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <md-data-grid
          hide-pagination
          style="height: 320px; width: 720px; display: block;"
          ${ref((el) => {
            grid = /** @type {MdDataGrid | undefined} */ (
              /** @type {unknown} */ (el)
            );
            if (!grid) return;
            grid.columns = BASIC_COLUMNS;
            grid.rows = makeRows(42);
            grid.paginationModel = { page: 0, pageSize: 8 };
          })}
        ></md-data-grid>
        <div style="display: flex; gap: 0.5rem;">
          <md-button
            @click=${() => grid?.setPage((grid.paginationModel?.page ?? 0) - 1)}
          >
            Previous
          </md-button>
          <md-button
            @click=${() => grid?.setPage((grid.paginationModel?.page ?? 0) + 1)}
          >
            Next
          </md-button>
        </div>
      </div>
    `;
  },
};

// ─── Transactions card — reference screenshot recreation ────────────────────

const CATEGORY_COLORS = {
  Food: { bg: "#e3f2e5", fg: "#2e7d43" },
  Rent: { bg: "#e6edfb", fg: "#2f5fc4" },
  Subscriptions: { bg: "#fbe6ef", fg: "#c23a72" },
};

const TRANSACTIONS = [
  {
    id: 1,
    date: "05.07",
    description: "RIMI Vilnius",
    method: "Card •1234",
    amount: 38.37,
    category: "Food",
  },
  {
    id: 2,
    date: "05.07",
    description: "Nuoma / Rent transfer",
    method: "Bank transfer",
    amount: 860.2,
    category: "Rent",
  },
  {
    id: 3,
    date: "07.07",
    description: "TELIA LIETUVA",
    method: "Card •1234",
    amount: 57.9,
    category: "Subscriptions",
  },
  {
    id: 4,
    date: "08.07",
    description: "NETFLIX.COM",
    method: "Card •5678",
    amount: 12.99,
    category: "Subscriptions",
  },
  {
    id: 5,
    date: "09.07",
    description: "Paysera LT · перевод",
    method: "Paysera",
    amount: 61.06,
    category: null,
    pending: true,
  },
  {
    id: 6,
    date: "12.07",
    description: "Barbora / Maxima",
    method: "Card •1234",
    amount: 52.1,
    category: "Food",
  },
];

/** @type {DataGridColumn[]} */
const TRANSACTION_COLUMNS = [
  { field: "date", headerName: "Дата", width: 72 },
  { field: "description", headerName: "Описание" },
  { field: "method", headerName: "Способ оплаты", width: 130 },
  {
    field: "amount",
    headerName: "Сумма",
    width: 110,
    align: "right",
    valueGetter: ({ row }) => `−${row.amount.toFixed(2)} €`,
  },
  {
    field: "category",
    headerName: "Категория",
    width: 140,
    align: "right",
    renderCell: ({ row }) => {
      if (!row.category) {
        return html`<md-assist-chip
          style="--md-chip-border-width: 0.063rem; --md-chip-container-color: transparent;"
        >
          Выбрать
        </md-assist-chip>`;
      }
      const { bg, fg } = CATEGORY_COLORS[row.category];
      return html`<md-assist-chip
        style="--md-chip-container-color: ${bg}; --md-chip-label-color: ${fg}; --md-chip-border-width: 0;"
      >
        ${row.category}
      </md-assist-chip>`;
    },
  },
];

/** @type {Story} */
export const TransactionsCard = {
  render: () => html`
    <md-card style="width: 620px;">
      <md-data-grid
        class="transactions-grid"
        style="height: 300px; width: 100%; display: block;"
        ${ref((el) => {
          const grid = /** @type {MdDataGrid | undefined} */ (
            /** @type {unknown} */ (el)
          );
          if (!grid) return;
          grid.columns = TRANSACTION_COLUMNS;
          grid.rows = TRANSACTIONS;
          grid.getRowClassName = (row) => (row.pending ? "row--pending" : "");
        })}
      ></md-data-grid>
    </md-card>
    <style>
      /* getRowClassName's output is mirrored onto each row's part attribute
         (in addition to its shadow-internal class), so it's targetable from
         outside via ::part() — this is how a consumer highlights a row. */
      .transactions-grid::part(row--pending) {
        background-color: color-mix(
          in oklch,
          var(--md-sys-color-tertiary-container),
          transparent 40%
        );
      }
    </style>
  `,
};

// ─── Row actions — 3-dot menu with Rename (md-dialog) and Delete ────────────
//
// The menu is a native `[popover]` element (not a library component): it
// renders in the browser's top layer, which is what lets it escape the
// virtualized grid's `overflow: auto` viewport instead of being clipped by
// it. Position is computed from the trigger button's rect on click.

/** @param {number} count */
function makeActionRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    email: `item${i}@example.com`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    status: i % 3 === 0 ? "active" : "inactive",
  }));
}

/** @type {Story} */
export const RowActions = {
  render: () => {
    /** @type {MdDataGrid | undefined} */
    let grid;
    /** @type {any} */
    let dialog;
    /** @type {any} */
    let nameField;
    /** @type {Record<string, unknown> | undefined} */
    let renameTarget;

    /** @param {MouseEvent} event */
    function toggleMenu(event) {
      const button = /** @type {HTMLElement} */ (event.currentTarget);
      const menu = /** @type {any} */ (button.nextElementSibling);
      const rect = button.getBoundingClientRect();
      menu.style.top = `${rect.bottom + 4}px`;
      menu.style.left = `${rect.right - 176}px`;
      menu.togglePopover();
    }

    /** @param {Event} event */
    function closeMenu(event) {
      /** @type {any} */ (
        /** @type {HTMLElement} */ (event.currentTarget).closest("[popover]")
      )?.hidePopover();
    }

    /** @param {Record<string, unknown>} row */
    function openRename(row) {
      renameTarget = row;
      if (nameField) nameField.value = /** @type {string} */ (row.name);
      dialog?.show();
    }

    function submitRename() {
      if (!renameTarget || !nameField) return;
      grid?.updateRows([{ id: renameTarget.id, name: nameField.value }]);
      dialog?.close();
    }

    /** @param {Record<string, unknown>} row */
    function deleteRow(row) {
      grid?.updateRows([{ id: row.id, _action: "delete" }]);
    }

    /** @type {DataGridColumn[]} */
    const columns = [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Name" },
      { field: "email", headerName: "Email" },
      { field: "department", headerName: "Department", width: 140 },
      { field: "status", headerName: "Status", width: 120 },
      {
        field: "actions",
        headerName: "",
        width: 64,
        align: "center",
        renderCell: ({ row }) => html`
          <md-icon-button
            tabindex="0"
            aria-label="Row actions"
            @click=${toggleMenu}
          >
            <md-icon>${unsafeSVG(moreVert)}</md-icon>
          </md-icon-button>
          <div popover class="row-actions-menu">
            <md-list>
              <md-list-item
                button
                @click=${(/** @type {Event} */ e) => {
                  closeMenu(e);
                  openRename(row);
                }}
              >
                <md-icon slot="leading">${unsafeSVG(renameIcon)}</md-icon>
                Rename
              </md-list-item>
              <md-list-item
                button
                @click=${(/** @type {Event} */ e) => {
                  closeMenu(e);
                  deleteRow(row);
                }}
              >
                <md-icon slot="leading">${unsafeSVG(deleteIcon)}</md-icon>
                Delete
              </md-list-item>
            </md-list>
          </div>
        `,
      },
    ];

    return html`
      <md-data-grid
        style="height: 320px; width: 780px; display: block;"
        ${ref((el) => {
          grid = /** @type {MdDataGrid | undefined} */ (
            /** @type {unknown} */ (el)
          );
          if (!grid) return;
          grid.columns = columns;
          grid.rows = makeActionRows(8);
        })}
      ></md-data-grid>

      <md-dialog ${ref((el) => (dialog = el))}>
        <div slot="headline"><h3 style="margin: 0;">Rename item</h3></div>
        <md-text-field
          label="Name"
          autofocus
          ${ref((el) => (nameField = el))}
        ></md-text-field>
        <div
          slot="footer"
          style="display: flex; justify-content: flex-end; gap: 0.5rem;"
        >
          <md-button variant="text" @click=${() => dialog?.close()}
            >Cancel</md-button
          >
          <md-button variant="tonal" @click=${submitRename}>Save</md-button>
        </div>
      </md-dialog>

      <style>
        .row-actions-menu {
          margin: 0;
          padding: 0.25rem;
          border: none;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          width: 176px;
        }
      </style>
    `;
  },
};
