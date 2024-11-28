import { Atom, Effect } from "../typing/atom";
import { DebugStore, Subscribe } from "../typing/store";
import { NestedAtom } from "../typing/util";
import { AtomManager, ListenerManager } from "./atom-manager";
import { StoreImpl } from "./store";

class DebugStoreImpl extends StoreImpl implements DebugStore {
    private readonly subscribedAtoms = new Map<Atom<unknown>, number>()

    sub: Subscribe = (atoms: Atom<unknown>[] | Atom<unknown>, cbEffect: Effect<unknown, unknown[]>): () => void => {
        const atomList = Array.isArray(atoms) ? atoms : [atoms]

        atomList.forEach((atom) => {
            this.subscribedAtoms.set(atom, (this.subscribedAtoms.get(atom) ?? 0) + 1)
        })

        const unsub = super.sub(atoms, cbEffect);
        return () => {
            unsub();
            atomList.forEach((atom) => {
                this.subscribedAtoms.set(atom, (this.subscribedAtoms.get(atom) ?? 0) - 1)
                if (this.subscribedAtoms.get(atom) === 0) {
                    this.subscribedAtoms.delete(atom)
                }
            })
        }
    }

    getReadDependencies = (atom: Atom<unknown>): NestedAtom => {
        const atomState = this.atomManager.readAtomState(atom);

        return [atom, ...Array.from(atomState.dependencies ?? new Map<Atom<unknown>, number>()).map(([key]) => {
            return this.getReadDependencies(key);
        })] as NestedAtom;
    }

    getMountGraph = (atom: Atom<unknown>): NestedAtom => {
        const atomState = this.atomManager.readAtomState(atom);
        return [atom, ...Array.from(atomState.mounted?.readDepts ?? []).map((key) =>
            this.getMountGraph(key)
        )] as NestedAtom;
    }

    getPendingListeners = (): NestedAtom => {
        return this.listenerManager._debugGetPendingListeners();
    }

    getSubscribeGraph = (): NestedAtom => {
        return Array.from(this.subscribedAtoms.keys()).map(atom => {
            const atomState = this.atomManager.readAtomState(atom);
            const listeners = Array.from(atomState.mounted?.listeners ?? [])
            return [atom, ...listeners]
        })
    }
}

export function createDebugStore(): DebugStore {
    const atomManager = new AtomManager()
    const listenerManager = new ListenerManager()

    return new DebugStoreImpl(atomManager, listenerManager)
}
