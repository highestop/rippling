import { useEffect, useState } from "react"
import { $effect, Computed, Value } from "../../core"
import { useStore } from "./provider"

export function useResolved<T>(atom: Value<Promise<T>> | Computed<Promise<T>>): T | undefined {
    const store = useStore()
    const [promiseResult, setPromiseResult] = useState<T | undefined>(undefined)
    const [promise, setPromise] = useState(store.get(atom))

    useEffect(() => {
        return store.sub(atom, $effect(() => {
            setPromise(store.get(atom))
        }))
    }, [atom])

    useEffect(() => {
        const ctrl = new AbortController()
        const signal = ctrl.signal

        setPromiseResult(undefined)

        void promise.then(ret => {
            if (signal.aborted) return

            setPromiseResult(ret)
        })


        return () => {
            ctrl.abort()
        }
    }, [promise])

    return promiseResult
}