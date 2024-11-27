import { Atom, Effect, Getter, State, Updater, Setter } from "../typing/atom";
import { Store, Subscribe } from "../typing/store";
import { computed } from "./atom";
import { AtomManager, ListenerManager } from "./atom-manager";

export class StoreImpl implements Store {
    constructor(protected readonly atomManager: AtomManager, protected readonly listenerManager: ListenerManager) { }

    get: Getter = <Value>(atom: Atom<Value>): Value => {
        return this.atomManager.readAtomState(atom).value as Value
    }

    set: Setter = <Value, Args extends unknown[]>(
        atom: State<Value> | Effect<Value, Args>,
        ...args: [Value | Updater<Value>] | Args
    ): undefined | Value => {
        if ('write' in atom) {
            return atom.write(this.get, this.set, ...args as Args);
        }

        if ('read' in atom) {
            return;
        }

        const newValue = typeof args[0] === 'function' ? (args[0] as Updater<Value>)(
            this.atomManager.readAtomState(atom).value as Value
        ) : args[0] as Value;

        if (!this.atomManager.inited(atom)) {
            this.atomManager.readAtomState(atom).value = newValue;
            this.listenerManager.markPendingListeners(this.atomManager, atom)
            return
        }
        const atomState = this.atomManager.readAtomState(atom)
        atomState.value = newValue;
        atomState.epoch = (atomState.epoch ?? 0) + 1;
        this.listenerManager.markPendingListeners(this.atomManager, atom)
    }

    sub: Subscribe = (atoms: Atom<unknown>[] | Atom<unknown>, cbEffect: Effect<unknown, unknown[]>): () => void => {
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

        const mounted = this.atomManager.mount(atom);
        mounted.listeners.add(cbEffect);

        unsubscribes.add(() => {
            mounted.listeners.delete(cbEffect);

            if (mounted.readDepcs?.size === 0) {
                if (mounted.listeners.size !== 0) {
                    throw new Error('Mounted state has no deps but listeners');
                }
                this.atomManager.unmount(atom);
            }
        })

        return () => {
            for (const unsubscribe of unsubscribes) {
                unsubscribe();
            }
        }
    }

    flush: () => void = () => {
        for (const listener of this.listenerManager.flush()) {
            listener.write(this.get, this.set)
        }
    }
}

export function createStore(): Store {
    const atomManager = new AtomManager()
    const listenerManager = new ListenerManager()

    return new StoreImpl(atomManager, listenerManager)
}
