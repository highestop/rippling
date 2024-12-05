import LeakDetector from 'jest-leak-detector'
import { expect, it } from 'vitest'
import { $value, Value, Computed, $computed, createStore, $effect, createDebugStore, useGet, StoreProvider } from '../..'
import { cleanup, render } from '@testing-library/react';


// @vitest-environment happy-dom
it('should release memory after component unmount', async () => {
    const store = createStore()
    let base: Value<{ foo: string }> | undefined = $value({
        foo: 'bar'
    })

    const detector = new LeakDetector(store.get(base))

    function App() {
        const ret = useGet(base as Value<{ foo: string }>);
        return <div>{ret.foo}</div>
    }

    render(
        <StoreProvider value={store}>
            <App />
        </StoreProvider>
    );

    base = undefined
    cleanup()

    expect(await detector.isLeaking()).toBe(false)
});