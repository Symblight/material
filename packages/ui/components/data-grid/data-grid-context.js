import { createContext } from "@lit/context";

/**
 * @typedef {object} DataGridContextValue
 * @property {number} rowHeight
 * @property {(row: Record<string, unknown>) => string | number} getRowId
 * @property {{ rowIndex: number, colIndex: number }} focusedCell
 * @property {(rowIndex: number, colIndex: number) => void} setFocusedCell
 * @property {boolean} hasFocusedCell       // false until the user has actually clicked/navigated into a cell — focusedCell's (0,0) default doesn't count
 * @property {boolean} disableCellHighlight // when true, md-data-cell skips the focused-cell border highlight
 * @property {number} page                 // current page index, 0 when pagination disabled
 * @property {number} pageSize
 * @property {number} pageCount
 * @property {number} rowCount
 * @property {number} firstRowIndex        // 0-based index of first row on the current page
 * @property {number} lastRowIndex         // 0-based index of last row on the current page
 * @property {number[]} pageSizeOptions    // choices shown in the "Rows per page" selector
 * @property {(page: number) => void} setPage
 * @property {(pageSize: number) => void} setPageSize
 * @property {(resizeColIndex: number, clientX: number) => void} startColumnResize
 * @property {(clientX: number) => void} resizeColumn
 * @property {(clientX: number) => void} endColumnResize
 */

/** @type {import("@lit/context").Context<symbol, DataGridContextValue>} */
export const dataGridContext = createContext(Symbol("data-grid"));
