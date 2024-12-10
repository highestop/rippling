import type { ReadableAtom, Func, Getter, Value, Updater, Setter } from '../../types/core/atom';
import type { Store, SubscribeOptions } from '../../types/core/store';
import { AtomManager, ListenerManager } from './atom-manager';

export class StoreImpl implements Store {
  constructor(
    protected readonly atomManager: AtomManager,
    protected readonly listenerManager: ListenerManager,
  ) {}

  private innerSet = <T, Args extends unknown[]>(
    atom: Value<T> | Func<T, Args>,
    ...args: [T | Updater<T>] | Args
  ): undefined | T => {
    if ('read' in atom) {
      return;
    }

    if ('write' in atom) {
      const ret = atom.write({ get: this.get, set: this.set }, ...(args as Args));
      return ret;
    }

    const newValue =
      typeof args[0] === 'function'
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
    return undefined;
  };

  get: Getter = <T>(atom: ReadableAtom<T>): T => {
    return this.atomManager.readAtomState(atom).val;
  };

  private notify = () => {
    for (const listener of this.listenerManager.notify()) {
      listener.write({ get: this.get, set: this.set });
    }
  };

  set: Setter = <T, Args extends unknown[]>(
    atom: Value<T> | Func<T, Args>,
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
    target$: ReadableAtom<unknown>,
    cb$: Func<unknown, unknown[]>,
    options?: SubscribeOptions,
  ): () => void {
    const mounted = this.atomManager.mount(target$);
    mounted.listeners.add(cb$);

    const unsub = () => {
      mounted.listeners.delete(cb$);

      if (mounted.readDepts.size === 0 && mounted.listeners.size === 0) {
        this.atomManager.unmount(target$);
      }
    };

    options?.signal?.addEventListener('abort', unsub);
    return unsub;
  }

  sub(
    targets$: ReadableAtom<unknown>[] | ReadableAtom<unknown>,
    cb$: Func<unknown, unknown[]>,
    options?: SubscribeOptions,
  ): () => void {
    if (Array.isArray(targets$) && targets$.length === 0) {
      return () => void 0;
    }

    if (Array.isArray(targets$) && targets$.length === 1) {
      return this._subSingleAtom(targets$[0], cb$, options);
    } else if (!Array.isArray(targets$)) {
      return this._subSingleAtom(targets$, cb$, options);
    }

    const unsubscribes = new Set<() => void>();
    targets$.forEach((atom) => {
      unsubscribes.add(this._subSingleAtom(atom, cb$, options));
    });

    const unsub = () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };

    return unsub;
  }
}

export function createStore(): Store {
  const atomManager = new AtomManager();
  const listenerManager = new ListenerManager();

  return new StoreImpl(atomManager, listenerManager);
}
