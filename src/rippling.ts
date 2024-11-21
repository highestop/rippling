import { Atom, Drip, Getter, Read, Readable, Ripple, Setter, Store, Write } from "./typing";

export function atom<Value>(initialValue: Value): Atom<Value> {
    return { _initialValue: initialValue }
}

export function ripple<Value>(read: Read<Value>): Ripple<Value> {
    return { _read: read }
}

export function drip<Args extends unknown[], Return>(write: Write<Args, Return>): Drip<null, Args, Return>;
export function drip<Value, Args extends unknown[], Return>(read: Read<Value>, write: Write<Args, Return>): Drip<Value, Args, Return>;
export function drip<Value, Args extends unknown[], Return>(prop1: Read<Value> | Write<Args, Return>, prop2?: Write<Args, Return>) {
    if (prop2 === undefined) {
        return {
            _write: prop1 as Write<Args, Return>
        }
    }
    return { _read: prop1 as Read<Value>, _write: prop2 }
}

function isRipple<Value>(readable: Readable<Value>): readable is Ripple<Value> {
    return '_read' in readable && readable._read !== undefined
}

type StoreKey = Atom<unknown> | Ripple<unknown> | Drip<unknown, unknown[], unknown>
export function createStore(): Store {
    const data = new WeakMap<StoreKey, unknown>();

    const set: Setter = function set<Value, Args extends unknown[], ReturnValue>(
        atom: Atom<Value> | Drip<unknown, Args, ReturnValue>,
        ...args: [Value] | Args
    ): undefined | ReturnValue {
        if ('_write' in atom) {
            return atom._write(get, set, ...args as Args);
        }

        const value = args[0] as Value;
        data.set(atom, value);
    }

    const get: Getter = function get<Value>(readable: Readable<Value>): Value {
        if (isRipple(readable)) {
            return readable._read(get);
        }

        if ('_write' in readable) {
            throw new Error('Cannot get value of a drip without read function')
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
