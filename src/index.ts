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

import type {
  VListItem,
  VList,
  VListPlugin,
  TableMethods,
  ColumnPinMethods,
  ColumnReorderMethods,
} from "vlist";
import { createVListFromConfig, type VListConfig, type ConfigMethods } from "vlist/config";
import { vlist as entry, onVListEvent } from "vlist/svelte";

export { onVListEvent };

// Re-export types that appear in VListActionConfig / VListActionReturn
export type {
  VListItem,
  VListEvents,
  VList,
  VListPlugin,
  CreateVListConfig,
  ItemConfig,
  ItemTemplate,
  EventHandler,
  Unsubscribe,
  TableColumn,
  TablePluginConfig,
  TableMethods,
  TableFeature,
  TableFeatureMethods,
  ColumnPinConfig,
  ColumnPinMethods,
  ColumnReorderConfig,
  ColumnReorderMethods,
} from "vlist";
export type { VListConfig, VListFactory, ConfigMethods } from "vlist/config";

/**
 * Configuration for the {@link vlist} action. vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the action owns via the
 * bound node.
 */
export type VListActionConfig<T extends VListItem = VListItem> = VListConfig<T>;

type InstanceMethods<T extends VListItem, M> = M extends VListActionConfig<T> ? ConfigMethods<T, M> : M;

export interface VListActionOptions<
  T extends VListItem = VListItem,
  M = {},
> {
  config: VListActionConfig<T>;
  onInstance?: (instance: VList<T> & InstanceMethods<T, M>) => void;
}

export type VListActionReturn<
  T extends VListItem = VListItem,
  M = {},
> = Partial<VList<T> & InstanceMethods<T, M>> & {
  update?: (options: VListActionOptions<T>) => void;
  destroy?: () => void;
};

type WithPlugin<T extends VListItem, M> = Omit<VListActionConfig<T>, "plugins"> & {
  plugins:
    | readonly [VListPlugin<T, M>, ...(readonly VListPlugin<T, unknown>[])]
    | readonly [...(readonly VListPlugin<T, unknown>[]), VListPlugin<T, M>];
};

type EntryOptions<T extends VListItem> = Parameters<typeof entry<T>>[1];

/** `vlist/svelte`'s factory option: builds from the whole config. */
const fromConfig = createVListFromConfig as unknown as EntryOptions<VListItem>["create"];

export function vlist<
  T extends VListItem,
  const C extends VListActionConfig<NoInfer<T>> & { items: readonly T[] },
>(
  node: HTMLElement,
  options: {
    config: { items: readonly T[] } & VListActionConfig<NoInfer<T>> & C;
    onInstance?: (instance: VList<T> & ConfigMethods<T, C>) => void;
  },
): VListActionReturn<T, ConfigMethods<T, C>>;
export function vlist<
  T extends VListItem,
  const C extends VListActionConfig<T>,
>(
  node: HTMLElement,
  options: {
    config: VListActionConfig<T> & C;
    onInstance?: (instance: VList<T> & ConfigMethods<T, C>) => void;
  },
): VListActionReturn<T, ConfigMethods<T, C>>;
export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: {
    config: WithPlugin<T, TableMethods<T> & ColumnPinMethods & ColumnReorderMethods>;
    onInstance?: (instance: VList<T> & TableMethods<T> & ColumnPinMethods & ColumnReorderMethods) => void;
  },
): VListActionReturn<T, TableMethods<T> & ColumnPinMethods & ColumnReorderMethods>;
export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: {
    config: WithPlugin<T, TableMethods<T> & ColumnPinMethods>;
    onInstance?: (instance: VList<T> & TableMethods<T> & ColumnPinMethods) => void;
  },
): VListActionReturn<T, TableMethods<T> & ColumnPinMethods>;
export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: {
    config: WithPlugin<T, TableMethods<T> & ColumnReorderMethods>;
    onInstance?: (instance: VList<T> & TableMethods<T> & ColumnReorderMethods) => void;
  },
): VListActionReturn<T, TableMethods<T> & ColumnReorderMethods>;
export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: {
    config: WithPlugin<T, TableMethods<T>>;
    onInstance?: (instance: VList<T> & TableMethods<T>) => void;
  },
): VListActionReturn<T, TableMethods<T>>;
export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: VListActionOptions<T>,
): VListActionReturn<T>;
export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: {
    config: VListActionConfig<T> | WithPlugin<T, unknown>;
    onInstance?: (instance: never) => void;
  },
): VListActionReturn<T> {
  let instance!: VList<T>;
  const action = entry<T>(node, {
    config: options.config as EntryOptions<T>["config"],
    create: fromConfig,
    onInstance: (list) => {
      instance = list;
      options.onInstance?.(list as never);
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
