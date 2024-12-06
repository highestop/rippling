import { Computed, Effect, Value } from "rippling";

export type NestedAtom = (
  | Value<unknown>
  | Computed<unknown>
  | Effect<unknown, unknown[]>
  | NestedAtom
)[];
export type NestedString = (string | NestedString)[];
