import type { DebugStore } from '../../types/debug/debug-store';
import type { NestedAtom } from '../../types/debug/util';
import type { Computed, Func, Subscribe, Value } from '../core';
import { AtomManager, ListenerManager } from '../core/atom-manager';
import type { ComputedState } from '../core/atom-manager';
import { StoreImpl } from '../core/store';

class DebugStoreImpl extends StoreImpl implements DebugStore {
  private readonly subscribedAtoms = new Map<Value<unknown> | Computed<unknown>, number>();

  override sub: Subscribe = (
    atoms: (Value<unknown> | Computed<unknown>)[] | (Value<unknown> | Computed<unknown>),
    cb: Func<unknown, unknown[]>,
  ): (() => void) => {
    const atomList = Array.isArray(atoms) ? atoms : [atoms];

    atomList.forEach((atom) => {
      this.subscribedAtoms.set(atom, (this.subscribedAtoms.get(atom) ?? 0) + 1);
    });

    const unsub = super.sub(atoms, cb);
    return () => {
      unsub();
      atomList.forEach((atom) => {
        if (!this.subscribedAtoms.has(atom)) {
          return;
        }

        this.subscribedAtoms.set(atom, (this.subscribedAtoms.get(atom) ?? 0) - 1);
        if (this.subscribedAtoms.get(atom) === 0) {
          this.subscribedAtoms.delete(atom);
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
    return Array.from(this.subscribedAtoms.keys()).map((atom) => {
      const atomState = this.atomManager.readAtomState(atom);
      const listeners = Array.from(atomState.mounted?.listeners ?? []);
      return [atom, ...listeners];
    });
  };
}

export function createDebugStore(): DebugStore {
  const atomManager = new AtomManager();
  const listenerManager = new ListenerManager();

  return new DebugStoreImpl(atomManager, listenerManager);
}
