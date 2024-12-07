import { ReadableAtom, Effect, Getter, Setter } from './atom';

export interface Store {
  get: Getter;
  set: Setter;
  sub: Subscribe;
}

export type Subscribe = (
  atoms: ReadableAtom<unknown>[] | ReadableAtom<unknown>,
  callback: Effect<unknown, unknown[]>,
) => () => void;
