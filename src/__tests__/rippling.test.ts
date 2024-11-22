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
    const doubleEffect = effect((get, set, num) => {
        set(anAtom, num)
        set(doubleAtom, get(anAtom) * 2)
    })
    store.set(doubleEffect, 2)
    expect(store.get(anAtom)).toBe(2)
    expect(store.get(doubleAtom)).toBe(4)
})

test('read & write effect as an effect', async () => {
    const store = createStore()
    const trace = vi.fn()
    const effectEffect = effect(async () => {
        await Promise.resolve()
        trace()
        return 2;
    })

    expect(() => store.get(effectEffect)).toThrow('Effect is not inited')

    void store.set(effectEffect)
    expect(trace).not.toHaveBeenCalled()
    expect(await store.get(effectEffect)).toBe(2)
    expect(trace).toHaveBeenCalledOnce()
})

test('set an atom should trigger subscribe', () => {
    const store = createStore()
    const anAtom = state(1)
    const trace = vi.fn()
    store.sub([anAtom], effect(() => {
        trace()
    }))
    store.set(anAtom, 2)
    expect(trace).not.toBeCalled()
    store.flush()
    expect(trace).toBeCalledTimes(1)
})

test('set an atom should trigger once in multiple set', () => {
    const store = createStore()
    const anAtom = state(1)
    const trace = vi.fn()
    store.sub([anAtom], effect(() => {
        trace()
    }))
    store.set(anAtom, 2)
    store.set(anAtom, 3)
    store.set(anAtom, 4)
    store.flush()
    expect(trace).toBeCalledTimes(1)
})

test('set an atom should trigger once in multiple flush', () => {
    const store = createStore()
    const anAtom = state(1)
    const trace = vi.fn()
    store.sub([anAtom], effect(() => {
        trace()
    }))
    store.set(anAtom, 2)
    store.flush()
    store.flush()
    store.flush()
    expect(trace).toBeCalledTimes(1)
})

test('sub multiple atoms', () => {
    const store = createStore()
    const state1 = state(1)
    const state2 = state(2)

    const trace = vi.fn()
    store.sub([state1, state2], effect(() => {
        trace()
    }))
    store.set(state1, 2)
    store.set(state2, 3)
    store.flush()
    expect(trace).toBeCalledTimes(1)
})

test.skip('sub computed atom', () => {
    const store = createStore()
    const anState = state(1)
    const cmpt = computed((get) => {
        return get(anState) * 2
    })

    const trace = vi.fn()
    store.sub([cmpt], effect(() => {
        trace()
    }))
    expect(trace).not.toBeCalled()
    store.set(anState, 2)
    store.flush()
    expect(trace).toBeCalledTimes(1)
})
