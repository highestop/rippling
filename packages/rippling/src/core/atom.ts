import type { Computed, Func, Read, Value, Write } from '../../types/core/atom';

interface Options {
  debugLabel?: string;
}

let globalId = 0;

const generateToString = (debugLabel?: string) => {
  const id = globalId++;
  const label = `${String(id)}:${debugLabel ?? ''}`;
  return () => label;
};

export function $value<T>(init: T, options?: Options): Value<T> {
  const ret: Value<T> = {
    init,
    toString: generateToString(options?.debugLabel),
  };

  if (options?.debugLabel) {
    ret.debugLabel = options.debugLabel;
  }
  return ret;
}

export function $computed<T>(read: Read<T>, options?: Options): Computed<T> {
  const ret: Computed<T> = {
    read,
    toString: generateToString(options?.debugLabel),
  };
  if (options?.debugLabel) {
    ret.debugLabel = options.debugLabel;
  }
  return ret;
}

export function $func<T, Args extends unknown[]>(write: Write<T, Args>, options?: Options): Func<T, Args> {
  const ret: Func<T, Args> = {
    write,
    toString: generateToString(options?.debugLabel),
  };
  if (options?.debugLabel) {
    ret.debugLabel = options.debugLabel;
  }
  return ret;
}
