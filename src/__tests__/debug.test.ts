import { expect, it } from "vitest";
import { computed, createDebugStore, effect, nestedAtomToString, state } from "..";

it('can get pending listeners', () => {
    const store = createDebugStore()
    const base = state(1)
    store.sub(base, effect(() => { void (0) }, { debugLabel: 'sub' }))

    expect(store.getPendingListeners()).toEqual([])
    store.set(base, 2)
    expect(nestedAtomToString(store.getPendingListeners())).toEqual(['sub'])
})

it('get all subscribed atoms', () => {
    const store = createDebugStore()
    const base = state(1, { debugLabel: 'base' })
    const derived = computed((get) => get(base) + 1, { debugLabel: 'derived' })
    store.sub([base, derived], effect(() => { void (0) }, { debugLabel: 'sub' }))
    expect(nestedAtomToString(store.getSubscribeGraph())).toEqual([['base', 'sub'], ['derived', 'sub']])
})
