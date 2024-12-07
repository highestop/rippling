import type { Computed, Effect, Value } from '../core/atom';

export type NestedAtom = (Value<unknown> | Computed<unknown> | Effect<unknown, unknown[]> | NestedAtom)[];
export type NestedString = (string | NestedString)[];
