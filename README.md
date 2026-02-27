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

Config accepts all [@floor/vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the action). Feature fields like `adapter`, `grid`, `groups`, `selection`, and `scrollbar` are translated into `.use(withX())` calls automatically.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — Svelte](https://vlist.dev/docs/frameworks#svelte)**

## License

MIT © [Floor IO](https://floor.io)