import { bench, describe } from 'vitest'
import { setupJotaiStore, setupRipplingStore } from './case'
import { Value } from '..'
import { PrimitiveAtom } from 'jotai/vanilla'

const PROP_GRAPH_DEPTH = 3
const { atoms: atomsRippling, store: storeRippling } = setupRipplingStore(PROP_GRAPH_DEPTH)
const { atoms: atomsJotai, store: storeJotai } = setupJotaiStore(PROP_GRAPH_DEPTH)

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