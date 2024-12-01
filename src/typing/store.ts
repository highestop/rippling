import { ReadableAtom, Effect, Getter, Setter, Computed } from "./atom";
import { NestedAtom } from "./util";

export interface Store {
    get: Getter;
    set: Setter;
    sub: Subscribe;
}

export interface DebugStore extends Store {
    getReadDependencies: (atom: Computed<unknown>) => NestedAtom;
    getReadDependents: (atom: ReadableAtom<unknown>) => NestedAtom;
    getPendingListeners: () => NestedAtom;
    getSubscribeGraph: () => NestedAtom;
}

export type Subscribe = (atoms: ReadableAtom<unknown>[] | ReadableAtom<unknown>, callback: Effect<unknown, unknown[]>) => () => void;
