import { computed, effect, signal, Signal } from '@preact/signals';
import { Strategy } from './type';

interface SignalStore {
  set: (signal: Signal<number>, value: number) => void;
}

export const signalStrategy: Strategy<Signal<number>, SignalStore> = {
  createStore() {
    return {
      get: (signal: Signal<number>) => signal.value,
      set: (signal: Signal<number>, value: number) => (signal.value = value),
    };
  },
  createValue(val: number) {
    return signal(val);
  },
  createComputed(compute) {
    return computed(() => compute((signal) => signal.value));
  },
  sub(store, signal, callback) {
    return effect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const a = signal.value;
      callback();
    });
  },
  get(store, signal) {
    return signal.value;
  },
  setWithNotify(store, signal, value) {
    signal.value = value;
  },
};
