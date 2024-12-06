import { atom, Atom, createStore, PrimitiveAtom } from "jotai/vanilla"
import { Strategy } from "./type"

export const jotaiStrategy: Strategy<Atom<number>, ReturnType<typeof createStore>> = {
    createStore() {
        return createStore()
    },
    createValue(val: number) {
        return atom(val)
    },
    createComputed(compute) {
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
