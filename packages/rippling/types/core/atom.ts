export type Updater<T> = (current: T) => T;
export interface Setter {
  <T>(value: Value<T>, val: T | Updater<T>): void;
  <T, Args extends unknown[]>(effect: Effect<T, Args>, ...args: Args): T;
}
export type Getter = <T>(readable: ReadableAtom<T>) => T;
export interface GetterOptions {
  signal: AbortSignal;
}
export type Read<T> = (get: Getter, options: GetterOptions) => T;
export type Write<T, Args extends unknown[]> = (get: Getter, set: Setter, ...args: Args) => T;

export interface Value<T> {
  id: number;
  init: T;
  debugLabel?: string;
  toString: () => string;
}
export interface Computed<T> {
  id: number;
  read: Read<T>;
  debugLabel?: string;
  toString: () => string;
}
export interface Effect<T, Args extends unknown[]> {
  id: number;
  write: Write<T, Args>;
  debugLabel?: string;
  toString: () => string;
}

export type ReadableAtom<T> = Value<T> | Computed<T>;
export type WritableAtom<T> = Value<T> | Effect<T, unknown[]>;
