import { expect, test, vi } from 'vitest';
import { atom, createStore, Atom, compute, Compute, action } from '../';

test('should work', () => {
    const store = createStore();
    const anAtom = atom(1);

    expect(store.get(anAtom)).toBe(1);

    store.set(anAtom, 2);
    expect(store.get(anAtom)).toBe(2);

    const store2 = createStore();
    expect(store2.get(anAtom)).toBe(1);
});

test('compute atom should work', () => {
    const store = createStore();
    const anAtom = atom(1);
    const computedAtom = compute((get) => {
        const num = get(anAtom);
        return num * 2
    });

    expect(store.get(computedAtom)).toBe(2);
})

test('compute atom should net set', () => {
    const store = createStore()
    const anAtom = atom(1)
    const doubleCmpt = compute((get) => {
        return get(anAtom) * 2
    })

    store.set(doubleCmpt as unknown as Atom<number>, 3)
    expect(store.get(doubleCmpt)).toBe(2)
})

test('async atom should works like sync atom', async () => {
    const store = createStore()
    const anAtom = atom(1)
    const asyncCmpt: Compute<Promise<number>> = compute(async (get) => {
        await Promise.resolve()
        return get(anAtom) * 2
    })

    expect(await store.get(asyncCmpt)).toBe(2)
})

test('action can set other atom', () => {
    const store = createStore()
    const anAtom = atom(1)
    const doubleAtom = atom(0)
    const doubleAction = action((get, set, num) => {
        set(anAtom, num)
        set(doubleAtom, get(anAtom) * 2)
    })
    store.set(doubleAction, 2)
    expect(store.get(anAtom)).toBe(2)
    expect(store.get(doubleAtom)).toBe(4)
})

test('read & write action as an action', async () => {
    const store = createStore()
    const trace = vi.fn()
    const actionAction = action(async () => {
        await Promise.resolve()
        trace()
        return 2;
    })

    expect(() => store.get(actionAction)).toThrow('Action is not inited')

    void store.set(actionAction)
    expect(trace).not.toHaveBeenCalled()
    expect(await store.get(actionAction)).toBe(2)
    expect(trace).toHaveBeenCalledOnce()
})
