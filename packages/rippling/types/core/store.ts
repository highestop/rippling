import type { ReadableAtom, Func, Getter, Setter } from './atom';

export interface Store {
  get: Getter;
  set: Setter;
  sub: Subscribe;
}

export interface SubscribeOptions {
  signal?: AbortSignal;
}

export type Subscribe = (
  atoms: ReadableAtom<unknown>[] | ReadableAtom<unknown>,
  callback: Func<unknown, unknown[]>,
  options?: SubscribeOptions,
) => () => void;
