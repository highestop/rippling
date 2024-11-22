
export interface State<Value> {
    _initialValue: Value;
    _debugLabel?: string;
}

export interface Computed<Value> {
    _read: Read<Value>;
    _debugLabel?: string;
}

export type Readable<Value> = State<Value> | Computed<Value> | Effect<Value, unknown[]>

export type Getter = <Value>(readable: Readable<Value>) => Value;

export interface Setter {
    <Value>(state: State<Value>, value: Value): void;
    <Value, Args extends unknown[]>(effect: Effect<Value, Args>, ...args: Args): Value;
}

export interface Effect<Value, Args extends unknown[]> {
    _read: Read<Value>;
    _write: Write<Value, Args>;
    _debugLabel?: string;
}

export type Read<Value> = (get: Getter) => Value;
export type Write<Value, Args extends unknown[]> = (get: Getter, set: Setter, ...args: Args) => Value;
export type Subscribe = (readables: Readable<unknown>[], cbEffect: Effect<unknown, unknown[]>) => () => void;

export interface Store {
    get: Getter;
    set: Setter;
    sub: Subscribe;
    flush: () => void;
    printReadDeps: (readable: Readable<unknown>) => string[];
}
