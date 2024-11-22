import { State, Effect, Getter, Read, Readable, Computed, Setter, Store, Write, Subscribe } from "./typing";

export function state<Value>(initialValue: Value): State<Value> {
    return { _initialValue: initialValue }
}

export function computed<Value>(read: Read<Value>): Computed<Value> {
    return { _read: read }
}

export function effect<Value, Args extends unknown[]>(write: Write<Value, Args>): Effect<Value, Args> {
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

type StoreKey = State<unknown> | Computed<unknown> | Effect<unknown, unknown[]>
export function createStore(): Store {
    const data = new WeakMap<StoreKey, unknown>();
    const subscriptions = new Map<StoreKey, Set<Effect<unknown, unknown[]>>>();
    const dirtySubscriptions = new Set<StoreKey>();

    const set: Setter = function set<Value, Args extends unknown[]>(
        state: State<Value> | Effect<Value, Args>,
        ...args: [Value] | Args
    ): undefined | Value {
        if ('_write' in state) {
            return state._write(get, set, ...args as Args);
        }

        if (subscriptions.has(state)) {
            subscriptions.get(state)?.forEach(dirty => {
                dirtySubscriptions.add(dirty)
            })
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

    const sub: Subscribe = function sub(readables: Readable<unknown>[], cbEffect: Effect<unknown, unknown[]>) {
        for (const readable of readables) {
            if (!subscriptions.has(readable)) {
                subscriptions.set(readable, new Set())
            }
            subscriptions.get(readable)?.add(cbEffect)
        }
        return () => {
            for (const readable of readables) {
                subscriptions.get(readable)?.delete(cbEffect)
                if (subscriptions.get(readable)?.size === 0) {
                    subscriptions.delete(readable)
                }
            }
        }
    }

    function flush() {
        for (const key of dirtySubscriptions) {
            if ('_write' in key) {
                dirtySubscriptions.delete(key)
                key._write(get, set)
                return;
            }
        }
    }

    return {
        set,
        get,
        sub,
        flush
    }
}
