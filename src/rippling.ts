import { State, Effect, Getter, Read, Readable, Computed, Setter, Store, Write, Subscribe } from "./typing";

const EMPTY_SET = new Set<AnyAtom>();

interface Options {
    debugLabel?: string;
}

export function state<Value>(initialValue: Value, options?: Options): State<Value> {
    return { _initialValue: initialValue, _debugLabel: options?.debugLabel }
}

export function computed<Value>(read: Read<Value>, options?: Options): Computed<Value> {
    return { _read: read, _debugLabel: options?.debugLabel }
}

export function effect<Value, Args extends unknown[]>(write: Write<Value, Args>, options?: Options): Effect<Value, Args> {
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
        },
        _debugLabel: options?.debugLabel,
    }
}

function canReadAsCompute<Value>(readable: Readable<Value>): readable is Computed<Value> {
    return '_read' in readable
}

type AnyAtom = State<unknown> | Computed<unknown> | Effect<unknown, unknown[]>

interface Mounted {
    listeners: Set<Effect<unknown, unknown[]>>,
    readDepcs: Set<AnyAtom>,
    readDepts: Set<AnyAtom>,
}

interface AtomState {
    readDeps: Set<AnyAtom>,
    mounted?: Mounted,
}

export function createStore(): Store {
    const atomValue = new WeakMap<AnyAtom, unknown>();
    const atomState = new WeakMap<AnyAtom, AtomState>();

    const pendingListeners = new Set<Effect<unknown, unknown[]>>();

    function markDirty(key: AnyAtom) {
        const mounted = atomState.get(key)?.mounted
        if (!mounted) {
            return;
        }
        for (const listener of mounted.listeners) {
            pendingListeners.add(listener)
        }

        for (const dep of mounted.readDepts) {
            markDirty(dep)
        }
    }

    const set: Setter = function set<Value, Args extends unknown[]>(
        state: State<Value> | Effect<Value, Args>,
        ...args: [Value] | Args
    ): undefined | Value {
        if ('_write' in state) {
            return state._write(get, set, ...args as Args);
        }

        markDirty(state)

        const value = args[0] as Value;
        atomValue.set(state, value);
    }

    const get: Getter = function get<Value>(readable: Readable<Value>): Value {
        if (canReadAsCompute(readable)) {
            const readDeps = new Set<AnyAtom>();
            if (!atomState.has(readable)) {
                atomState.set(readable, {
                    readDeps
                })
            }
            const internalState = atomState.get(readable);
            if (!internalState) {
                throw new Error('Internal state not found');
            }
            internalState.readDeps = readDeps;

            const wrappedGet: Getter = (other) => {
                readDeps.add(other);
                return get(other)
            }
            const ret = readable._read(wrappedGet);
            return ret;
        }

        const internalState = atomState.get(readable);
        if (!internalState) {
            atomState.set(readable, {
                readDeps: EMPTY_SET,
            })
        }

        if (atomValue.has(readable)) {
            return atomValue.get(readable) as Value;
        }

        return readable._initialValue;
    }

    function mount(readable: AnyAtom): Mounted {
        get(readable);
        const internalState = atomState.get(readable);
        if (!internalState) {
            throw new Error('Internal state not found');
        }

        internalState.mounted = internalState.mounted ?? {
            listeners: new Set(),
            readDepcs: internalState.readDeps,
            readDepts: new Set(),
        }

        for (const dep of internalState.mounted.readDepcs) {
            const mounted = mount(dep)
            mounted.readDepts.add(readable)
        }

        return internalState.mounted
    }

    function unmount(readable: AnyAtom) {
        const internalState = atomState.get(readable);
        if (internalState) {
            internalState.mounted = undefined;
        }
    }

    const sub: Subscribe = function sub(readables: Readable<unknown>[], cbEffect: Effect<unknown, unknown[]>) {
        const unsubscribes = new Set<() => void>();
        for (const readable of readables) {
            const mounted = mount(readable);
            mounted.listeners.add(cbEffect);
            mounted.readDepts.add(cbEffect);
            unsubscribes.add(() => {
                mounted.listeners.delete(cbEffect);
                mounted.readDepts.delete(cbEffect);

                if (mounted.readDepcs.size === 0) {
                    if (mounted.listeners.size !== 0) {
                        throw new Error('Mounted state has no deps but listeners');
                    }
                    unmount(readable);
                }
            })
        }

        return () => {
            for (const unsubscribe of unsubscribes) {
                unsubscribe();
            }
        }
    }

    function flush() {
        for (const listener of pendingListeners) {
            listener._write(get, set)
            pendingListeners.delete(listener)
        }
    }

    return {
        set,
        get,
        sub,
        flush,
        printReadDeps: (readable: Readable<unknown>) => {
            get(readable)
            const internalState = atomState.get(readable);
            if (!internalState) {
                throw new Error('Internal state not found');
            }

            return Array.from(internalState.readDeps).map(key => key._debugLabel ?? 'anonymous');
        }
    }
}
