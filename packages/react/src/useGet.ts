import { useSyncExternalStore } from "react";
import { $effect, Computed, Value } from "rippling";
import { useStore } from "./provider";

export function useGet<T>(atom: Value<T> | Computed<T>) {
  const store = useStore();
  return useSyncExternalStore(
    (fn) => {
      return store.sub(atom, $effect(fn));
    },
    () => {
      return store.get(atom);
    },
  );
}
