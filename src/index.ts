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
import { createVListFromConfig, type VListConfig, type ConfigItem, type ConfigMethods } from "vlist/config";

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
export type { VListConfig, VListFactory, ConfigItem, ConfigMethods } from "vlist/config";

/**
 * Configuration for the {@link vlist} action. vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the action owns via the
 * bound node.
 */
export type VListActionConfig<T extends VListItem = VListItem> = VListConfig<T>;

/**
 * The list a config builds: its item type read from `items` or the template,
 * and the methods its feature fields wire — `selection` brings `select()`,
 * `adapter` brings `reload()`, `layout: "grid"` brings `getGridLayout()`.
 */
export type VListActionInstance<C extends VListActionConfig<any>> =
  VList<ConfigItem<C>> & ConfigMethods<ConfigItem<C>, C>;

export interface VListActionOptions<C extends VListActionConfig<any> = VListActionConfig> {
  config: C;
  onInstance?: (instance: VListActionInstance<C>) => void;
}

/** The action's return: the instance's methods, with `update` and `destroy` the action's own. */
export type VListActionReturn<C extends VListActionConfig<any> = VListActionConfig> =
  Partial<VListActionInstance<C>> & {
    update?: (options: VListActionOptions<C>) => void;
    destroy?: () => void;
  };

/**
 * One type parameter, the config itself, inferred from `options.config`. Do
 * not pass a type argument: the item type comes from `items` or
 * `item.template`, and the plugin methods from the feature fields.
 */
export function vlist<const C extends VListActionConfig<any>>(
  node: HTMLElement,
  options: VListActionOptions<C>,
): VListActionReturn<C> {
  const config = options.config;

  const instance = createVListFromConfig({ ...config, container: node }) as VListActionInstance<C>;

  if (options.onInstance) {
    options.onInstance(instance);
  }

  // Return instance methods plus update/destroy overrides
  // Spread instance first, then override specific methods
  const { destroy: instanceDestroy, ...instanceMethods } = instance;

  return {
    ...instanceMethods,
    update(newOptions: VListActionOptions<C>) {
      if (newOptions.config.items && instance) {
        instance.setItems(newOptions.config.items);
      }
    },
    destroy() {
      if (instance) {
        instance.destroy();
      }
    },
    } as VListActionReturn<C>;
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
