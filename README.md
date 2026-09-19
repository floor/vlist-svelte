# vlist-svelte

Svelte action for [@floor/vlist](https://github.com/floor/vlist) — lightweight, zero-dependency virtual scrolling.

## Install

```bash
npm install @floor/vlist vlist-svelte
```

## Quick Start

```svelte
<script>
  import { vlist } from 'vlist-svelte';
  import '@floor/vlist/styles';

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

Config accepts all [@floor/vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the action). Feature fields like `adapter`, `grid`, `groups`, `selection`, `scrollbar`, and `estimatedHeight` are translated into `.use(withX())` calls automatically.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — Svelte](https://vlist.dev/docs/frameworks#svelte)**

## Synthetic input

Requires `vlist ^3.0.0-next.1`. Pass the synthetic entry as `factory` to opt in; the adapter forwards it unchanged through `vlist/config`. `VListFactory` is re-exported for typed custom factories. The factory is selected at mount; remount to change it.

```svelte
<script lang="ts">
  import { vlist, type VListActionConfig } from "vlist-svelte";
  import { createVList } from "vlist/synthetic";

  const config: VListActionConfig<{ id: number }> = {
    factory: createVList,
    items: Array.from({ length: 1000 }, (_, id) => ({ id })),
    item: { height: 48, template: item => String(item.id) },
  };
</script>

<div use:vlist={{ config }} style="height: 400px" />
```

## License

MIT © [Floor IO](https://floor.io)
