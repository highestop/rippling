export type Updater<Value> = (current: Value) => Value;
export interface Setter {
    <Value>(state: State<Value>, value: Value | Updater<Value>): void;
    <Value, Args extends unknown[]>(effect: Effect<Value, Args>, ...args: Args): Value;
}
export type Getter = <Value>(readable: ReadableAtom<Value>) => Value;
export interface GetterOptions { signal: AbortSignal }
export type Read<Value> = (get: Getter, options: GetterOptions) => Value;
export type Write<Value, Args extends unknown[]> = (get: Getter, set: Setter, ...args: Args) => Value;

export interface State<Value> {
    init: Value;
    debugLabel?: string;
}
export interface Computed<Value> {
    read: Read<Value>;
    debugLabel?: string;
}
export interface Effect<Value, Args extends unknown[]> {
    write: Write<Value, Args>;
    debugLabel?: string;
}

export type ReadableAtom<Value> = State<Value> | Computed<Value>
export type WritableAtom<Value> = State<Value> | Effect<Value, unknown[]>
