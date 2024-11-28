import { Atom } from "./atom";

export type NestedAtom = (Atom<unknown> | NestedAtom)[];
export type NestedString = (string | NestedString)[];