import { Atom, Effect, Getter, Read, Readable, Compute, Setter, Store, Write } from "./typing";

export function atom<Value>(initialValue: Value): Atom<Value> {
    return { _initialValue: initialValue }
}

export function compute<Value>(read: Read<Value>): Compute<Value> {
    return { _read: read }
}

export function effect<Args extends unknown[], Return>(write: Write<Args, Return>): Effect<null, Args, Return>;
export function effect<Value, Args extends unknown[], Return>(read: Read<Value>, write: Write<Args, Return>): Effect<Value, Args, Return>;
export function effect<Value, Args extends unknown[], Return>(prop1: Read<Value> | Write<Args, Return>, prop2?: Write<Args, Return>) {
    if (prop2 === undefined) {
        return {
            _write: prop1 as Write<Args, Return>
        }
    }
    return { _read: prop1 as Read<Value>, _write: prop2 }
}

function isEffect<Value>(readable: Readable<Value>): readable is Compute<Value> {
    return '_read' in readable && readable._read !== undefined
}

type StoreKey = Atom<unknown> | Compute<unknown> | Effect<unknown, unknown[], unknown>
export function createStore(): Store {
    const data = new WeakMap<StoreKey, unknown>();

    const set: Setter = function set<Value, Args extends unknown[], ReturnValue>(
        atom: Atom<Value> | Effect<unknown, Args, ReturnValue>,
        ...args: [Value] | Args
    ): undefined | ReturnValue {
        if ('_write' in atom) {
            return atom._write(get, set, ...args as Args);
        }

        const value = args[0] as Value;
        data.set(atom, value);
    }

    const get: Getter = function get<Value>(readable: Readable<Value>): Value {
        if (isEffect(readable)) {
            return readable._read(get);
        }

        if ('_write' in readable) {
            throw new Error('Cannot get value of an effect without read function')
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
