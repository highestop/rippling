import { Atom } from "../typing/atom";
import { DebugStore, NestedString } from "../typing/store";
import { AtomManager, ListenerManager } from "./atom-manager";
import { StoreImpl } from "./store";

class DebugStoreImpl extends StoreImpl implements DebugStore {

    getReadDependencies = (atom: Atom<unknown>): NestedString => {
        const label = atom.debugLabel ?? 'anonymous';
        const atomState = this.atomManager.readAtomState(atom);

        return [label, ...Array.from(atomState.dependencies ?? new Map<Atom<unknown>, number>()).map(([key]) => {
            return this.getReadDependencies(key);
        })] as NestedString[];
    }

    getMountGraph = (atom: Atom<unknown>): NestedString => {
        const label = atom.debugLabel ?? 'anonymous';
        const atomState = this.atomManager.readAtomState(atom);
        return [label, ...Array.from(atomState.mounted?.readDepts ?? []).map((key) =>
            this.getMountGraph(key)
        )] as NestedString[];
    }

    getPendingListeners = (): string[] => {
        return this.listenerManager._debugGetPendingListeners().map((listener) => listener.debugLabel ?? 'anonymous')
    }
}

export function createDebugStore(): DebugStore {
    const atomManager = new AtomManager()
    const listenerManager = new ListenerManager()

    return new DebugStoreImpl(atomManager, listenerManager)
}
