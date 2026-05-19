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
import {
  createVList as createVListCore,
  page,
  autosize,
  async as asyncPlugin,
  grid,
  masonry,
  groups,
  selection,
  scale,
  scrollbar,
  snapshots,
} from "vlist";
import type { VList, VListPlugin, CreateVListConfig } from "vlist";

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

export type VListActionConfig<T extends VListItem = VListItem> = Omit<
  CreateVListConfig<T>,
  "container"
>;

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
  const plugins: VListPlugin<T>[] = [];

  if (config.scroll?.element === window) {
    plugins.push(page());
  }

  const item = config.item;
  const isHorizontal = config.orientation === "horizontal";
  const hasExplicitSize = isHorizontal ? item.width != null : item.height != null;
  const hasEstimate = isHorizontal
    ? (item as unknown as Record<string, unknown>).estimatedWidth != null
    : (item as unknown as Record<string, unknown>).estimatedHeight != null;
  if (!hasExplicitSize && hasEstimate) {
    plugins.push(autosize());
  }

  if (config.adapter) {
    plugins.push(
      asyncPlugin({
        adapter: config.adapter,
        ...(config.loading && { loading: config.loading }),
      }),
    );
  }

  if (config.layout === "grid" && config.grid) {
    plugins.push(grid(config.grid));
  }

  if (config.layout === "masonry" && config.masonry) {
    plugins.push(masonry(config.masonry));
  }

  if (config.groups) {
    const groupsConfig = config.groups;
    const headerHeight =
      typeof groupsConfig.headerHeight === "function"
        ? groupsConfig.headerHeight("", 0)
        : groupsConfig.headerHeight;
    plugins.push(
      groups({
        getGroupForIndex: groupsConfig.getGroupForIndex,
        headerHeight,
        headerTemplate: groupsConfig.headerTemplate,
        ...(groupsConfig.sticky !== undefined && { sticky: groupsConfig.sticky }),
      }),
    );
  }

  const selectionMode = config.selection?.mode || "none";
  if (selectionMode !== "none") {
    plugins.push(selection(config.selection));
  } else {
    plugins.push(selection({ mode: "none" }));
  }

  plugins.push(scale());

  const scrollbarConfig = config.scroll?.scrollbar || config.scrollbar;
  if (scrollbarConfig !== "none") {
    const scrollbarOptions =
      typeof scrollbarConfig === "object" ? scrollbarConfig : {};
    plugins.push(scrollbar(scrollbarOptions));
  }

  plugins.push(snapshots());

  let instance: VList<T> = createVListCore<T>({ ...config, container: node }, plugins);

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
