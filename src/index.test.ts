import { createVList as createSynthetic } from "vlist/synthetic";
import type { VListFactory } from "./index";
/**
 * vlist-svelte — real render tests
 *
 * The adapter exposes a Svelte `use:vlist` action — a plain function of
 * `(node, options)`. These tests apply it to a real happy-dom node (exactly how
 * `use:vlist` invokes it) and assert it virtualizes and destroys cleanly.
 * Includes floor/vlist#119 coverage: a `plugins` array overlapping the action's
 * auto-wiring must run without a "Duplicate plugin" throw.
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { vlist } from "./index";
import { grid, autosize, type VListItem } from "vlist";
import type { VListActionConfig } from "./index";

interface Row extends VListItem {
  id: string;
}

const rows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `row-${i}` }));
const template = (r: Row): string => `<div class="row" data-id="${r.id}">${r.id}</div>`;

const VIEWPORT_H = 500;
const VIEWPORT_W = 300;

function installLayoutShims(): () => void {
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => VIEWPORT_H });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => VIEWPORT_W });
  const RealRO = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) { this.cb = cb; }
    observe(target: Element): void {
      this.cb([{ target, contentRect: { width: VIEWPORT_W, height: VIEWPORT_H } as DOMRectReadOnly } as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver;
  const realRAF = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback): number =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number) as typeof requestAnimationFrame;
  return () => { globalThis.ResizeObserver = RealRO; globalThis.requestAnimationFrame = realRAF; };
}

let restoreShims: () => void;
beforeAll(() => { GlobalRegistrator.register(); restoreShims = installLayoutShims(); });
afterAll(() => { restoreShims?.(); GlobalRegistrator.unregister(); });

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 5));

/** Apply the action to a fresh node, as `use:vlist` would. */
async function apply(config: VListActionConfig<Row>) {
  const node = document.createElement("div");
  Object.defineProperty(node, "style", { value: { height: `${VIEWPORT_H}px` }, configurable: true });
  document.body.appendChild(node);
  const action = vlist<Row>(node, { config });
  await flush();
  return { node, action };
}

describe("vlist action — render", () => {
  it("mounts and virtualizes a large list", async () => {
    const { node, action } = await apply({ item: { height: 40, template }, items: rows(1000) });
    const rendered = node.querySelectorAll(".row");
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(100);
    action.destroy?.();
  });

  it("destroys cleanly", async () => {
    const { node, action } = await apply({ item: { height: 40, template }, items: rows(100) });
    expect(node.querySelectorAll(".row").length).toBeGreaterThan(0);
    expect(() => action.destroy?.()).not.toThrow();
  });

  it("#119: accepts and runs a plugins array overlapping auto-wiring", async () => {
    const { node, action } = await apply({
      item: { estimatedHeight: 200, template },
      items: rows(200),
      plugins: [grid({ columns: 3 }), autosize()],
    });
    expect(node.querySelectorAll(".row").length).toBeGreaterThan(0);
    action.destroy?.();
  });
});

it("forwards a typed synthetic factory and creates the synthetic driver", async () => {
  let calls = 0;
  let pluginNames: string[] = [];
  const factory: VListFactory<Row> = (config, plugins = []) => {
    calls++;
    pluginNames = plugins.map(plugin => plugin.name);
    expect(config).not.toHaveProperty("factory");
    return createSynthetic(config, plugins);
  };
  const { node, action } = await apply({
    factory, scroll: { mode: "synthetic" }, items: rows(100), item: { height: 40, template },
  });
  try {
    expect(calls).toBe(1);
    expect(node.querySelector<HTMLElement>(".vlist-viewport")!.style.touchAction).toBe("pan-x pinch-zoom");
    expect(pluginNames).toEqual(["selection", "scale", "scrollbar", "snapshots"]);
  } finally { action.destroy?.(); node.remove(); }
});
