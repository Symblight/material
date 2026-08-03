/**
 * Assembles the `dataGridContext` value from the host and its controllers.
 * A plain function rather than a controller — it only reads current state
 * and returns a snapshot, no lifecycle hooks needed.
 * @param {import("./data-grid.js").MdDataGrid} host
 * @returns {import("./data-grid-context.js").DataGridContextValue}
 */
export function buildDataGridContext(host) {
  const { firstRowIndex, lastRowIndex } = host._pagination.pageRange();

  return {
    rowHeight: host.rowHeight,
    getRowId: host.getRowId,
    focusedCell: host._keyboardNav.focusedCell,
    setFocusedCell: (rowIndex, colIndex) =>
      host._keyboardNav.setFocusedCell(rowIndex, colIndex),
    hasFocusedCell: host._keyboardNav.hasFocusedCell,
    disableCellHighlight: host.disableCellHighlight,
    page: host.paginationModel?.page ?? 0,
    pageSize: host.paginationModel?.pageSize ?? host._pagination.rowCount,
    pageCount: host._pagination.pageCount,
    rowCount: host._pagination.rowCount,
    firstRowIndex,
    lastRowIndex,
    pageSizeOptions: host.pageSizeOptions,
    setPage: (page) => host._pagination.setPage(page),
    setPageSize: (pageSize) => host._pagination.setPageSize(pageSize),
    startColumnResize: (resizeColIndex, clientX) =>
      host._columnResize.startColumnResize(resizeColIndex, clientX),
    resizeColumn: (clientX) => host._columnResize.resizeColumn(clientX),
    endColumnResize: (clientX) => host._columnResize.endColumnResize(clientX),
  };
}
