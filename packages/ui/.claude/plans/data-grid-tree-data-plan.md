# Tree data — investigation and plan

Not implemented yet — for review. Implementation starts after this is approved.

Design decisions already made (via user Q&A, recorded here so they aren't
re-litigated mid-implementation):

1. **Sorting is hierarchy-preserving** — `sortModel` sorts each group's
   children among themselves, never flattens the tree. Matches MUI Tree Data.
2. **Checkbox selection cascades** — checking a group selects every
   descendant; a group shows `indeterminate` when only some descendants are
   checked. This is the actual reason `TreeController`/`createEmptyIndexTree`
   already exist (see their own doc comments — built ahead of time as
   groundwork for exactly this).
3. **Opt-in is an explicit `treeData` boolean attribute**, alongside
   `getDataPath` — matches MUI X's own API shape (`treeData: true` +
   `getTreeDataPath`) rather than this codebase's usual "callback presence
   is the opt-in" convention (`getDetailPanelContent`). `treeData` reflects
   as an attribute (`tree-data`, same pattern as `checkboxSelection`/
   `rowSpanning`) so it's settable declaratively; `getDataPath` stays a
   state-only function property (functions can't be attributes) and is
   required once `treeData` is true — `treeData` on with no `getDataPath`
   set is a no-op (falls back to flat rendering, same as `getDataPath`
   unset), not an error.
4. **Pagination paginates the flattened, collapse-aware visible-row list** —
   `pageSize` counts currently-visible rows; a page's row count changes as
   groups expand/collapse. No `PaginationController` changes needed — it
   already just slices whatever array it's given.

## 1. Proposed usage

```js
const grid = document.querySelector("md-data-grid");

grid.columns = [
  { field: "name", headerName: "Name" },
  { field: "headcount", headerName: "Headcount" },
];

// Every row carries its own position in the hierarchy — root to self,
// inclusive. The field is whatever you want; getDataPath is how the grid
// reads it (mirrors getRowId's "convention, not a hardcoded field" shape).
grid.rows = [
  { id: 1, name: "Engineering", path: ["Engineering"] },
  { id: 2, name: "Frontend", path: ["Engineering", "Frontend"] },
  { id: 3, name: "Ada", path: ["Engineering", "Frontend", "Ada"] },
  { id: 4, name: "Backend", path: ["Engineering", "Backend"] },
  { id: 5, name: "Sales", path: ["Sales"] },
];
grid.treeData = true; // explicit opt-in — getDataPath alone isn't enough
grid.getDataPath = (row) => row.path;

// Optional — customizes the internal grouping/toggle column. Same shape as
// an ordinary DataGridColumn; anything unset falls back to a sensible
// default (see §2).
grid.autoGroupColumnDef = {
  headerName: "Org unit",
  valueGetter: ({ row }) => row.name, // what shows next to the toggle/indent
};

grid.checkboxSelection = true; // cascades: checking a group selects its subtree

grid.treeDataExpandedGroupIds = new Set(["Engineering"]); // pre-expanded groups
grid.addEventListener(
  "md-data-grid-tree-data-expanded-group-ids-change",
  (e) => {
    console.log([...e.detail]);
  },
);
```

```html
<md-data-grid
  id="grid"
  tree-data
  checkbox-selection
  style="height: 480px; display: block;"
></md-data-grid>
```

Rows with no real row at an intermediate path segment (e.g. only leaf rows
`['Fruit', 'Apple']` / `['Fruit', 'Orange']` exist, nothing at `['Fruit']`
itself) auto-generate a synthetic group row for that segment — this is the
_common_ case (folder/category grouping), not an edge case, so it has to be
first-class, not bolted on.

## 2. Proposed implementation sketch

### `GRID_TREE_DATA_GROUPING_FIELD` / column def

New file `data-grid-tree-data-column.js`, same pattern as
`data-grid-checkbox-column.js` / `data-grid-detail-panel-column.js`:

```js
export const GRID_TREE_DATA_GROUPING_FIELD = "__tree_data_group__";

export const GRID_TREE_DATA_GROUPING_COL_DEF = {
  field: GRID_TREE_DATA_GROUPING_FIELD,
  headerName: "Group",
  minWidth: 160,
  resizable: true,
  sortable: false, // the column header doesn't get its own click-to-sort — sortModel targets a real field instead
  rowSpannable: false,
  renderCell: ({ row }) =>
    html`<md-data-tree-toggle-cell .row=${row}></md-data-tree-toggle-cell>`,
};
```

`md-data-grid`'s public `autoGroupColumnDef` property is shallow-merged onto
this default (`{ ...GRID_TREE_DATA_GROUPING_COL_DEF, ...host.autoGroupColumnDef }`)
the same way `_columns` already composes checkbox/detail-toggle — no special
case inside the grid's own rendering, just another `DataGridColumn`.

`_columns` ordering: checkbox, tree-toggle, detail-toggle, user columns —
checkbox stays first (existing precedent), tree-toggle next since it's
structural to row identity, detail-toggle and user columns unchanged.

### `md-data-tree-toggle-cell`

New component, `components/tree-toggle-cell/`, closely mirrors
`md-data-detail-toggle-cell` (icon-button, `keyboard_arrow_right`, rotates
when expanded, `aria-expanded`) but additionally:

- Renders nothing (no toggle icon, just indentation + label) for a leaf node
  with no children — matches MUI, a row with nothing to expand gets no
  affordance, same principle `md-data-detail-toggle-cell` already follows.
- Applies `padding-inline-start: {depth * INDENT}px` (a CSS custom property,
  themeable) — depth comes precomputed off the tree node (see §3c), not
  recomputed by walking `.parent` per render.
- Renders the group's label via `column.valueGetter?.(...) ?? ` last path
  segment as the default (`getDataPath(row).at(-1)`).

### `TreeController` changes

This is where nearly all the real complexity lives. See §3 below for the
specific things that need resolving before writing code — this section is
just the shape of the change.

- `build()` gains a real grouping path when `host.treeData` is true (and
  `host.getDataPath` is set — `treeData` on with no `getDataPath` is a no-op,
  see decision #3): walk each row's `getDataPath(row)` array, creating/
  reusing one child node per path segment (a trie, `Map<segment, node>` at
  each level — reuses `IndexTree.children` exactly as it exists today, no
  new data structure). At the final segment, `Object.assign(node, row)` as
  today. A node created along the way but never matched by a real row's
  exact path stays a synthetic group node (`node.__isGroup = true` or
  similar, flag needed either way for rendering/selection to tell "real row"
  from "auto-group"). When `treeData` is off, `build()` keeps exactly its
  current behavior (flat, one level, keyed by `getRowId`) — fully backward
  compatible, no regression risk for non-tree grids.
- `node.depth` computed once at build time (root's children are depth 0),
  not derived per-render.
- New `visibleRows(expandedGroupIds)` (or similar) — collapse-aware pre-order
  walk: skip recursing into a group node's children when its key isn't in
  `expandedGroupIds`. Distinct from the existing `.rows` getter (full flat
  list, ignores collapse state) — `.rows` is still what "select all" should
  use, spanning the whole dataset regardless of what's currently expanded,
  matching how `toggleAll()`/checkbox-header already use `host.rows` (not
  `effectiveRows`) for that same reason today.
- New `sortedVisibleRows(compareFn, expandedGroupIds)` — same collapse-aware
  walk, but sorts each node's children (via `compareFn`) before recursing
  into them, so sorting is hierarchy-preserving per decision #1. Needs
  `SortController`'s per-pair comparator extracted as a standalone,
  reusable function (currently inlined in `sortedRows()`'s own `.sort()`
  callback) so both the flat path (non-tree grids) and this tree path share
  one comparison implementation.

### `data-grid.js` changes

- New properties: `treeData` (`type: Boolean, attribute: "tree-data", reflect:
true`, default `false` — the actual opt-in, decision #3), `getDataPath`
  (state, function-valued, undefined by default — required alongside
  `treeData` for the feature to do anything), `autoGroupColumnDef` (state,
  plain object, undefined by default), `treeDataExpandedGroupIds` (`Set`,
  defaults empty, same `_apply()`-then-dispatch shape
  `detailPanelExpandedRowIds` already uses).
- New method: `toggleTreeDataGroup(id)` / `setExpandedTreeDataGroups(ids)`
  mirroring `toggleDetailPanel`/`setExpandedDetailPanel`.
- `_sortedRows` gains a branch:
  ```js
  get _sortedRows() {
    if (this.treeData && this.getDataPath) {
      return this._tree.sortedVisibleRows(
        this._sort.compareRows,
        this.treeDataExpandedGroupIds,
      );
    }
    return this._sort.sortedRows(this.rows);
  }
  ```
  Everything downstream of this getter (`_effectiveRows`, virtualization,
  keyboard nav, row-span, selection, row click) is **already** written to
  consume "whatever flat array `_sortedRows` produces" without caring where
  it came from — this is the single biggest reason treeData is tractable
  here: it's one new upstream production step, not N downstream special
  cases. Master-detail needed a parallel `renderItems` overlay specifically
  _because_ detail rows aren't real, selectable, navigable rows; tree rows
  (including synthetic group rows) very much are, so they belong in the same
  pipeline stage sort/pagination/virtualization already share, not a
  side-channel.
- Checkbox cascade wiring: `RowSelectionController.select()`/`toggleAll()`
  need a treeData-aware branch that, on toggling a group node, also
  adds/removes every descendant (`[...node]` pre-order iterator, skipping
  the node itself if it's a synthetic group with no real row) — see §3d for
  the identity question this depends on. `checkbox-header`'s indeterminate
  computation gets a per-group counterpart inside `md-data-tree-toggle-cell`
  (or a shared helper both read).

## 3. What needs resolving before implementation

**a) Auto-generated group node identity vs. `getRowId`.**
Leaf nodes (a real row occupies that exact path) should keep using
`getRowId(row)` as their `.key` — every other subsystem (`rowSelectionModel`,
`detailPanelExpandedRowIds`, `updateRows()` matching, `repeat()` keying)
already assumes `.key`/selection-Set membership _is_ `getRowId(row)`, and
that shouldn't change for real rows. Synthetic group nodes have no real row
to call `getRowId` on at all, so they need their own synthetic id — derived
from the path (e.g. the segment array itself, joined with a separator
reserved the same way `DATA_GRID_ROOT_GROUP_ID` is reserved). The trie
structure used internally during `build()` (keyed by raw path _segment_ per
level) is a separate concern from this public `.key` — segments are only
scaffolding to find/reuse parents while walking; a level's `.key` gets set to
`getRowId(row)` the moment a real row matches that exact path, and to the
synthetic path-derived id otherwise. Needs its own unit tests before
anything else is built on top, since selection/expand-state/cascade all
depend on getting this right.

**b) Two-pass build vs. streaming.**
A row's parent might not have been processed yet depending on `rows` array
order (nothing guarantees parents appear before children). Simplest correct
approach: don't rely on array order at all — walk each row's _own_ path
segment-by-segment from the root every time (creating intermediate nodes
lazily via `children.get(segment) ?? create-and-set`), so a later row sharing
an earlier row's prefix reuses the same node regardless of array order. O(rows
× average depth) total, no second pass needed. Matches how the existing flat
`build()` already does one pass per row.

**c) `depth` and indentation unit.**
Depth is trivial to compute during the same walk (root's direct children are
depth 0) and should be stored on the node, not recomputed per render — a
visible list of a few hundred rows re-walking `.parent` chains every render
for indentation is needless work `TreeController` can avoid for free at build
time. Indent-per-level should be a CSS custom property (e.g.
`--md-data-grid-tree-indent: 20px`, themeable/overridable) rather than a
hardcoded magic number in the component.

**d) Checkbox cascade + "select all" interaction.**
`toggleAll()` currently uses `host.rows` (the whole dataset) directly. With
treeData, "all rows" for cascade purposes should mean "every node in the
tree, synthetic groups included" — i.e. `this._tree.tree` (root), not
`host.rows`, whenever `getDataPath` is set. Needs an explicit branch, not a
silent behavior change for non-tree grids.

**e) `autoGroupColumnDef.valueGetter` default.**
Without an override, what shows in the grouping column? Recommended default:
last path segment (`getDataPath(row).at(-1)`) — works for both real and
synthetic group rows without needing any other column's data. `headerName`
defaults to a plain `"Group"` unless overridden, same "sensible default,
override available" shape every other column field already follows.

**f) Row-span interaction.**
`RowSpanController` only ever sees whatever flat array it's handed — no
code change needed, but a span run can now cross a collapse/expand boundary
or run across sibling groups in a way that looks visually odd. Same
"documented tradeoff, not solved" precedent as master-detail's own row-span
caveat — a README note, not a code fix, for v1.

**g) Column sortability inside a tree grid.**
`GRID_TREE_DATA_GROUPING_COL_DEF.sortable: false` (the toggle/label column
itself isn't a sort target) but ordinary data columns on tree rows should
still be clickable-sortable, driving the hierarchy-preserving sort in §2.
Need to confirm this is the intended UX (sort by "Headcount" reorders each
group's children by headcount, groups themselves stay in original/insertion
order unless a column's sort also reorders siblings-of-root the same way) —
recommend yes, siblings at every level (including top-level groups under
root) are sorted by the same active `sortModel`, for consistency rather than
a special-cased root level.

## 4. Implementation plan

1. **`TreeController` rewrite** — real path-based `build()` (§3a/b), `depth`
   tracking (§3c), `visibleRows()`/`sortedVisibleRows()`. Unit-tested
   standalone first (plain objects/arrays, no DOM) — mirrors how
   `data-grid-tree-controller.spec.js` already tests the flat version;
   extend that same file rather than starting a new one.
2. **`SortController.compareRows` extraction** — pure refactor, no behavior
   change, verified against the existing sort test suite before anything
   tree-specific depends on it.
3. **`GRID_TREE_DATA_GROUPING_COL_DEF` + `md-data-tree-toggle-cell`** — same
   shape as the checkbox/detail-toggle column+cell pair, new context fields
   (`treeDataExpandedGroupIds`, `toggleTreeDataGroup`, group/depth info read
   off the row's tree node).
4. **`data-grid.js` wiring** — new properties/methods, `_columns` ordering,
   `_sortedRows` branch, cascade-aware `RowSelectionController` calls.
5. **`RowSelectionController` cascade** — toggling a group id
   adds/removes its full subtree; indeterminate computation for
   `md-data-tree-toggle-cell`'s own checkbox (if checkbox column + treeData
   are both on) and for the header "select all" checkbox against the
   root-level cascade semantics from §3d.
6. **Tests**, roughly in this order: `TreeController` path-building /
   collapse / sort unit tests → toggle-cell rendering/click/indentation →
   full-grid integration (expand via click, sort-within-group, checkbox
   cascade + indeterminate, `getVisibleRows()`/pagination counting only
   visible rows, keyboard nav skipping nothing it shouldn't since tree rows
   are real rows unlike detail rows).
7. **README** — new "Tree data" section (usage example, `autoGroupColumnDef`
   table, cascade behavior, row-span caveat from §3f), CSS custom property
   for indent width, events table addition
   (`md-data-grid-tree-data-expanded-group-ids-change`).

## Open questions before implementing

- Exact synthetic-id scheme for auto-generated group nodes (§3a) — needs a
  concrete proposal + tests before the rest of the feature can build on it
  safely; flagged as the highest-risk single piece of this plan.
- Should a synthetic group row itself be selectable/checkable (its checkbox
  drives cascade to descendants), or only real rows get a checkbox and a
  group's box is purely a derived indeterminate/checked _display_ with no
  click target of its own? MUI allows clicking a group's checkbox. Recommend
  following that (consistent with decision #2's cascade already implying
  groups participate in selection, not just observe it).
- `defaultGroupingExpansionDepth`/expand-all-by-default convenience — worth
  having in v1, or ship collapsed-by-default only (matches
  `detailPanelExpandedRowIds`'s own default-empty convention) and add later?
  Recommend the latter for v1, same reasoning `getDetailPanelHeight` got
  deferred in the master-detail plan.
