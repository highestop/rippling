import { useSyncExternalStore } from "react"
import { $effect, Computed, Store, Value } from "../.."

export function useGet<T>(store: Store, atom: Value<T> | Computed<T>) {
    return useSyncExternalStore(fn => {
        return store.sub(atom, $effect(fn))
    }, () => {
        return store.get(atom)
    })
}
