import { Atom, Effect, Getter, Setter } from "./atom";

export interface Store {
    get: Getter;
    set: Setter;
    sub: Subscribe;
    flush: () => void;
}

export interface DebugStore extends Store {
    getReadDependencies: (atom: Atom<unknown>) => NestedString;
    getMountGraph: (atom: Atom<unknown>) => NestedString
}

export type Subscribe = (atoms: Atom<unknown>[] | Atom<unknown>, callback: Effect<unknown, unknown[]>) => () => void;

export type NestedString = (string | NestedString)[];
