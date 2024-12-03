import { Computed, Effect, Read, Value, Write } from "../typing/atom";

interface Options {
    debugLabel?: string;
}

export function $value<T>(init: T, options?: Options): Value<T> {
    const ret: Value<T> = { init };
    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }
    return ret;
}

export function $computed<T>(read: Read<T>, options?: Options): Computed<T> {
    const ret: Computed<T> = { read: read };
    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }
    return ret;
}

export function $effect<T, Args extends unknown[]>(write: Write<T, Args>, options?: Options): Effect<T, Args> {
    const ret: Effect<T, Args> = {
        write
    }
    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }
    return ret;
}