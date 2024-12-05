import { render, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { $computed, createStore, $effect, $value } from "../../core";
import React, { StrictMode } from "react";
import { StoreProvider, useGet, useSet } from "..";
import { useLoadable } from "../chore/useLoadable";
import { delay } from "signal-timers";

afterEach(() => {
    cleanup();
})

function makeDefered<T>(): {
    resolve: (value: T) => void,
    reject: (error: unknown) => void,
    promise: Promise<T>
} {
    const deferred: {
        resolve: (value: T) => void,
        reject: (error: unknown) => void,
        promise: Promise<T>
    } = {} as {
        resolve: (value: T) => void,
        reject: (error: unknown) => void,
        promise: Promise<T>
    };

    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });

    return deferred;
}

// @vitest-environment happy-dom
it('convert promise to loadable', async () => {
    const base = $value(Promise.resolve('foo'))
    const App = () => {
        const ret = useLoadable(base)
        if (ret.state === 'loading' || ret.state === 'hasError') {
            return <div>loading</div>
        }
        return <div>{ret.data}</div>
    }
    const store = createStore()
    render(
        <StoreProvider value={store}>
            <App />
        </StoreProvider>,
        { wrapper: StrictMode }
    )

    expect(screen.getByText('loading')).toBeTruthy()
    expect(await screen.findByText('foo')).toBeTruthy()
})


it('reset promise atom will reset loadable', async () => {
    const base = $value(Promise.resolve('foo'))
    const App = () => {
        const ret = useLoadable(base)
        if (ret.state === 'loading' || ret.state === 'hasError') {
            return <div>loading</div>
        }
        return <div>{ret.data}</div>
    }
    const store = createStore()
    render(
        <StoreProvider value={store}>
            <App />
        </StoreProvider>,
        { wrapper: StrictMode }
    )

    expect(await screen.findByText('foo')).toBeTruthy()

    const [_, promise] = (() => {
        let ret;
        const promise = new Promise(r => ret = r)
        return [ret, promise];
    })()

    store.set(base, promise)
    expect(await screen.findByText('loading')).toBeTruthy()
})

it('switchMap', async () => {
    const base = $value(Promise.resolve('foo'))
    const App = () => {
        const ret = useLoadable(base)
        if (ret.state === 'loading' || ret.state === 'hasError') {
            return <div>loading</div>
        }
        return <div>{ret.data}</div>
    }
    const store = createStore()
    render(
        <StoreProvider value={store}>
            <App />
        </StoreProvider>,
        { wrapper: StrictMode }
    )

    expect(await screen.findByText('foo')).toBeTruthy()

    const defered = makeDefered()

    store.set(base, defered.promise)
    expect(await screen.findByText('loading')).toBeTruthy()

    store.set(base, Promise.resolve('bar'))
    expect(await screen.findByText('bar')).toBeTruthy()
    
    defered.resolve('baz')
    await delay(0)
    expect(() => screen.getByText('baz')).toThrow()
})