import { useEffect, useState } from "react"
import { $effect, Computed, Value } from "../../core"
import { useStore } from "./provider"

type Loadable<T> = {
    state: 'loading'
} | {
    state: 'hasData'
    data: T
} | {
    state: 'hasError'
    error: unknown
}

export function useLoadable<T>(atom: Value<Promise<T>> | Computed<Promise<T>>): Loadable<T> {
    const store = useStore()
    const [promiseResult, setPromiseResult] = useState<Loadable<T>>({
        state: 'loading'
    })
    const [promise, setPromise] = useState(store.get(atom))

    useEffect(() => {
        return store.sub(atom, $effect(() => {
            setPromise(store.get(atom))
        }))
    }, [atom])

    useEffect(() => {
        const ctrl = new AbortController()
        const signal = ctrl.signal

        setPromiseResult({
            state: 'loading'
        })
        void promise.then(ret => {
            if (signal.aborted) return

            setPromiseResult({
                state: 'hasData',
                data: ret
            })
        })

        void promise.catch((error: unknown) => {
            if (signal.aborted) return

            setPromiseResult({
                state: 'hasError',
                error
            })
        })

        return () => {
            ctrl.abort()
        }
    }, [promise])

    return promiseResult
}