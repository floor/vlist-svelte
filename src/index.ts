// vlist-svelte
/**
 * Svelte action for vlist - lightweight virtual scrolling
 *
 * @packageDocumentation
 */

import type {
  VListConfig,
  VListItem,
  VList,
  VListEvents,
  EventHandler,
  Unsubscribe,
} from "@floor/vlist";
import { vlist as createVList } from "@floor/vlist";
import {
  withAsync,
  withGrid,
  withSections,
  withSelection,
  withScrollbar,
  withScale,
  withSnapshots,
  withPage,
} from "@floor/vlist";

// =============================================================================
// Types
// =============================================================================

/** Configuration for vlist action (VListConfig without container) */
export type VListActionConfig<T extends VListItem = VListItem> = Omit<
  VListConfig<T>,
  "container"
>;

/** Options for the vlist action */
export interface VListActionOptions<T extends VListItem = VListItem> {
  /** VList configuration */
  config: VListActionConfig<T>;
  /** Callback to receive the vlist instance */
  onInstance?: (instance: VList<T>) => void;
}

/** Return value from the vlist action */
export interface VListActionReturn<T extends VListItem = VListItem> {
  /** Update the configuration */
  update?: (options: VListActionOptions<T>) => void;
  /** Cleanup */
  destroy?: () => void;
}

// =============================================================================
// Action
// =============================================================================

/**
 * Svelte action for vlist integration.
 *
 * @example
 * ```svelte
 * <script>
 *   import { vlist } from 'vlist-svelte';
 *   import '@floor/vlist/styles';
 *
 *   let users = [...];
 *   let instance;
 *
 *   const config = {
 *     item: {
 *       height: 48,
 *       template: (user) => `<div>${user.name}</div>`,
 *     },
 *     items: users,
 *   };
 * </script>
 *
 * <div
 *   use:vlist={{ config, onInstance: (i) => (instance = i) }}
 *   style="height: 400px"
 * />
 * ```
 */
export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: VListActionOptions<T>,
): VListActionReturn<T> {
  // Build vlist with plugins
  const config = options.config;
  let builder = createVList<T>({
    ...config,
    container: node,
  });

  if (config.scroll?.element === window) {
    builder = builder.use(withPage());
  }

  if (config.adapter) {
    builder = builder.use(
      withAsync({
        adapter: config.adapter,
        ...(config.loading && { loading: config.loading }),
      }),
    );
  }

  if (config.layout === "grid" && config.grid) {
    builder = builder.use(withGrid(config.grid));
  }

  if (config.groups) {
    builder = builder.use(withSections(config.groups));
  }

  const selectionMode = config.selection?.mode || "none";
  if (selectionMode !== "none") {
    builder = builder.use(withSelection(config.selection));
  } else {
    builder = builder.use(withSelection({ mode: "none" }));
  }

  builder = builder.use(withScale());

  const scrollbarConfig = config.scroll?.scrollbar || config.scrollbar;
  if (scrollbarConfig !== "none") {
    const scrollbarOptions =
      typeof scrollbarConfig === "object" ? scrollbarConfig : {};
    builder = builder.use(withScrollbar(scrollbarOptions));
  }

  builder = builder.use(withSnapshots());

  let instance: VList<T> = builder.build() as VList<T>;

  // Notify consumer of the instance
  if (options.onInstance) {
    options.onInstance(instance);
  }

  return {
    update(newOptions: VListActionOptions<T>) {
      // Update items if they changed
      if (newOptions.config.items && instance) {
        instance.setItems(newOptions.config.items);
      }
    },
    destroy() {
      if (instance) {
        instance.destroy();
      }
    },
  };
}

/**
 * Helper to subscribe to vlist events in Svelte
 *
 * @example
 * ```svelte
 * <script>
 *   import { vlist, onVListEvent } from 'vlist-svelte';
 *   
 *   let instance;
 *   
 *   $: if (instance) {
 *     onVListEvent(instance, 'selection:change', ({ selected }) => {
 *       console.log('Selected:', selected);
 *     });
 *   }
 * </script>
 * ```
 */
export function onVListEvent<
  T extends VListItem,
  K extends keyof VListEvents<T>,
>(
  instance: VList<T>,
  event: K,
  handler: EventHandler<VListEvents<T>[K]>,
): Unsubscribe {
  return instance.on(event, handler);
}
