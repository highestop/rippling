import { expect, test } from "vitest"
import { setupJotaiStore, setupRipplingStore } from "./case"
import { Value } from ".."
import { PrimitiveAtom } from "jotai/vanilla"

test('rippling write scenario', () => {
    const { cleanup, atoms, store } = setupRipplingStore(2)
    for (let i = 0; i < atoms[0].length / 10; i++) {
        store.set(atoms[0][i * 10] as Value<number>, (x) => x + 1)
        store.notify()
    }
    expect(store.get(atoms[atoms.length - 1][0])).toBe(4960)
    cleanup()
})

test('jotai write scenario', () => {
    const { cleanup, atoms, store } = setupJotaiStore(2)
    for (let i = 0; i < atoms[0].length / 10; i++) {
        store.set(atoms[0][i * 10] as PrimitiveAtom<number>, (x: number) => x + 1)
    }
    expect(store.get(atoms[atoms.length - 1][0])).toBe(4960)
    cleanup()
})