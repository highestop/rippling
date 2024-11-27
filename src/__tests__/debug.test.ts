import { expect, it } from "vitest";
import { createDebugStore, effect, state } from "..";

it('can get pending listeners', () => {
    const store = createDebugStore()
    const base = state(1)
    store.sub(base, effect(() => { void (0) }, { debugLabel: 'sub' }))

    expect(store.getPendingListeners()).toEqual([])
    store.set(base, 2)
    expect(store.getPendingListeners()).toEqual(['sub'])
})
