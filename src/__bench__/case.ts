import { computed, createStore, effect, value } from ".."
import { ReadableAtom, Value } from "../typing/atom"
import { atom, createStore as createJotaiStore, Atom as JotaiAtom, PrimitiveAtom } from 'jotai/vanilla'

function fib(n: number): number {
    if (n <= 1) return n
    return fib(n - 1) + fib(n - 2)
}

interface Strategy<T, S> {
    createStore(): S
    createValue(value: number): T
    createComputed(atoms: T[], compute: (get: (atom: T) => number) => number): T
    sub(store: S, atom: T, callback: () => void): () => void
    get(store: S, atom: T): number
    setWithNotify(store: S, atom: T, value: number | ((prev: number) => number)): void
}

export const ripplingStrategy: Strategy<ReadableAtom<number>, ReturnType<typeof createStore>> = {
    createStore() {
        return createStore()
    },
    createValue(val: number) {
        return value(val)
    },
    createComputed(atoms, compute) {
        return computed(get => compute(get))
    },
    sub(store, atom, callback) {
        return store.sub(atom, effect(() => {
            callback()
        }))
    },
    get(store, atom) {
        return store.get(atom)
    },
    setWithNotify(store, atom, value) {
        store.set(atom as Value<number>, value)
        store.notify()
    }
}

export const jotaiStrategy: Strategy<JotaiAtom<number>, ReturnType<typeof createJotaiStore>> = {
    createStore() {
        return createJotaiStore()
    },
    createValue(val: number) {
        return atom(val)
    },
    createComputed(atoms, compute) {
        return atom(get => compute(get))
    },
    sub(store, atom, callback) {
        return store.sub(atom, callback)
    },
    get(store, atom) {
        return store.get(atom)
    },
    setWithNotify(store, atom, value) {
        store.set(atom as PrimitiveAtom<number>, value)
    }
}

function deriveAtoms<T, S>(atoms: T[], childCount: number, strategy: Strategy<T, S>): T[][] {
    let pendingAtoms: T[] = [...atoms]
    const result: T[][] = []

    while (pendingAtoms.length > 1) {
        result.push(pendingAtoms)
        const derivedAtoms: T[] = []

        for (let i = 0; i < pendingAtoms.length / childCount; i++) {
            const innerAtoms: T[] = []
            for (let j = 0; j < childCount && i * childCount + j < pendingAtoms.length; j++) {
                innerAtoms.push(pendingAtoms[i * childCount + j])
            }

            const derived = strategy.createComputed(innerAtoms, (get) => {
                let total = 0
                for (const atom of innerAtoms) {
                    total += get(atom)
                }
                return total
            })

            derivedAtoms.push(derived)
        }
        pendingAtoms = derivedAtoms
    }

    result.push(pendingAtoms)
    return result
}

function setupStore<T, S>(scale: number, strategy: Strategy<T, S>) {
    const store = strategy.createStore()
    const values: T[] = []
    for (let i = 0; i < Math.pow(10, scale); i++) {
        values.push(strategy.createValue(i))
    }

    const atoms = deriveAtoms(values, 10, strategy)
    const cleanups: (() => void)[] = []

    for (let i = 1; i < atoms.length; i++) {
        const levelAtoms = atoms[i]
        for (let j = 0; j < levelAtoms.length / 10; j++) {
            const atom = levelAtoms[j * 10]
            cleanups.push(strategy.sub(store, atom, () => {
                strategy.get(store, atom)
                fib(10)
            }))
        }
    }

    const cleanup = () => {
        for (const cleanup of cleanups) {
            cleanup()
        }
    }

    return { store, atoms, cleanup }
}

export function setupRipplingStore(scale = 5) {
    return setupStore(scale, ripplingStrategy)
}

export function setupJotaiStore(scale = 5) {
    return setupStore(scale, jotaiStrategy)
}
