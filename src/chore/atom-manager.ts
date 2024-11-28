import { Atom, Effect, Getter, Computed } from "../typing/atom";
const EMPTY_MAP = new Map<Atom<unknown>, number>();

interface AtomState<T> {
    mounted?: Mounted,
    value?: T,
    dependencies?: Map<Atom<unknown>, number>,
    epoch?: number,
}

interface Mounted {
    listeners: Set<Effect<unknown, []>>,
    readDepcs?: Map<Atom<unknown>, number>,
    readDepts: Set<Atom<unknown>>,
}

function canReadAsCompute<Value>(atom: Atom<Value>): atom is Computed<Value> {
    return 'read' in atom
}

export class AtomManager {
    private atomStateMap = new WeakMap<Atom<unknown>, AtomState<unknown>>()

    public readAtomState<Value>(atom: Atom<Value>, ignoreMounted = false): AtomState<Value> {
        if (canReadAsCompute(atom)) {
            const self: Computed<Value> = atom;

            if (!this.atomStateMap.has(self)) {
                this.atomStateMap.set(self, {
                    dependencies: new Map<Atom<unknown>, number>(),
                    epoch: 0,
                })
            }

            const atomState = this.atomStateMap.get(self) as AtomState<Value> | undefined;
            if (!atomState) {
                throw new Error('Internal state not found');
            }

            if (atomState.mounted && !ignoreMounted) {
                return atomState;
            }

            if (
                'value' in atomState &&
                Array.from(atomState.dependencies ?? new Map<Atom<unknown>, number>()).every(
                    ([a, n]) =>
                        this.readAtomState(a).epoch === n
                )
            ) {
                return atomState;
            }

            const lastDeps = atomState.dependencies ?? EMPTY_MAP;
            const readDeps = new Map<Atom<unknown>, number>();
            atomState.dependencies = readDeps;

            const wrappedGet: Getter = (other) => {
                const otherState = this.readAtomState(other);

                // get 可能发生在异步过程中，当重复调用时，只有最新的 get 过程会修改 deps
                if (atomState.dependencies === readDeps) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    readDeps.set(other, otherState.epoch!);

                    if (atomState.mounted && !otherState.mounted) {
                        this.mount(other).readDepts.add(self)
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
                    const otherState = this.atomStateMap.get(key)
                    if (otherState?.mounted) {
                        otherState.mounted.readDepts.delete(self)
                    }
                }
            }

            const ret = self.read(wrappedGet);
            if (atomState.value !== ret) {
                atomState.value = ret;
                atomState.epoch = (atomState.epoch ?? 0) + 1;
            }

            return atomState;
        }

        // return value for simple state
        const atomState = this.atomStateMap.get(atom);
        if (!atomState) {
            this.atomStateMap.set(atom, {
                value: atom.init,
                epoch: 0,
            })
        }
        return this.atomStateMap.get(atom) as AtomState<Value>;
    }

    public mount<Value>(atom: Atom<Value>): Mounted {
        const atomState = this.readAtomState(atom);

        atomState.mounted = atomState.mounted ?? {
            listeners: new Set(),
            readDepcs: atomState.dependencies,
            readDepts: new Set(),
        }

        for (const [dep] of Array.from(atomState.mounted.readDepcs ?? EMPTY_MAP)) {
            const mounted = this.mount(dep)
            mounted.readDepts.add(atom)
        }

        return atomState.mounted
    }

    public unmount<Value>(atom: Atom<Value>): void {
        // TODO: cleanup depcs's mounted state
        const internalState = this.atomStateMap.get(atom);
        if (internalState) {
            internalState.mounted = undefined;
        }
    }

    public inited(atom: Atom<unknown>) {
        return this.atomStateMap.has(atom)
    }
}

export class ListenerManager {
    private pendingListeners = new Set<Effect<unknown, []>>();

    markPendingListeners(atomManager: AtomManager, atom: Atom<unknown>) {
        const atomState = atomManager.readAtomState(atom, true)

        for (const listener of atomState.mounted?.listeners ?? []) {
            this.pendingListeners.add(listener)
        }

        for (const dep of Array.from(atomState.mounted?.readDepts ?? [])) {
            this.markPendingListeners(atomManager, dep)
        }
    }

    _debugGetPendingListeners = (): Effect<unknown, []>[] => {
        return Array.from(this.pendingListeners)
    }

    *flush(): Generator<Effect<unknown, []>, void, unknown> {
        const pendingListeners = this.pendingListeners
        this.pendingListeners = new Set()

        for (const listener of pendingListeners) {
            yield listener
        }
    }
}
