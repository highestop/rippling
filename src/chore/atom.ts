import { Computed, Effect, Read, State, Write } from "../typing/atom";

interface Options {
    debugLabel?: string;
}

export function state<Value>(initialValue: Value, options?: Options): State<Value> {
    const ret: State<Value> = { init: initialValue };
    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }
    return ret;
}

export function computed<Value>(read: Read<Value>, options?: Options): Computed<Value> {
    const ret: Computed<Value> = { read: read };
    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }
    return ret;
}

export function effect<Value, Args extends unknown[]>(write: Write<Value, Args>, options?: Options): Effect<Value, Args> {
    const ret: Effect<Value, Args> = {
        write
    }
    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }
    return ret;
}