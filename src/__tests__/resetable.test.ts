import { expect, it } from "vitest";
import { Effect, state, effect, createStore } from "..";

it('rest an effect', () => {
    const RESET = Symbol('reset')

    function nullableEffect<Value, ARGS extends unknown[]>(atom: Effect<Value, ARGS>): Effect<Value | null, ARGS | [typeof RESET]> {
        const uninit = state(true);

        return effect((get, set, ...args) => {
            if (args[0] === RESET) {
                set(uninit, true)
                return null;
            }

            set(uninit, false)
            return set(atom, ...args) as Value
        })
    }

    const base = effect(() => true)
    const store = createStore()

    const derived = nullableEffect(base)
    expect(() => store.get(derived)).toThrow()
    store.set(derived)
    expect(store.get(derived)).toBe(true)
    store.set(derived, RESET)
    expect(store.get(derived)).toBe(null)
    store.set(derived)
    expect(store.get(derived)).toBe(true)
})
