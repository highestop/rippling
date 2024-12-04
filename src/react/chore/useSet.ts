import { isPromise } from "util/types"
import { Effect, Store } from "../.."

export function useSet<T, ARGS extends unknown[]>(store: Store, atom: Effect<T, ARGS>): (...args: ARGS) => T {
    return (...args: ARGS): T => {
        const ret = store.set(atom, ...args)

        if (isPromise(ret)) {
            return ret.then(v => {
                return v
            }) as T
        }

        return ret
    }
}