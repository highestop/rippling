
export interface State<Value> {
    init: Value;
    debugLabel?: string;
}

export interface Computed<Value> {
    read: Read<Value>;
    debugLabel?: string;
}

export type Atom<Value> = State<Value> | Computed<Value> | Effect<Value, unknown[]>

export type Getter = <Value>(readable: Atom<Value>) => Value;

export type ValueUpdater<Value> = (current: Value) => Value;

export interface Setter {
    <Value>(state: State<Value>, value: Value | ValueUpdater<Value>): void;
    <Value, Args extends unknown[]>(effect: Effect<Value, Args>, ...args: Args): Value;
}

export interface Effect<Value, Args extends unknown[]> {
    read: Read<Value>;
    write: Write<Value, Args>;
    debugLabel?: string;
}

export type Read<Value> = (get: Getter) => Value;
export type Write<Value, Args extends unknown[]> = (get: Getter, set: Setter, ...args: Args) => Value;
export type Subscribe = (atoms: Atom<unknown>[] | Atom<unknown>, cbEffect: Effect<unknown, unknown[]>) => () => void;

export type NestedString = (string | NestedString)[];

export interface Store {
    get: Getter;
    set: Setter;
    sub: Subscribe;
    flush: () => void;
    printReadDependencies: (atom: Atom<unknown>) => NestedString;
    printMountGraph: (atom: Atom<unknown>) => NestedString
}
