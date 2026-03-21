# md-fab

A Material Design 3 Floating Action Button (FAB) web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-fab>
  <md-icon slot="icon">add</md-icon>
</md-fab>

<!-- Extended FAB with label -->
<md-fab label="Create">
  <md-icon slot="icon">add</md-icon>
</md-fab>
```

## Properties

| Property   | Attribute  | Type                                             | Default     | Description                          |
|------------|------------|--------------------------------------------------|-------------|--------------------------------------|
| `variant`  | `variant`  | `"surface" \| "primary" \| "secondary" \| "tertiary"` | `"surface"` | Color variant                   |
| `size`     | `size`     | `"s" \| "m" \| "l"`                             | `"m"`       | FAB size (small / medium / large)    |
| `label`    | `label`    | `string`                                         | `""`        | Text label (creates an extended FAB) |
| `disabled` | `disabled` | `boolean`                                        | `false`     | Disables the FAB                     |
| `loading`  | `loading`  | `boolean`                                        | `false`     | Shows a loading indicator            |
| `href`     | `href`     | `boolean`                                        | `false`     | Renders as an anchor element         |
| `type`     | `type`     | `"button" \| "submit" \| "reset"`                | `"button"`  | Native button type                   |
| `form`     | `form`     | `string`                                         | —           | Associates FAB with a form `id`      |

## CSS Custom Properties

| Variable                          | Default       | Description                              |
|-----------------------------------|---------------|------------------------------------------|
| `--md-fab-background-color`       | `transparent` | FAB background fill                      |
| `--md-button-foreground-color`    | `inherit`     | Icon / label color                       |
| `--md-fab-border-radius`          | `1rem`        | Corner radius                            |
| `--md-fab-icon-size`              | `1.5rem`      | Icon size                                |
| `--md-fab-font-size`              | `1rem`        | Label font size (extended FAB)           |
| `--md-fab-inline-start-space`     | `1rem`        | Leading (left) padding                   |
| `--md-fab-inline-end-space`       | `1rem`        | Trailing (right) padding                 |
| `--md-fab-block-start-space`      | `1rem`        | Top padding                              |
| `--md-fab-block-end-space`        | `1rem`        | Bottom padding                           |
| `--md-fab-border-size`            | `0`           | Border width                             |
| `--md-fab-pressed-state-color`    | `transparent` | State-layer color on press               |
| `--md-fab-pressed-state-opacity`  | `12%`         | Opacity of the pressed state layer       |
| `--md-fab-hovered-state-opacity`  | `9%`          | Opacity of the hover state layer         |
| `--md-elevation-level`            | *(per variant)* | Material elevation level (0–5)         |

## Examples

### Variants

```html
<md-fab variant="surface"><md-icon slot="icon">edit</md-icon></md-fab>
<md-fab variant="primary"><md-icon slot="icon">add</md-icon></md-fab>
<md-fab variant="secondary"><md-icon slot="icon">star</md-icon></md-fab>
<md-fab variant="tertiary"><md-icon slot="icon">favorite</md-icon></md-fab>
```

### Sizes

```html
<md-fab size="s"><md-icon slot="icon">add</md-icon></md-fab>
<md-fab size="m"><md-icon slot="icon">add</md-icon></md-fab>
<md-fab size="l"><md-icon slot="icon">add</md-icon></md-fab>
```

### Extended FAB (with label)

```html
<md-fab variant="primary" label="New document">
  <md-icon slot="icon">add</md-icon>
</md-fab>
```

### Custom colors

```html
<md-fab
  style="
    --md-fab-background-color: #6750a4;
    --md-button-foreground-color: #fff;
    --md-fab-border-radius: 0.5rem;
  "
>
  <md-icon slot="icon">add</md-icon>
</md-fab>
```

### Via CSS class

```css
.brand-fab {
  --md-fab-background-color: oklch(50% 0.2 270);
  --md-button-foreground-color: #fff;
  --md-fab-border-radius: 50%;
}
```

```html
<md-fab class="brand-fab">
  <md-icon slot="icon">add</md-icon>
</md-fab>
```
