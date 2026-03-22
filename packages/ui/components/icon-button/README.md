# md-icon-button

A Material Design 3 icon button web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-icon-button>
  <md-icon>favorite</md-icon>
</md-icon-button>

<!-- Toggle icon button -->
<md-icon-button toggle>
  <md-icon>favorite_border</md-icon>
  <md-icon slot="selected">favorite</md-icon>
</md-icon-button>
```

## Properties

| Property   | Attribute  | Type                                              | Default      | Description                                |
| ---------- | ---------- | ------------------------------------------------- | ------------ | ------------------------------------------ |
| `variant`  | `variant`  | `"standard" \| "filled" \| "outlined" \| "tonal"` | `"standard"` | Visual style variant                       |
| `toggle`   | `toggle`   | `boolean`                                         | `false`      | Enables toggled (selected/unselected) mode |
| `selected` | `selected` | `boolean`                                         | `false`      | Selected state (used with `toggle`)        |
| `disabled` | `disabled` | `boolean`                                         | `false`      | Disables the button                        |
| `loading`  | `loading`  | `boolean`                                         | `false`      | Shows a loading indicator                  |
| `href`     | `href`     | `boolean`                                         | `false`      | Renders as an anchor element               |
| `type`     | `type`     | `"button" \| "submit" \| "reset"`                 | `"button"`   | Native button type                         |
| `form`     | `form`     | `string`                                          | —            | Associates button with a form `id`         |

## CSS Custom Properties

| Variable                               | Default       | Description                |
| -------------------------------------- | ------------- | -------------------------- |
| `--md-icon-button-foreground-color`    | `inherit`     | Icon color                 |
| `--md-icon-button-background-color`    | `transparent` | Background fill            |
| `--md-icon-button-border-color`        | `transparent` | Border color               |
| `--md-icon-button-border-size`         | `0.063rem`    | Border width               |
| `--md-icon-button-font-size`           | `0.875rem`    | Icon font size             |
| `--md-icon-button-pressed-state-color` | `transparent` | State-layer color on press |

## Examples

### Variants

```html
<md-icon-button variant="standard"><md-icon>delete</md-icon></md-icon-button>
<md-icon-button variant="filled"><md-icon>delete</md-icon></md-icon-button>
<md-icon-button variant="outlined"><md-icon>delete</md-icon></md-icon-button>
<md-icon-button variant="tonal"><md-icon>delete</md-icon></md-icon-button>
```

### Toggle button

```html
<md-icon-button toggle>
  <md-icon>favorite_border</md-icon>
  <md-icon slot="selected">favorite</md-icon>
</md-icon-button>

<!-- Pre-selected -->
<md-icon-button toggle selected>
  <md-icon>bookmark_border</md-icon>
  <md-icon slot="selected">bookmark</md-icon>
</md-icon-button>
```

### Disabled

```html
<md-icon-button disabled>
  <md-icon>share</md-icon>
</md-icon-button>
```

### Custom colors

```html
<md-icon-button
  variant="filled"
  style="
    --md-icon-button-background-color: #6750a4;
    --md-icon-button-foreground-color: #fff;
  "
>
  <md-icon>add</md-icon>
</md-icon-button>
```

### Custom border (outlined variant)

```html
<md-icon-button
  variant="outlined"
  style="
    --md-icon-button-border-color: #6750a4;
    --md-icon-button-foreground-color: #6750a4;
  "
>
  <md-icon>edit</md-icon>
</md-icon-button>
```
