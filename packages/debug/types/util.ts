import { Computed, Effect, Value } from "@rippling/core";

export type NestedAtom = (
  | Value<unknown>
  | Computed<unknown>
  | Effect<unknown, unknown[]>
  | NestedAtom
)[];
export type NestedString = (string | NestedString)[];
