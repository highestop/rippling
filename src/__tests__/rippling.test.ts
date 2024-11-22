import { expect, test, vi } from 'vitest';
import { state, createStore, State, computed, Computed, effect } from '../';

test('should work', () => {
    const store = createStore();
    const anAtom = state(1);

    expect(store.get(anAtom)).toBe(1);

    store.set(anAtom, 2);
    expect(store.get(anAtom)).toBe(2);

    const store2 = createStore();
    expect(store2.get(anAtom)).toBe(1);
});

test('computed state should work', () => {
    const store = createStore();
    const anAtom = state(1);
    const computedAtom = computed((get) => {
        const num = get(anAtom);
        return num * 2
    });

    expect(store.get(computedAtom)).toBe(2);
})

test('computed state should net set', () => {
    const store = createStore()
    const anAtom = state(1)
    const doubleCmpt = computed((get) => {
        return get(anAtom) * 2
    })

    store.set(doubleCmpt as unknown as State<number>, 3)
    expect(store.get(doubleCmpt)).toBe(2)
})

test('async state should works like sync state', async () => {
    const store = createStore()
    const anAtom = state(1)
    const asyncCmpt: Computed<Promise<number>> = computed(async (get) => {
        await Promise.resolve()
        return get(anAtom) * 2
    })

    expect(await store.get(asyncCmpt)).toBe(2)
})

test('effect can set other state', () => {
    const store = createStore()
    const anAtom = state(1)
    const doubleAtom = state(0)
    const doubleAction = effect((get, set, num) => {
        set(anAtom, num)
        set(doubleAtom, get(anAtom) * 2)
    })
    store.set(doubleAction, 2)
    expect(store.get(anAtom)).toBe(2)
    expect(store.get(doubleAtom)).toBe(4)
})

test('read & write effect as an effect', async () => {
    const store = createStore()
    const trace = vi.fn()
    const actionAction = effect(async () => {
        await Promise.resolve()
        trace()
        return 2;
    })

    expect(() => store.get(actionAction)).toThrow('Effect is not inited')

    void store.set(actionAction)
    expect(trace).not.toHaveBeenCalled()
    expect(await store.get(actionAction)).toBe(2)
    expect(trace).toHaveBeenCalledOnce()
})
