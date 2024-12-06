import { useSyncExternalStore } from "react";
import { useStore } from "./provider";
import { $effect, Computed, Value } from "../core";

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
