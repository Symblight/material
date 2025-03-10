```html
<script>
  window.addEventListener("load", () => {
    const dataGridElement = document.getElementById("my-data-grid");
    dataGridElement.data = [];
    dataGridElement.columns = [];
  });
</script>

<md-data-grid id="my-data-grid"></md-data-grid>
```

# Lifecycle

Get list of columns > Get data property > create state > render cells/head/body

Create provider with new Map (register, unregister)
Create consumer mixin for each child component
