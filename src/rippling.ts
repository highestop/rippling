import { State, Effect, Getter, Read, Readable, Computed, Setter, Store, Write } from "./typing";

export function state<Value>(initialValue: Value): State<Value> {
    return { _initialValue: initialValue }
}

export function computed<Value>(read: Read<Value>): Computed<Value> {
    return { _read: read }
}

export function effect<Value, Args extends unknown[]>(write: Write<Args, Value>): Effect<Value, Args, Value> {
    const internalValue = state<{
        value: Value,
        inited: true,
    } | {
        inited: false
    }>({
        inited: false
    });

    return {
        _write: (get, set, ...args) => {
            const ret = write(get, set, ...args);
            set(internalValue, {
                value: ret,
                inited: true,
            });
            return ret;
        },
        _read: (get) => {
            const value = get(internalValue);
            if (!value.inited) {
                throw new Error('Effect is not inited');
            }
            return value.value;
        }
    }
}

function canReadAsCompute<Value>(readable: Readable<Value>): readable is Computed<Value> {
    return '_read' in readable
}

type StoreKey = State<unknown> | Computed<unknown> | Effect<unknown, unknown[], unknown>
export function createStore(): Store {
    const data = new WeakMap<StoreKey, unknown>();

    const set: Setter = function set<Value, Args extends unknown[], ReturnValue>(
        state: State<Value> | Effect<unknown, Args, ReturnValue>,
        ...args: [Value] | Args
    ): undefined | ReturnValue {
        if ('_write' in state) {
            return state._write(get, set, ...args as Args);
        }

        const value = args[0] as Value;
        data.set(state, value);
    }

    const get: Getter = function get<Value>(readable: Readable<Value>): Value {
        if (canReadAsCompute(readable)) {
            return readable._read(get);
        }

        if (data.has(readable)) {
            return data.get(readable) as Value;
        }

        return readable._initialValue;
    }

    return {
        set,
        get
    }
}
