# vlist-svelte

Svelte action for [vlist](https://github.com/floor/vlist) — lightweight, zero-dependency virtual scrolling.

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

Config accepts all [vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the action). Feature fields like `adapter`, `grid`, `groups`, `selection`, `scrollbar`, and `estimatedHeight` are resolved into plugins automatically.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — Svelte](https://vlist.dev/docs/frameworks#svelte)**

## Synthetic input

Every list scrolls natively by default, and hands itself to synthetic input past the browser's element size limit: `scroll.mode` is `"auto"`. Pass `scroll: { mode: "synthetic" }` for synthetic input from the start, or `"native"` to stay native; the adapter forwards `scroll` unchanged through `vlist/config`. A synthetic list draws its own scrollbar. Requires `vlist ^3.0.1-next.1`; on 3.0.0, pass `factory: createVList` from the deprecated `vlist/synthetic`. `VListFactory` is re-exported for typed custom factories.

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
