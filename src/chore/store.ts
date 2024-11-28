import { Atom, Effect, Getter, State, Updater, Setter } from "../typing/atom";
import { Store } from "../typing/store";
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

    private _subSingleAtom(atom: Atom<unknown>, cbEffect: Effect<unknown, unknown[]>): () => void {
        const mounted = this.atomManager.mount(atom);
        mounted.listeners.add(cbEffect);

        return () => {
            mounted.listeners.delete(cbEffect);

            if (mounted.readDepts.size === 0 && mounted.listeners.size === 0) {
                this.atomManager.unmount(atom);
            }
        }
    }

    sub(atoms: Atom<unknown>[] | Atom<unknown>, cbEffect: Effect<unknown, unknown[]>): () => void {
        if (Array.isArray(atoms) && atoms.length === 0) {
            return () => void (0);
        }

        if (Array.isArray(atoms) && atoms.length === 1) {
            return this._subSingleAtom(atoms[0], cbEffect)
        } else if (!Array.isArray(atoms)) {
            return this._subSingleAtom(atoms, cbEffect)
        }

        const unsubscribes = new Set<() => void>();
        atoms.forEach((atom) => {
            unsubscribes.add(this._subSingleAtom(atom, cbEffect))
        })

        return () => {
            for (const unsubscribe of unsubscribes) {
                unsubscribe();
            }
        }
    }

    notify: () => void = () => {
        for (const listener of this.listenerManager.notify()) {
            listener.write(this.get, this.set)
        }
    }
}

export function createStore(): Store {
    const atomManager = new AtomManager()
    const listenerManager = new ListenerManager()

    return new StoreImpl(atomManager, listenerManager)
}
