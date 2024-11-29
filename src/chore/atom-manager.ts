import { ReadableAtom, Effect, Getter, Computed, State } from "../typing/atom";
const EMPTY_MAP = new Map<ReadableAtom<unknown>, number>();

export interface StateState<Value> {
    mounted?: Mounted,
    value: Value,
    epoch: number,
}

export interface ComputedState<Value> {
    mounted?: Mounted,
    value: Value,
    dependencies: Map<ReadableAtom<unknown>, number>,
    epoch: number,
    abortController?: AbortController
}

type CommonReadableState<Value> = {
    [K in keyof StateState<Value> & keyof ComputedState<Value>]: StateState<Value>[K]
}

type AtomState<Value> = StateState<Value> | ComputedState<Value>

interface Mounted {
    listeners: Set<Effect<unknown, []>>,
    readDepcs?: Map<ReadableAtom<unknown>, number>,
    readDepts: Set<ReadableAtom<unknown>>,
}

function canReadAsCompute<Value>(atom: ReadableAtom<Value>): atom is Computed<Value> {
    return 'read' in atom
}

export class AtomManager {
    private atomStateMap = new WeakMap<ReadableAtom<unknown>, AtomState<unknown>>()

    private shouldRecalculate = <Value>(atom: ReadableAtom<Value>, ignoreMounted: boolean): boolean => {
        const atomState = this.atomStateMap.get(atom) as AtomState<Value> | undefined
        if (!atomState) {
            return true;
        }

        if (atomState.mounted && !ignoreMounted) {
            return false;
        }

        if (
            'dependencies' in atomState && Array.from(atomState.dependencies).every(([dep, epoch]) => {
                return this.readAtomState(dep).epoch === epoch
            })
        ) {
            return false;
        }

        return true;
    }

    private readComputedAtom<Value>(atom: Computed<Value>, ignoreMounted = false): ComputedState<Value> {
        if (!this.shouldRecalculate(atom, ignoreMounted)) {
            return this.atomStateMap.get(atom) as ComputedState<Value>;
        }

        const self: Computed<Value> = atom;
        let atomState: ComputedState<Value> | undefined = this.atomStateMap.get(self) as ComputedState<Value> | undefined
        if (!atomState) {
            atomState = {
                dependencies: new Map<ReadableAtom<unknown>, number>(),
                epoch: -1,
            } as ComputedState<Value>
            this.atomStateMap.set(self, atomState)
        }

        const lastDeps = atomState.dependencies;
        const readDeps = new Map<ReadableAtom<unknown>, number>();
        atomState.dependencies = readDeps;
        const wrappedGet: Getter = (depAtom) => {
            const depState = this.readAtomState(depAtom)

            // get 可能发生在异步过程中，当重复调用时，只有最新的 get 过程会修改 deps
            if (atomState.dependencies === readDeps) {
                readDeps.set(depAtom, depState.epoch);

                if (atomState.mounted && !depState.mounted) {
                    this.mount(depAtom).readDepts.add(self)
                } else if (depState.mounted) {
                    depState.mounted.readDepts.add(self)
                }
            }

            return depState.value;
        }


        const ret = self.read(wrappedGet, {
            get signal() {
                atomState.abortController?.abort(`abort ${self.debugLabel ?? 'anonymous'} atom`)
                atomState.abortController = new AbortController()
                return atomState.abortController.signal
            }
        });

        if (atomState.value !== ret) {
            atomState.value = ret;
            atomState.epoch += 1;
        }

        for (const key of lastDeps.keys()) {
            if (!readDeps.has(key)) {
                const otherState = this.atomStateMap.get(key)
                if (otherState?.mounted) {
                    otherState.mounted.readDepts.delete(self)
                }
            }
        }

        return atomState;
    }

    private readStateAtom<Value>(atom: State<Value>): StateState<Value> {
        const atomState = this.atomStateMap.get(atom);
        if (!atomState) {
            const initState = {
                value: atom.init,
                epoch: 0,
            }
            this.atomStateMap.set(atom, initState)
            return initState as StateState<Value>
        }

        return atomState as StateState<Value>
    }

    public readAtomState<Value>(atom: State<Value>, ignoreMounted?: boolean): StateState<Value>;
    public readAtomState<Value>(atom: Computed<Value>, ignoreMounted?: boolean): ComputedState<Value>;
    public readAtomState<Value>(atom: State<Value> | Computed<Value>, ignoreMounted?: boolean): CommonReadableState<Value>;
    public readAtomState<Value>(atom: State<Value> | Computed<Value>, ignoreMounted = false): StateState<Value> | ComputedState<Value> | CommonReadableState<Value> {
        if (canReadAsCompute(atom)) {
            return this.readComputedAtom(atom, ignoreMounted)
        }

        return this.readStateAtom(atom)
    }

    public mount<Value>(atom: ReadableAtom<Value>): Mounted {
        const atomState = this.readAtomState(atom);

        atomState.mounted = atomState.mounted ?? {
            listeners: new Set(),
            readDepts: new Set(),
        }

        if ('dependencies' in atomState) {
            atomState.mounted.readDepcs = (atomState as ComputedState<Value>).dependencies;
        }

        for (const [dep] of Array.from(atomState.mounted.readDepcs ?? EMPTY_MAP)) {
            const mounted = this.mount(dep)
            mounted.readDepts.add(atom)
        }

        return atomState.mounted
    }

    public unmount<Value>(atom: ReadableAtom<Value>): void {
        const atomState = this.atomStateMap.get(atom);
        if (!atomState?.mounted || atomState.mounted.listeners.size) {
            return
        }

        for (const [dep] of Array.from(atomState.mounted.readDepcs ?? EMPTY_MAP)) {
            const depState = this.readAtomState(dep)
            depState.mounted?.readDepts.delete(atom)
        }

        atomState.mounted = undefined;
    }

    public inited(atom: ReadableAtom<unknown>) {
        return this.atomStateMap.has(atom)
    }
}

export class ListenerManager {
    private pendingListeners = new Set<Effect<unknown, []>>();

    markPendingListeners(atomManager: AtomManager, atom: ReadableAtom<unknown>) {

        let queue = new Set([atom])
        while (queue.size > 0) {
            const nextQueue = new Set<ReadableAtom<unknown>>([])
            for (const atom of queue) {
                const atomState = atomManager.readAtomState(atom, true)

                for (const listener of atomState.mounted?.listeners ?? []) {
                    this.pendingListeners.add(listener)
                }

                for (const dep of Array.from(atomState.mounted?.readDepts ?? [])) {
                    nextQueue.add(dep)
                }
            }

            queue = nextQueue
        }
    }

    _debugGetPendingListeners = (): Effect<unknown, []>[] => {
        return Array.from(this.pendingListeners)
    }

    *notify(): Generator<Effect<unknown, []>, void, unknown> {
        const pendingListeners = this.pendingListeners
        this.pendingListeners = new Set()

        for (const listener of pendingListeners) {
            yield listener
        }
    }
}
