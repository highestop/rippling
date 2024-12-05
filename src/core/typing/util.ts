import { ReadableAtom, WritableAtom } from "./atom";

export type NestedAtom = (ReadableAtom<unknown> | WritableAtom<unknown> | NestedAtom)[];
export type NestedString = (string | NestedString)[];