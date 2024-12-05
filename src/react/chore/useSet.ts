import { isPromise } from "util/types"
import { Effect } from "../.."
import { useStore } from "./provider"
export function useSet<T, ARGS extends unknown[]>(atom: Effect<T, ARGS>): (...args: ARGS) => T {
    const store = useStore()

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