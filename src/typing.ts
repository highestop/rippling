
export interface Atom<Value> {
    _initialValue: Value;
}

export interface Compute<Value> {
    _read: Read<Value>;
}

export type Readable<Value> = Atom<Value> | Compute<Value> | Action<Value, unknown[], unknown>

export type Getter = <Value>(readable: Readable<Value>) => Value;

export interface Setter {
    <Value>(atom: Atom<Value>, value: Value): void;
    <Args extends unknown[], ReturnValue>(drip: Action<unknown, Args, ReturnValue>, ...args: Args): ReturnValue;
}

export interface Action<Value, Args extends unknown[], Return> {
    _read: Read<Value>;
    _write: Write<Args, Return>;
}

export type Read<Value> = (get: Getter) => Value;
export type Write<Args extends unknown[], Return> = (get: Getter, set: Setter, ...args: Args) => Return;

export interface Store {
    get: Getter;
    set: Setter;
}
