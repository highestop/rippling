import { render, cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, Computed, createStore, effect, Effect, State, state, Store } from '..'
import React, { useSyncExternalStore } from 'react'
import { isPromise } from 'util/types'

function useAtomValue<T>(store: Store, atom: State<T> | Computed<T> | Effect<T, unknown[]>) {
    return useSyncExternalStore(fn => {
        return store.sub(atom, effect(fn))
    }, () => {
        return store.get(atom)
    })
}

function useAtomSet<Value, ARGS extends unknown[]>(store: Store, atom: Effect<Value, ARGS>): (...args: ARGS) => Value {
    return (...args: ARGS): Value => {
        const ret = store.set(atom, ...args)

        if (isPromise(ret)) {
            return ret.then(v => {
                store.notify()
                return v
            }) as Value
        }

        store.notify()
        return ret
    }
}

// @vitest-environment happy-dom
describe('react', () => {
    afterEach(() => {
        cleanup()
    })


    it('using rippling in react', async () => {
        const store = createStore()
        const base = state(0)

        const trace = vi.fn()
        function App() {
            trace()
            const value = useAtomValue(store, base)
            return React.createElement('div', null, value)
        }

        render(React.createElement(App))
        expect(trace).toHaveBeenCalledTimes(1)

        expect(screen.getByText('0')).toBeTruthy()
        store.set(base, 1)
        store.notify()
        expect(screen.getByText('0')).toBeTruthy()
        await Promise.resolve()
        expect(trace).toHaveBeenCalledTimes(2)
        expect(screen.getByText('1')).toBeTruthy()
        await Promise.resolve()
        expect(trace).toHaveBeenCalledTimes(2)
    })

    it('computed should re-render', async () => {
        const store = createStore()
        const base = state(0)
        const derived = computed((get) => get(base) * 2)

        const trace = vi.fn()
        function App() {
            trace()
            const value = useAtomValue(store, derived)
            return React.createElement('div', null, value)
        }

        render(React.createElement(App))
        expect(trace).toHaveBeenCalledTimes(1)

        trace.mockClear()
        expect(screen.getByText('0')).toBeTruthy()
        store.set(base, 1)
        store.notify()
        expect(trace).not.toBeCalled()

        await Promise.resolve()
        expect(trace).toBeCalledTimes(1)
        expect(screen.getByText('2')).toBeTruthy()

        trace.mockClear()
        store.set(base, 1)
        store.notify()
        await Promise.resolve()
        expect(trace).not.toBeCalled()
    })

    it('user click counter should increment', async () => {
        const store = createStore()
        const count = state(0)
        const onClickEffect = effect((get, set) => {
            const value = get(count)
            set(count, value + 1)
        })

        const trace = vi.fn()
        function App() {
            trace()
            const value = useAtomValue(store, count)
            const onClick = useAtomSet(store, onClickEffect)

            return React.createElement('button', { onClick }, value)
        }

        render(React.createElement(App))
        const button = screen.getByText('0')
        expect(button).toBeTruthy()

        const user = userEvent.setup()
        await user.click(button)
        expect(screen.getByText('1')).toBeTruthy()
        await user.click(button)
        expect(screen.getByText('2')).toBeTruthy()

        expect(trace).toHaveBeenCalledTimes(3)
    })

    it('two atom changes should re-render once', async () => {
        const store = createStore()
        const state1 = state(0)
        const state2 = state(0)
        const trace = vi.fn()
        function App() {
            trace()
            const value1 = useAtomValue(store, state1)
            const value2 = useAtomValue(store, state2)
            return React.createElement('div', null, value1 + value2)
        }

        render(React.createElement(App))
        expect(screen.getByText('0')).toBeTruthy()
        expect(trace).toHaveBeenCalledTimes(1)

        store.set(state1, 1)
        store.set(state2, 2)
        store.notify()
        await Promise.resolve()
        expect(trace).toHaveBeenCalledTimes(2)
        expect(screen.getByText('3')).toBeTruthy()
    })

    it('async callback will trigger rerender', async () => {
        const store = createStore()
        const count = state(0)
        const onClickEffect = effect((get, set) => {
            return Promise.resolve().then(() => {
                set(count, get(count) + 1)
            })
        })

        function App() {
            const value = useAtomValue(store, count)
            const onClick = useAtomSet(store, onClickEffect)
            return React.createElement('button', { onClick }, value)
        }

        render(React.createElement(App))
        const button = screen.getByText('0')
        expect(button).toBeTruthy()

        const user = userEvent.setup()
        await user.click(button)
        expect(screen.getByText('1')).toBeTruthy()
    })

    it('floating promise not trigger rerender', async () => {
        const store = createStore()
        const count = state(0)
        const onClickEffect = effect((get, set) => {
            void Promise.resolve().then(() => {
                set(count, get(count) + 1)
            })
        })

        function App() {
            const value = useAtomValue(store, count)
            const onClick = useAtomSet(store, onClickEffect)
            return React.createElement('button', {
                onClick: () => {
                    onClick()
                }
            }, value)
        }

        render(React.createElement(App))
        const button = screen.getByText('0')
        expect(button).toBeTruthy()

        const user = userEvent.setup()
        await user.click(button)
        expect(screen.getByText('0')).toBeTruthy()

        store.notify()
        await Promise.resolve()
        expect(screen.getByText('1')).toBeTruthy()
    })
})
