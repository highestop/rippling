import { Effect, Updater, Value } from "../../core"
import { useStore } from "./provider"


export function useSet<T>(atom: Value<T>): (value: T | Updater<T>) => void;
export function useSet<T, ARGS extends unknown[]>(atom: Effect<T, ARGS>): (...args: ARGS) => T;
export function useSet<T, ARGS extends unknown[]>(atom: Value<T> | Effect<T, ARGS>): ((value: T | Updater<T>) => void) | ((...args: ARGS) => T) {
    const store = useStore()

    if ('write' in atom) {
        return (...args: ARGS): T => {
            const ret = store.set(atom, ...args)

            return ret
        }
    }

    return (value: T | Updater<T>) => {
        store.set(atom, value)
    }
}