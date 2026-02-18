# vlist-svelte

Svelte action for [vlist](https://github.com/floor/vlist) - lightweight, zero-dependency virtual scrolling.

## Installation

```bash
npm install @floor/vlist vlist-svelte
```

## Usage

```svelte
<script>
  import { vlist } from 'vlist-svelte';
  import '@floor/vlist/styles';

  let users = [...];
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

### `vlist` action

**Parameters:**
- `config` - VList configuration (same as core vlist, minus `container`)
- `onInstance` - Callback to receive the vlist instance

**Example with instance access:**

```svelte
<script>
  import { vlist } from 'vlist-svelte';
  
  let instance;
  
  function scrollToTop() {
    instance?.scrollToIndex(0);
  }
</script>

<div use:vlist={{ config, onInstance: (i) => (instance = i) }} />
<button on:click={scrollToTop}>Top</button>
```

## Documentation

For full documentation, see [vlist.dev](https://vlist.dev)

## License

MIT © [Floor IO](https://floor.io)
