
export interface State<Value> {
    _initialValue: Value;
}

export interface Computed<Value> {
    _read: Read<Value>;
}

export type Readable<Value> = State<Value> | Computed<Value> | Effect<Value, unknown[], unknown>

export type Getter = <Value>(readable: Readable<Value>) => Value;

export interface Setter {
    <Value>(state: State<Value>, value: Value): void;
    <Args extends unknown[], ReturnValue>(drip: Effect<unknown, Args, ReturnValue>, ...args: Args): ReturnValue;
}

export interface Effect<Value, Args extends unknown[], Return> {
    _read: Read<Value>;
    _write: Write<Args, Return>;
}

export type Read<Value> = (get: Getter) => Value;
export type Write<Args extends unknown[], Return> = (get: Getter, set: Setter, ...args: Args) => Return;

export interface Store {
    get: Getter;
    set: Setter;
}
