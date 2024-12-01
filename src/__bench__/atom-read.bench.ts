import { bench, describe } from 'vitest'
import { jotaiStrategy, ripplingStrategy, setupStore, setupStoreWithoutSub } from './case'
import { Value } from '..'
import { PrimitiveAtom } from 'jotai/vanilla'

describe('set with subscription', () => {
    const PROP_GRAPH_DEPTH = 4
    const { atoms: atomsRippling, store: storeRippling } = setupStore(PROP_GRAPH_DEPTH, ripplingStrategy)
    const { atoms: atomsJotai, store: storeJotai } = setupStore(PROP_GRAPH_DEPTH, jotaiStrategy)

    describe(`set with mount, ${String(PROP_GRAPH_DEPTH)} layer states, each computed has 10 children`, () => {
        bench('rippling', () => {
            const atoms = atomsRippling
            const store = storeRippling
            for (let i = 0; i < atoms[0].length / 10; i++) {
                store.set(atoms[0][i * 10] as Value<number>, (x) => x + 1)
                store.notify()
            }
        })

        bench('jotai', () => {
            const atoms = atomsJotai
            const store = storeJotai
            for (let i = 0; i < atoms[0].length / 10; i++) {
                store.set(atoms[0][i * 10] as PrimitiveAtom<number>, (x) => x + 1)
            }
        })
    })

    describe(`set with lazy notify, ${String(PROP_GRAPH_DEPTH)} layer states, each computed has 10 children`, () => {
        bench('batch notify', () => {
            const atoms = atomsRippling
            const store = storeRippling
            for (let i = 0; i < atoms[0].length / 10; i++) {
                store.set(atoms[0][i * 10] as Value<number>, (x) => x + 1)
            }
            store.notify()
        })

        bench('immediate notify', () => {
            const atoms = atomsRippling
            const store = storeRippling
            for (let i = 0; i < atoms[0].length / 10; i++) {
                store.set(atoms[0][i * 10] as Value<number>, (x) => x + 1)
                store.notify()
            }
        })
    })
})

describe('set without sub', () => {
    const PROP_GRAPH_DEPTH = 3
    const { store: storeWithoutSubRippling, atoms: atomsWithoutSubRippling } = setupStoreWithoutSub(PROP_GRAPH_DEPTH, ripplingStrategy)
    const { store: storeWithoutSubJotai, atoms: atomsWithoutSubJotai } = setupStoreWithoutSub(PROP_GRAPH_DEPTH, jotaiStrategy)

    describe(`set without sub, ${String(PROP_GRAPH_DEPTH)} layer states, each computed has 10 children`, () => {
        bench('rippling', () => {
            const atoms = atomsWithoutSubRippling
            const store = storeWithoutSubRippling
            for (let i = 0; i < atoms[0].length / 10; i++) {
                store.set(atoms[0][i * 10] as Value<number>, (x) => x + 1)
                store.notify()
            }
        })

        bench('jotai', () => {
            const atoms = atomsWithoutSubJotai
            const store = storeWithoutSubJotai
            for (let i = 0; i < atoms[0].length / 10; i++) {
                store.set(atoms[0][i * 10] as PrimitiveAtom<number>, (x) => x + 1)
            }
        })
    })
})