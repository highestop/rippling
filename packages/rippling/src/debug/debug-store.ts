import type { CallbackFunc, StoreInspector } from '../../types/core/store';
import type { DebugStore } from '../../types/debug/debug-store';
import type { NestedAtom } from '../../types/debug/util';
import type { Computed, Func, Subscribe, Updater, Value } from '../core';
import { AtomManager, ListenerManager } from '../core/atom-manager';
import type { ComputedState } from '../core/atom-manager';
import { StoreImpl } from '../core/store';

const ConsoleLoggingInterceptor: StoreInspector = {
  get: <T>(atom$: Value<T> | Computed<T>, fn: () => T) => {
    console.log('GET', '[' + atom$.toString() + ']', fn());
  },
  set: <T, Args extends unknown[]>(atom$: Value<T> | Func<T, Args>, fn: () => T, ...args: Args | [T | Updater<T>]) => {
    console.log('SET', '[' + atom$.toString() + ']', args, fn());
  },
  sub: <T>(atom$: Value<T> | Computed<T>, callback$: CallbackFunc<T>, fn: () => void) => {
    fn();
    console.log('SUB', '[' + atom$.toString() + ']', callback$);
  },
  unsub: <T>(atom$: Value<T> | Computed<T>, callback$: CallbackFunc<T>, fn: () => void) => {
    fn();
    console.log('UNSUB', '[' + atom$.toString() + ']', callback$);
  },
  mount: <T>(atom$: Value<T> | Computed<T>) => {
    console.log('MOUNT', '[' + atom$.toString() + ']');
  },
  unmount: <T>(atom$: Value<T> | Computed<T>) => {
    console.log('UNMOUNT', '[' + atom$.toString() + ']');
  },
  notify: <T>(callback$: CallbackFunc<T>, fn: () => T) => {
    console.log('NOTIFY', '[' + callback$.toString() + ']', fn());
  },
};

class DebugStoreImpl extends StoreImpl implements DebugStore {
  private readonly mountedAtomListenersCount = new Map<Value<unknown> | Computed<unknown>, number>();

  override sub: Subscribe = (
    atoms: (Value<unknown> | Computed<unknown>)[] | (Value<unknown> | Computed<unknown>),
    cb: Func<unknown, unknown[]>,
  ): (() => void) => {
    const atomList = Array.isArray(atoms) ? atoms : [atoms];

    atomList.forEach((atom) => {
      this.mountedAtomListenersCount.set(atom, (this.mountedAtomListenersCount.get(atom) ?? 0) + 1);
    });

    const unsub = super.sub(atoms, cb);
    return () => {
      unsub();
      atomList.forEach((atom) => {
        const count = this.mountedAtomListenersCount.get(atom) ?? 0;
        if (count === 0) {
          return;
        }

        this.mountedAtomListenersCount.set(atom, count - 1);
        if (count === 1) {
          this.mountedAtomListenersCount.delete(atom);
        }
      });
    };
  };

  getReadDependencies = (atom: Value<unknown> | Computed<unknown>): NestedAtom => {
    const atomState = this.atomManager.readAtomState(atom);

    if (!('dependencies' in atomState)) {
      return [atom];
    }

    return [
      atom,
      ...Array.from((atomState as ComputedState<unknown>).dependencies).map(([key]) => {
        return this.getReadDependencies(key);
      }),
    ] as NestedAtom;
  };

  getReadDependents = (atom: Value<unknown> | Computed<unknown>): NestedAtom => {
    const atomState = this.atomManager.readAtomState(atom);
    return [
      atom,
      ...Array.from(atomState.mounted?.readDepts ?? []).map((key) => this.getReadDependents(key)),
    ] as NestedAtom;
  };

  getSubscribeGraph = (): NestedAtom => {
    const subscribedAtoms = Array.from(this.mountedAtomListenersCount.keys());
    return subscribedAtoms.map((atom) => {
      const atomState = this.atomManager.readAtomState(atom);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know it's mounted
      const listeners = Array.from(atomState.mounted!.listeners);
      return [atom, ...listeners];
    });
  };
}

interface DebugStoreOptions {
  enableConsoleLogging?: boolean;
}

export function createDebugStore(options?: DebugStoreOptions): DebugStore {
  const inspector = options?.enableConsoleLogging ? ConsoleLoggingInterceptor : undefined;
  const atomManager = new AtomManager({
    inspector,
  });
  const listenerManager = new ListenerManager();

  return new DebugStoreImpl(atomManager, listenerManager, {
    inspector,
  });
}
