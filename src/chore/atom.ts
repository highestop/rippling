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
    const internalLabelOptions: Options = {}
    if (options?.debugLabel) {
        internalLabelOptions.debugLabel = options.debugLabel + '_effectResult';
    }
    const internalValue = state<{
        value: Value,
        inited: true,
    } | {
        inited: false
    }>({
        inited: false
    }, internalLabelOptions);

    const ret: Effect<Value, Args> = {
        write: (get, set, ...args) => {
            const ret = write(get, set, ...args);
            set(internalValue, {
                value: ret,
                inited: true,
            });
            return ret;
        },
        read: (get) => {
            const value = get(internalValue);
            if (!value.inited) {
                throw new Error('Effect is not inited');
            }
            return value.value;
        }
    }

    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }

    return ret;
}