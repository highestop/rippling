import { expect, test } from 'vitest';
import { atom, createStore, drip, ripple, Atom, Ripple } from '../';

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
    const computedAtom = ripple((get) => {
        const num = get(anAtom);
        return num * 2
    });

    expect(store.get(computedAtom)).toBe(2);
})

test('compute atom should net set', () => {
    const store = createStore()
    const anAtom = atom(1)
    const doubleRip = ripple((get) => {
        return get(anAtom) * 2
    })

    store.set(doubleRip as unknown as Atom<number>, 3)
    expect(store.get(doubleRip)).toBe(2)
})

test('async atom should works like sync atom', async () => {
    const store = createStore()
    const anAtom = atom(1)
    const asyncRip: Ripple<Promise<number>> = ripple(async (get) => {
        await Promise.resolve()
        return get(anAtom) * 2
    })

    expect(await store.get(asyncRip)).toBe(2)
})

test('drip can set other atom', () => {
    const store = createStore()
    const anAtom = atom(1)
    const doubleAtom = atom(0)
    const doubleDrip = drip((get, set, num) => {
        set(anAtom, num)
        set(doubleAtom, get(anAtom) * 2)
    })
    store.set(doubleDrip, 2)
    expect(store.get(anAtom)).toBe(2)
    expect(store.get(doubleAtom)).toBe(4)
})

test('read & write drip as an action', async () => {
    const store = createStore()
    const promiseAtom = atom(Promise.resolve(1))

    const actionDrip = drip(get => {
        return get(promiseAtom)
    }, (_, set) => {
        const promise = Promise.resolve(2)
        set(promiseAtom, promise)
        return promise
    })

    expect(await store.get(actionDrip)).toBe(1)
    void store.set(actionDrip)
    expect(await store.get(actionDrip)).toBe(2)
})
