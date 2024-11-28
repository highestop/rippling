import { Atom, Effect, Getter, Setter } from "./atom";
import { NestedAtom } from "./util";

export interface Store {
    get: Getter;
    set: Setter;
    sub: Subscribe;
    notify: () => void;
}

export interface DebugStore extends Store {
    getReadDependencies: (atom: Atom<unknown>) => NestedAtom;
    getReadDependents: (atom: Atom<unknown>) => NestedAtom;
    getPendingListeners: () => NestedAtom;
    getSubscribeGraph: () => NestedAtom;
}

export type Subscribe = (atoms: Atom<unknown>[] | Atom<unknown>, callback: Effect<unknown, unknown[]>) => () => void;
