import {
  ReadableAtom,
  Effect,
  Getter,
  Value,
  Updater,
  Setter,
} from "../types/atom";
import { Store } from "../types/store";
import { AtomManager, ListenerManager } from "./atom-manager";

export class CoreStore implements Store {
  constructor(
    protected readonly atomManager: AtomManager,
    protected readonly listenerManager: ListenerManager,
  ) {}

  private isOuterSet = false;

  private innerSet = <T, Args extends unknown[]>(
    atom: Value<T> | Effect<T, Args>,
    ...args: [T | Updater<T>] | Args
  ): undefined | T => {
    if ("read" in atom) {
      return;
    }

    if ("write" in atom) {
      const ret = atom.write(this.get, this.set, ...(args as Args));
      return ret;
    }

    const newValue =
      typeof args[0] === "function"
        ? (args[0] as Updater<T>)(this.atomManager.readAtomState(atom).val)
        : (args[0] as T);

    if (!this.atomManager.inited(atom)) {
      this.atomManager.readAtomState(atom).val = newValue;
      this.listenerManager.markPendingListeners(this.atomManager, atom);
      return;
    }
    const atomState = this.atomManager.readAtomState(atom);
    atomState.val = newValue;
    atomState.epoch += 1;
    this.listenerManager.markPendingListeners(this.atomManager, atom);
  };

  get: Getter = <T>(atom: ReadableAtom<T>): T => {
    return this.atomManager.readAtomState(atom).val;
  };

  private notify = () => {
    for (const listener of this.listenerManager.notify()) {
      listener.write(this.get, this.set);
    }
  };

  set: Setter = <T, Args extends unknown[]>(
    atom: Value<T> | Effect<T, Args>,
    ...args: [T | Updater<T>] | Args
  ): undefined | T => {
    let ret: T | undefined;
    try {
      ret = this.innerSet(atom, ...args) as T | undefined;
    } finally {
      this.notify();
    }

    return ret;
  };

  private _subSingleAtom(
    atom: ReadableAtom<unknown>,
    cbEffect: Effect<unknown, unknown[]>,
  ): () => void {
    const mounted = this.atomManager.mount(atom);
    mounted.listeners.add(cbEffect);

    return () => {
      mounted.listeners.delete(cbEffect);

      if (mounted.readDepts.size === 0 && mounted.listeners.size === 0) {
        this.atomManager.unmount(atom);
      }
    };
  }

  sub(
    atoms: ReadableAtom<unknown>[] | ReadableAtom<unknown>,
    cbEffect: Effect<unknown, unknown[]>,
  ): () => void {
    if (Array.isArray(atoms) && atoms.length === 0) {
      return () => void 0;
    }

    if (Array.isArray(atoms) && atoms.length === 1) {
      return this._subSingleAtom(atoms[0], cbEffect);
    } else if (!Array.isArray(atoms)) {
      return this._subSingleAtom(atoms, cbEffect);
    }

    const unsubscribes = new Set<() => void>();
    atoms.forEach((atom) => {
      unsubscribes.add(this._subSingleAtom(atom, cbEffect));
    });

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };
  }
}

export function createStore(): Store {
  const atomManager = new AtomManager();
  const listenerManager = new ListenerManager();

  return new CoreStore(atomManager, listenerManager);
}
