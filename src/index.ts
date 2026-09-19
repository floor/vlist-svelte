// vlist-svelte
/**
 * Svelte action for vlist - lightweight virtual scrolling
 */

import type {
  VListItem,
  VListEvents,
  EventHandler,
  Unsubscribe,
} from "vlist";
import type { VList } from "vlist";
import { createVListFromConfig, type VListConfig } from "vlist/config";

// Re-export types that appear in VListActionConfig / VListActionReturn
export type {
  VListItem,
  VListEvents,
  VList,
  CreateVListConfig,
  ItemConfig,
  ItemTemplate,
  EventHandler,
  Unsubscribe,
} from "vlist";
export type { VListConfig, VListFactory } from "vlist/config";

/**
 * Configuration for the {@link vlist} action. vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the action owns via the
 * bound node.
 */
export type VListActionConfig<T extends VListItem = VListItem> = VListConfig<T>;

export interface VListActionOptions<T extends VListItem = VListItem> {
  config: VListActionConfig<T>;
  onInstance?: (instance: VList<T>) => void;
}

export interface VListActionReturn<
  T extends VListItem = VListItem,
> extends Partial<VList<T>> {
  update?: (options: VListActionOptions<T>) => void;
  destroy?: () => void;
}

export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: VListActionOptions<T>,
): VListActionReturn<T> {
  const config = options.config;

  // No type argument: vlist 3 takes two (the item and the config, so the
  // instance carries the methods the config's feature fields imply), and
  // both are inferred from the argument.
  let instance: VList<T> = createVListFromConfig({ ...config, container: node });

  if (options.onInstance) {
    options.onInstance(instance);
  }

  // Return instance methods plus update/destroy overrides
  // Spread instance first, then override specific methods
  const { destroy: instanceDestroy, ...instanceMethods } = instance;

  return {
    ...instanceMethods,
    update(newOptions: VListActionOptions<T>) {
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
