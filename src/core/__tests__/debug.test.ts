import { expect, it } from "vitest";
import { $computed, createDebugStore, $effect, nestedAtomToString, $value } from "..";


it('get all subscribed atoms', () => {
    const store = createDebugStore()
    const base = $value(1, { debugLabel: 'base' })
    const derived = $computed((get) => get(base) + 1, { debugLabel: 'derived' })
    store.sub([base, derived], $effect(() => { void (0) }, { debugLabel: 'sub' }))
    expect(nestedAtomToString(store.getSubscribeGraph())).toEqual([['base', 'sub'], ['derived', 'sub']])
})
