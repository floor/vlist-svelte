// vlist-svelte
/**
 * Svelte action for vlist - lightweight virtual scrolling
 *
 * Deprecated: use `vlist/svelte` from the vlist package, which takes features
 * as plugins (`use:vlist={{ config: { items, item }, plugins: [selection()] }}`).
 * This package keeps the config-based API on top of it: the action is
 * `vlist/svelte`'s, building the list with `createVListFromConfig` so feature
 * fields still resolve to plugins.
 */

import type { VListItem, VList } from "vlist";
import { createVListFromConfig, type VListConfig } from "vlist/config";
import { vlist as entry, onVListEvent } from "vlist/svelte";

export { onVListEvent };

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

type EntryOptions<T extends VListItem> = Parameters<typeof entry<T>>[1];

/** `vlist/svelte`'s factory option: builds from the whole config. */
const fromConfig = createVListFromConfig as unknown as EntryOptions<VListItem>["create"];

export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: VListActionOptions<T>,
): VListActionReturn<T> {
  let instance!: VList<T>;
  const action = entry<T>(node, {
    config: options.config as EntryOptions<T>["config"],
    create: fromConfig,
    onInstance: (list) => {
      instance = list;
      options.onInstance?.(list);
    },
  });

  // As before 3.1, the action also carries the instance's methods.
  const { destroy: _destroy, ...methods } = instance;
  return {
    ...methods,
    update: (next) => action.update({ config: next.config as EntryOptions<T>["config"] }),
    destroy: action.destroy,
  };
}
