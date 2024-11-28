import { Atom, Effect, Getter, Computed } from "../typing/atom";
const EMPTY_MAP = new Map<Atom<unknown>, number>();

interface AtomState<T> {
    mounted?: Mounted,
    value?: T,
    dependencies?: Map<Atom<unknown>, number>,
    epoch?: number,
    abortController?: AbortController
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

    private shouldReculate = <Value>(atom: Atom<Value>, ignoreMounted: boolean): boolean => {
        const atomState = this.atomStateMap.get(atom) as AtomState<Value> | undefined
        if (!atomState) {
            return true;
        }

        if (atomState.mounted && !ignoreMounted) {
            return false;
        }

        if (
            'value' in atomState &&
            Array.from(atomState.dependencies ?? new Map<Atom<unknown>, number>()).every(
                ([a, n]) =>
                    this.readAtomState(a).epoch === n
            )
        ) {
            return false;
        }

        return true;
    }

    private readComputedAtomState<Value>(atom: Computed<Value>, ignoreMounted = false): AtomState<Value> {
        if (!this.shouldReculate(atom, ignoreMounted)) {
            return this.atomStateMap.get(atom) as AtomState<Value>;
        }

        const self: Computed<Value> = atom;
        let atomState: AtomState<Value> | undefined = this.atomStateMap.get(self) as AtomState<Value> | undefined
        if (!atomState) {
            atomState = {
                dependencies: new Map<Atom<unknown>, number>(),
                epoch: -1,
                abortController: new AbortController(),
            }
            this.atomStateMap.set(self, atomState)
        } else {
            atomState.abortController?.abort(`abort ${self.debugLabel ?? 'anonymous'} atom`)
            atomState.abortController = new AbortController()
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

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const signal: AbortSignal = atomState.abortController!.signal

        const ret = self.read(wrappedGet, { signal });
        if (atomState.value !== ret) {
            atomState.value = ret;
            atomState.epoch = (atomState.epoch ?? 0) + 1;
        }

        return atomState;
    }

    public readAtomState<Value>(atom: Atom<Value>, ignoreMounted = false): AtomState<Value> {
        if (canReadAsCompute(atom)) {
            return this.readComputedAtomState(atom, ignoreMounted)
        }

        // return value for simple state
        const atomState = this.atomStateMap.get(atom);
        if (!atomState) {
            const initState = {
                value: atom.init,
                epoch: 0,
            }
            this.atomStateMap.set(atom, initState)
            return initState
        }
        return atomState as AtomState<Value>
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
