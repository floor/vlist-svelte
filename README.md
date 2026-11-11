# vlist-svelte

Svelte action for [vlist](https://github.com/floor/vlist) — lightweight, zero-dependency virtual scrolling.

> **Deprecated.** Use [`vlist/svelte`](https://github.com/floor/vlist#frameworks) from the `vlist` package instead. Change the import path, and pass features as plugins:
>
> ```svelte
> // before
> import { vlist } from "vlist-svelte";
> use:vlist={{ config: { items, item, selection: { mode: "single" } } }}
>
> // after
> import { vlist } from "vlist/svelte";
> import { selection } from "vlist";
> use:vlist={{ config: { items, item }, plugins: [selection({ mode: "single" })] }}
> ```
>
> From 3.1 this package is built on `vlist/svelte` and keeps its config-based API, so existing code keeps working while you migrate. It needs `vlist ^3.7.0`; on vlist 3.1–3.6, stay on `vlist-svelte` 3.1.0; on vlist 3.0.x, stay on `vlist-svelte` 3.0.x.

## Install

```bash
npm install vlist vlist-svelte
```

## Quick Start

```svelte
<script>
  import { vlist } from 'vlist-svelte';
  import 'vlist/styles';

  let instance;

  const config = {
    item: {
      height: 48,
      template: (user) => `<div class="user">${user.name}</div>`,
    },
    items: users,
  };
</script>

<div
  use:vlist={{ config, onInstance: (i) => (instance = i) }}
  style="height: 400px"
/>
```

## API

- **`vlist` action** — Svelte `use:` directive that creates a virtual list on the node. Pass `{ config, onInstance }`.
- **`onVListEvent(instance, event, handler)`** — Subscribe to vlist events. Returns an unsubscribe function.

Config accepts all [vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the action). Feature fields like `adapter`, `grid`, `groups`, `selection`, `scrollbar`, and `estimatedHeight` are resolved into plugins automatically; `plugins` passes explicit plugins like `table({ features })` through unchanged, and both `onInstance` and the returned action carry the methods they add.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — Svelte](https://vlist.dev/docs/frameworks#svelte)**

## Table features

Pass `table()` and its optional `features` (`columnPin()`, `columnReorder()`) in `plugins`. Give the table a `rowHeight` and `item` a fixed `height` (not `estimatedHeight`, which wires `autosize()` and conflicts with `table()`). Both the `onInstance` callback and the returned action carry the table and feature methods (`setColumnPin`, `getColumnPins`, `moveColumn`, `getColumnOrder`) without a cast; `TableColumn` and the table feature types are re-exported. Requires `vlist ^3.7.0`.

```svelte
<script lang="ts">
  import { vlist, type TableColumn } from "vlist-svelte";
  import { table, columnPin, columnReorder } from "vlist";
  import "vlist/styles";
  import "vlist/styles/table";

  interface Row {
    id: number;
    name: string;
    role: string;
  }

  const rows: Row[] = [
    { id: 1, name: "Ada", role: "Engineer" },
    { id: 2, name: "Grace", role: "Architect" },
  ];

  const columns: TableColumn<Row>[] = [
    { key: "name", label: "Name", width: 180 },
    { key: "role", label: "Role", width: 140 },
  ];

  const config = {
    items: rows,
    item: { height: 40, template: (row: Row) => row.name },
    plugins: [
      table<Row>({
        columns,
        rowHeight: 40,
        features: [columnPin(), columnReorder()],
      }),
    ],
  };
</script>

<div
  use:vlist={{
    config,
    onInstance: (list) => {
      list.setColumnPin("name", "left");
      list.moveColumn("role", 0);
    },
  }}
  style="height: 400px"
/>
```

## Synthetic input

Every list scrolls natively by default, and hands itself to synthetic input past the browser's element size limit: `scroll.mode` is `"auto"`. Pass `scroll: { mode: "synthetic" }` for synthetic input from the start, or `"native"` to stay native; the adapter forwards `scroll` unchanged through `vlist/config`. A synthetic list draws its own scrollbar. Requires `vlist ^3.1.0`. A carousel honours `"synthetic"` too. `VListFactory` is re-exported for typed custom factories.

```svelte
<script lang="ts">
  import { vlist, type VListActionConfig } from "vlist-svelte";

  const config: VListActionConfig<{ id: number }> = {
    items: Array.from({ length: 1000 }, (_, id) => ({ id })),
    item: { height: 48, template: item => String(item.id) },
    scroll: { mode: "synthetic" },
  };
</script>

<div use:vlist={{ config }} style="height: 400px" />
```

## License

MIT © [Floor IO](https://floor.io)
