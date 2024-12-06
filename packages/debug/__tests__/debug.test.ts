import { expect, it } from "vitest";
import { $computed, $effect, $value } from "../../core";
import { createDebugStore } from "../src/debug-store";
import { nestedAtomToString } from "../src/util";

it("get all subscribed atoms", () => {
  const store = createDebugStore();
  const base = $value(1, { debugLabel: "base" });
  const derived = $computed((get) => get(base) + 1, { debugLabel: "derived" });
  store.sub(
    [base, derived],
    $effect(
      () => {
        void 0;
      },
      { debugLabel: "sub" },
    ),
  );
  expect(nestedAtomToString(store.getSubscribeGraph())).toEqual([
    ["base", "sub"],
    ["derived", "sub"],
  ]);
});
