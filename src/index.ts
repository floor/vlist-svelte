// vlist-svelte
/**
 * Svelte action for vlist - lightweight virtual scrolling
 */

import type {
  VListConfig,
  VListItem,
  VListEvents,
  EventHandler,
  Unsubscribe,
} from "@floor/vlist";
import { vlist as createVListBuilder, type BuiltVList } from "@floor/vlist";
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

export type VListActionConfig<T extends VListItem = VListItem> = Omit<
  VListConfig<T>,
  "container"
>;

export interface VListActionOptions<T extends VListItem = VListItem> {
  config: VListActionConfig<T>;
  onInstance?: (instance: BuiltVList<T>) => void;
}

export interface VListActionReturn<T extends VListItem = VListItem> {
  update?: (options: VListActionOptions<T>) => void;
  destroy?: () => void;
}

export function vlist<T extends VListItem = VListItem>(
  node: HTMLElement,
  options: VListActionOptions<T>,
): VListActionReturn<T> {
  const config = options.config;
  let builder = createVListBuilder<T>({
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
    const groupsConfig = config.groups;
    const headerHeight =
      typeof groupsConfig.headerHeight === "function"
        ? groupsConfig.headerHeight("", 0)
        : groupsConfig.headerHeight;

    builder = builder.use(
      withSections({
        getGroupForIndex: groupsConfig.getGroupForIndex,
        headerHeight,
        headerTemplate: groupsConfig.headerTemplate,
        ...(groupsConfig.sticky !== undefined && {
          sticky: groupsConfig.sticky,
        }),
      }),
    );
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

  let instance: BuiltVList<T> = builder.build();

  if (options.onInstance) {
    options.onInstance(instance);
  }

  return {
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
  instance: BuiltVList<T>,
  event: K,
  handler: EventHandler<VListEvents<T>[K]>,
): Unsubscribe {
  return instance.on(event, handler);
}
