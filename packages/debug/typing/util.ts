import { Computed, Effect, Value } from "../../core";

export type NestedAtom = (
  | Value<unknown>
  | Computed<unknown>
  | Effect<unknown, unknown[]>
  | NestedAtom
)[];
export type NestedString = (string | NestedString)[];
