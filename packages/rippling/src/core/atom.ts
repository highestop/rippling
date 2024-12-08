import type { Computed, Effect, Read, Value, Write } from '../../types/core/atom';

interface Options {
  debugLabel?: string;
}

let globalId = 0;
export function $value<T>(init: T, options?: Options): Value<T> {
  const ret: Value<T> = {
    init,
    id: globalId++,
    toString: () => `${String(ret.id)}:v:${ret.debugLabel ?? ''}`,
  };
  if (options?.debugLabel) {
    ret.debugLabel = options.debugLabel;
  }
  return ret;
}

export function $computed<T>(read: Read<T>, options?: Options): Computed<T> {
  const ret: Computed<T> = {
    read,
    id: globalId++,
    toString: () => `${String(ret.id)}:c:${ret.debugLabel ?? ''}`,
  };
  if (options?.debugLabel) {
    ret.debugLabel = options.debugLabel;
  }
  return ret;
}

export function $effect<T, Args extends unknown[]>(write: Write<T, Args>, options?: Options): Effect<T, Args> {
  const ret: Effect<T, Args> = {
    write,
    id: globalId++,
    toString: () => `${String(ret.id)}:e:${ret.debugLabel ?? ''}`,
  };
  if (options?.debugLabel) {
    ret.debugLabel = options.debugLabel;
  }
  return ret;
}
