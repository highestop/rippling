import { State, Effect, Getter, Read, Atom, Computed, Setter, Store, Write, Subscribe, NestedString, ValueUpdater } from "./typing";

const EMPTY_MAP = new Map<AnyAtom, number>();

interface Options {
    debugLabel?: string;
}

export function state<Value>(initialValue: Value, options?: Options): State<Value> {
    const ret: State<Value> = { init: initialValue };
    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }
    return ret;
}

export function computed<Value>(read: Read<Value>, options?: Options): Computed<Value> {
    const ret: Computed<Value> = { read: read };
    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }
    return ret;
}

export function effect<Value, Args extends unknown[]>(write: Write<Value, Args>, options?: Options): Effect<Value, Args> {
    const internalLabelOptions: Options = {}
    if (options?.debugLabel) {
        internalLabelOptions.debugLabel = options.debugLabel + '_effectResult';
    }
    const internalValue = state<{
        value: Value,
        inited: true,
    } | {
        inited: false
    }>({
        inited: false
    }, internalLabelOptions);

    const ret: Effect<Value, Args> = {
        write: (get, set, ...args) => {
            const ret = write(get, set, ...args);
            set(internalValue, {
                value: ret,
                inited: true,
            });
            return ret;
        },
        read: (get) => {
            const value = get(internalValue);
            if (!value.inited) {
                throw new Error('Effect is not inited');
            }
            return value.value;
        }
    }

    if (options?.debugLabel) {
        ret.debugLabel = options.debugLabel;
    }

    return ret;
}

function canReadAsCompute<Value>(atom: Atom<Value>): atom is Computed<Value> {
    return 'read' in atom
}

type AnyAtom = State<unknown> | Computed<unknown> | Effect<unknown, unknown[]>

interface Mounted {
    listeners: Set<Effect<unknown, unknown[]>>,
    readDepcs?: Map<AnyAtom, number>, // only valid for computed
    readDepts: Set<AnyAtom>,
}

interface AtomState<T> {
    mounted?: Mounted,
    value?: T,
    dependencies?: Map<AnyAtom, number>,
    epoch?: number,
}

export function createStore(): Store {
    const atomStateMap = new WeakMap<AnyAtom, AtomState<unknown>>();
    const pendingListeners = new Set<Effect<unknown, unknown[]>>();

    function markPendingListeners(key: AnyAtom) {
        const atomState = atomStateMap.get(key);
        if (!atomState) {
            return;
        }

        const mounted = atomState.mounted
        if (!mounted) {
            return;
        }

        for (const listener of mounted.listeners) {
            pendingListeners.add(listener)
        }

        // refresh depcs & depts
        readAtomState(key)

        for (const dep of Array.from(mounted.readDepts)) {
            markPendingListeners(dep)
        }
    }

    const set: Setter = function set<Value, Args extends unknown[]>(
        state: State<Value> | Effect<Value, Args>,
        ...args: [Value | ValueUpdater<Value>] | Args
    ): undefined | Value {
        if ('write' in state) {
            return state.write(get, set, ...args as Args);
        }

        if ('read' in state) {
            return;
        }

        const newValue = typeof args[0] === 'function' ? (args[0] as ValueUpdater<Value>)(
            atomStateMap.get(state)?.value as Value ?? state.init
        ) : args[0];

        const self = state;
        if (!atomStateMap.has(self)) {
            atomStateMap.set(self, {
                epoch: 0,
                value: newValue,
            })
            markPendingListeners(self)
            return
        }

        const atomState = atomStateMap.get(self);
        if (!atomState) {
            throw new Error('Internal state not found');
        }

        atomState.value = newValue;
        atomState.epoch = (atomState.epoch ?? 0) + 1;
        markPendingListeners(self)
    }

    function readAtomState<Value>(atom: Atom<Value>): AtomState<Value> {
        if (canReadAsCompute(atom)) {
            const self = atom;

            if (!atomStateMap.has(self)) {
                atomStateMap.set(self, {
                    dependencies: new Map<AnyAtom, number>(),
                    epoch: 0,
                })
            }

            const atomState = atomStateMap.get(self) as AtomState<Value> | undefined;
            if (!atomState) {
                throw new Error('Internal state not found');
            }

            if (
                'value' in atomState &&
                Array.from(atomState.dependencies ?? new Map<AnyAtom, number>()).every(
                    ([a, n]) =>
                        readAtomState(a).epoch === n
                )
            ) {
                return atomState;
            }

            const lastDeps = atomState.dependencies ?? EMPTY_MAP;
            const readDeps = new Map<AnyAtom, number>();
            atomState.dependencies = readDeps;

            const wrappedGet: Getter = (other) => {
                const otherState = readAtomState(other);

                // get 可能发生在异步过程中，当重复调用时，只有最新的 get 过程会修改 deps
                if (atomState.dependencies === readDeps) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    readDeps.set(other, otherState.epoch!);

                    if (atomState.mounted && !otherState.mounted) {
                        mount(other).readDepts.add(self)
                    } else if (otherState.mounted) {
                        otherState.mounted.readDepts.add(self)
                    }
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return otherState.value!;
            }

            const newKeys = new Set(readDeps.keys())
            for (const key of lastDeps.keys()) {
                if (!newKeys.has(key)) {
                    const otherState = atomStateMap.get(key)
                    if (otherState?.mounted) {
                        otherState.mounted.readDepts.delete(self)
                    }
                }
            }

            const ret = atom.read(wrappedGet);
            if (atomState.value !== ret) {
                atomState.value = ret;
                atomState.epoch = (atomState.epoch ?? 0) + 1;
            }

            return atomState;
        }

        // return value for simple state
        const atomState = atomStateMap.get(atom);
        if (!atomState) {
            atomStateMap.set(atom, {
                value: atom.init,
                epoch: 0,
            })
        }
        return atomStateMap.get(atom) as AtomState<Value>;
    }

    const get: Getter = function get<Value>(atom: Atom<Value>): Value {
        return readAtomState(atom).value as Value;
    }

    function mount(atom: AnyAtom): Mounted {
        get(atom);
        const atomState = atomStateMap.get(atom);
        if (!atomState) {
            throw new Error('Internal state not found');
        }

        atomState.mounted = atomState.mounted ?? {
            listeners: new Set(),
            readDepcs: atomState.dependencies,
            readDepts: new Set(),
        }

        for (const [dep] of Array.from(atomState.mounted.readDepcs ?? EMPTY_MAP)) {
            const mounted = mount(dep)
            mounted.readDepts.add(atom)
        }

        return atomState.mounted
    }

    function unmount(atom: AnyAtom) {
        const internalState = atomStateMap.get(atom);
        if (internalState) {
            internalState.mounted = undefined;
        }
    }

    const sub: Subscribe = function sub(atoms: Atom<unknown>[] | Atom<unknown>, cbEffect: Effect<unknown, unknown[]>) {
        const unsubscribes = new Set<() => void>();

        if (Array.isArray(atoms) && atoms.length === 0) {
            return () => void (0);
        }

        let atom: Atom<unknown>;
        if (Array.isArray(atoms) && atoms.length === 1) {
            atom = atoms[0];
        } else if (Array.isArray(atoms)) {
            atom = computed((get) => {
                for (const atom of atoms) {
                    get(atom);
                }
            })
        } else {
            atom = atoms;
        }

        const mounted = mount(atom);
        mounted.listeners.add(cbEffect);

        unsubscribes.add(() => {
            mounted.listeners.delete(cbEffect);

            if (mounted.readDepcs?.size === 0) {
                if (mounted.listeners.size !== 0) {
                    throw new Error('Mounted state has no deps but listeners');
                }
                unmount(atom);
            }
        })

        return () => {
            for (const unsubscribe of unsubscribes) {
                unsubscribe();
            }
        }
    }

    function flush() {
        for (const listener of pendingListeners) {
            listener.write(get, set)
            pendingListeners.delete(listener)
        }
    }

    function printReadDependencies(key: Atom<unknown>): NestedString {
        const label = key.debugLabel ?? 'anonymous';
        const atomState = readAtomState(key);

        return [label, ...Array.from(atomState.dependencies ?? EMPTY_MAP).map(([key]) => {
            return printReadDependencies(key);
        })] as NestedString[];
    }

    function printMountGraph(key: Atom<unknown>): NestedString {
        const label = key.debugLabel ?? 'anonymous';
        const atomState = readAtomState(key);
        return [label, ...Array.from(atomState.mounted?.readDepts ?? []).map((key) => printMountGraph(key))] as NestedString[];
    }

    return {
        set,
        get,
        sub,
        flush,
        printReadDependencies,
        printMountGraph,
    }
}
