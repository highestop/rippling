import { expect, it, vi } from "vitest";
import { createStore, $effect, $value } from "..";

it("should trigger multiple times when hierarchy effect is set", () => {
  const base = $value(0);
  const innerUpdateEffect = $effect((_get, set) => {
    set(base, 1);
  });
  const updateEffect = $effect((_get, set) => {
    set(innerUpdateEffect);
    set(base, 2);
  });

  const trace = vi.fn();
  const store = createStore();
  store.sub(
    base,
    $effect(() => {
      trace();
    }),
  );

  store.set(updateEffect);

  expect(trace).toHaveBeenCalledTimes(2);
});

it("should trigger subscriber if effect throws", () => {
  const base = $value(0);
  const action = $effect((_get, set) => {
    set(base, 1);
    throw new Error("test");
  });

  const trace = vi.fn();
  const store = createStore();
  store.sub(
    base,
    $effect(() => {
      trace();
    }),
  );

  expect(() => {
    store.set(action);
  }).toThrow("test");
  expect(trace).toHaveBeenCalledTimes(1);
});
