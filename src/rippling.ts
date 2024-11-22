import { Atom, Action, Getter, Read, Readable, Compute, Setter, Store, Write } from "./typing";

export function atom<Value>(initialValue: Value): Atom<Value> {
    return { _initialValue: initialValue }
}

export function compute<Value>(read: Read<Value>): Compute<Value> {
    return { _read: read }
}

export function action<Value, Args extends unknown[]>(write: Write<Args, Value>): Action<Value, Args, Value> {
    const internalValue = atom<{
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
                throw new Error('Action is not inited');
            }
            return value.value;
        }
    }
}

function canReadAsCompute<Value>(readable: Readable<Value>): readable is Compute<Value> {
    return '_read' in readable
}

type StoreKey = Atom<unknown> | Compute<unknown> | Action<unknown, unknown[], unknown>
export function createStore(): Store {
    const data = new WeakMap<StoreKey, unknown>();

    const set: Setter = function set<Value, Args extends unknown[], ReturnValue>(
        atom: Atom<Value> | Action<unknown, Args, ReturnValue>,
        ...args: [Value] | Args
    ): undefined | ReturnValue {
        if ('_write' in atom) {
            return atom._write(get, set, ...args as Args);
        }

        const value = args[0] as Value;
        data.set(atom, value);
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
