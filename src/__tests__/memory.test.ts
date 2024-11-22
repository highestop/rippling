import LeakDetector from 'jest-leak-detector'
import { expect, it } from 'vitest'
import { state, State, Computed, computed, createStore } from '..'


it('should release memory after delete state', async () => {
    const store = createStore()
    let base: State<object> | undefined = state({})

    const detector = new LeakDetector(store.get(base))
    base = undefined

    expect(await detector.isLeaking()).toBe(false)
})

it('should release memory after base state & derived computed is deleted', async () => {
    const store = createStore()
    let base: State<object> | undefined = state({})
    let derived: Computed<object> | undefined = computed((get) => ({
        obj: base && get(base),
    }))
    const detector1 = new LeakDetector(store.get(base))
    const detector2 = new LeakDetector(store.get(derived))

    base = undefined
    derived = undefined

    expect(await detector1.isLeaking()).toBe(false)
    expect(await detector2.isLeaking()).toBe(false)
})

it('with a long-lived base state', async () => {
    const store = createStore()
    const objAtom = state({})

    let cmpt: Computed<object> | undefined = computed((get) => ({
        obj: get(objAtom),
    }))

    const detector = new LeakDetector(store.get(cmpt))
    cmpt = undefined
    expect(await detector.isLeaking()).toBe(false)
})

it.skip('should not hold onto dependent atoms that are not mounted', async () => {
    const store = createStore()
    const objAtom = state({})
    let depAtom: Computed<unknown> | undefined = computed((get) => get(objAtom))
    const detector = new LeakDetector(depAtom)
    store.get(depAtom)
    depAtom = undefined
    await expect(detector.isLeaking()).resolves.toBe(false)
})
