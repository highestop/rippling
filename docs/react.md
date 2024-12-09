# Using Rippling in React

To begin using Rippling in a React application, you must utilize the `StoreProvider` to provide a store for the hooks.

```jsx
// main.tsx
import { createStore, StoreProvider } from 'rippling';
import { App } from './App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const store = createStore();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider value={store}>
      <App />
    </StoreProvider>
  </StrictMode>,
);
```

All descendant components within the `StoreProvider` will use the provided store as the caller for `get` and `set` operations.

You can place the `StoreProvider` either inside or outside of `StrictMode`; the functionality is the same.

## Retrieving Atom Values

The most basic usage is to use `useGet` to retrieve the value of an Atom.

```jsx
// atoms/count.ts
import { $value } from 'rippling';
export const countAtom = $value(0);

// App.tsx
import { useGet } from 'rippling';
import { countAtom } from './atoms/count';

function App() {
  const count = useGet(countAtom);
  return <div>{count}</div>;
}
```

`useGet` returns a `Value` or a `Computed` value, and when the value changes, `useGet` triggers a re-render of the component.

`useGet` does not do anything special with `Promise` values. In fact, `useGet` is equivalent to a single `store.get` call, plus a `store.sub` to ensure reactive updates to the React component.

Two other useful hooks are available when dealing with `Promise` values. First, we introduce `useLoadable`.

```jsx
// atoms/user.ts
import { $computed } from 'rippling';

export const userAtom = $computed(async () => {
  return fetch('/api/users/current').then((res) => res.json());
});

// App.tsx
import { useLoadable } from 'rippling';
import { userAtom } from './atoms/user';

function App() {
  const user = useLoadable(userAtom);
  if (user.state === 'loading') return <div>Loading...</div>;
  if (user.state === 'error') return <div>Error: {user.error.message}</div>;

  return <div>{user.data.name}</div>;
}
```

`useLoadable` accepts an Atom that returns a `Promise`, wrapping the result in a `Loadable` structure.

```typescript
type Loadable<T> =
  | {
      state: 'loading';
    }
  | {
      state: 'hasData';
      data: T;
    }
  | {
      state: 'hasError';
      error: unknown;
    };
```

This allows you to render loading and error states in JSX based on the state. `useLoadable` suppresses exceptions, so it will not trigger an `ErrorBoundary`.

Another useful hook is `useResolved`, which always returns the resolved value of a `Promise`.

```jsx
// App.tsx
import { useResolved } from 'rippling';
import { userAtom } from './atoms/user';

function App() {
  const user = useResolved(userAtom);
  return <div>{user?.name}</div>;
}
```

`useResolved` only returns the parameter passed to the resolve function so that it will return `undefined` during loading and when encountering error values. Like `useLoadable`, `useResolved` also suppresses exceptions. In fact, `useResolved` is a simple wrapper around `useLoadable`.

```typescript
// useResolved.ts
import { useLoadable } from './useLoadable';
import type { Computed, Value } from '../core';

export function useResolved<T>(atom: Value<Promise<T>> | Computed<Promise<T>>): T | undefined {
  const loadable = useLoadable(atom);
  return loadable.state === 'hasData' ? loadable.data : undefined;
}
```

## Updating Atom Values / Triggering Effects

The `useSet` hook can be used to update the value of an Atom. It returns a function equivalent to `store.set` when called.

```jsx
// App.tsx
import { useSet } from 'rippling';
import { countAtom } from './atoms/count';

function App() {
  const setCount = useSet(countAtom);
  // setCount(x => x + 1) is equivalent to store.set(countAtom, x => x + 1)
  return <button onClick={() => setCount((x) => x + 1)}>Increment</button>;
}
```
