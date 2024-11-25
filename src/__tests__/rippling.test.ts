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

test('async computed should not follow old value', async () => {
    const store = createStore()
    const base = state('foo')
    const cmpt = computed((get) => {
        return Promise.resolve(get(base) + get(base))
    })
    const derivedCmpt = computed(async (get) => {
        return get(base) + await get(cmpt)
    })

    const ret1 = store.get(derivedCmpt)
    store.set(base, 'bar')
    const ret2 = store.get(derivedCmpt)

    expect(await ret1).toBe('foofoofoo')
    expect(await ret2).toBe('barbarbar')
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
    const base = state(1, {
        debugLabel: 'base'
    })
    const trace = vi.fn()
    store.sub([base], effect(() => {
        trace()
    }, {
        debugLabel: 'effect'
    }))
    store.set(base, 2)
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

test('sub computed atom', () => {
    const store = createStore()
    const base = state(1, {
        debugLabel: 'base'
    })
    const cmpt = computed((get) => {
        return get(base) * 2
    }, {
        debugLabel: 'cmpt'
    })

    const trace = vi.fn()
    store.sub([cmpt], effect(() => {
        trace()
    }))
    expect(trace).not.toBeCalled()
    store.set(base, 2)
    store.flush()
    expect(trace).toBeCalledTimes(1)
})

test('get read deps', () => {
    const store = createStore()
    const base = state({ a: 1 })
    const cmpt = computed((get) => {
        return Object.assign(get(base), { b: 1 })
    })
    expect(store.printReadDeps(cmpt)).toEqual(['anonymous'])
})

test('get should return value directly', () => {
    const store = createStore()
    const base = state({ a: 1 })
    const cmpt = computed((get) => {
        return Object.assign(get(base), { b: 1 })
    })

    const b = store.get(cmpt)
    store.set(base, { a: 2 })
    expect(b).toEqual({ a: 1, b: 1 })

    b.b = 2
    expect(store.get(cmpt)).property('a', 2)
    expect(store.get(cmpt)).property('b', 1)
})

test('derived atom should trigger when deps changed', () => {
    const store = createStore();
    const stateA = state(0);
    const stateB = state(0);
    const stateC = state(0);
    const traceB = vi.fn()
    const traceC = vi.fn();
    const derivedAtom = computed((get) => {
        if (get(stateA) == 0) {
            traceB()
            return get(stateB);
        } else {
            traceC();
            return get(stateC);
        }
    });
    expect(store.get(derivedAtom)).toBe(0);

    store.set(stateC, 1);
    expect(traceC).not.toBeCalled();

    store.get(derivedAtom);
    expect(traceC).not.toBeCalled();

    store.set(stateB, 100);
    store.get(derivedAtom);
    expect(traceC).not.toBeCalled();

    traceB.mockClear()
    store.set(stateA, 1);
    expect(traceB).not.toBeCalled();
    expect(traceC).not.toBeCalled();

    store.get(derivedAtom);
    expect(traceB).not.toBeCalled();
    expect(traceC).toBeCalled();
})

test('outdated deps should not trigger sub', async () => {
    const store = createStore();
    const branch = state("A");
    const refresh = state(0);
    const derived = computed((get) => {
        if (get(branch) == "A") {
            return Promise.resolve().then(() => {
                get(refresh);
                return "A";
            });
        }
        return "B";
    });

    const traceSub = vi.fn();
    store.sub([derived], effect(() => {
        traceSub()
    }));

    store.set(branch, "B");
    const derivedRet = store.get(derived);
    store.flush()
    expect(traceSub).toBeCalled();
    expect(await derivedRet).toBe("B");

    traceSub.mockClear();
    store.set(refresh, 1);
    store.flush()
    expect(traceSub).not.toBeCalled();
})
