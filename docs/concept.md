# Concept behind Rippling

Rippling is a state management library inspired by Jotai. While Jotai is a great state management solution that has benefited the Motiff project significantly, as our project grew larger, especially with the increasing number of states (1k~10k atoms), we felt that some of Jotai's design choices needed adjustments, mainly in these aspects:

- Too many combinations of atom init/setter/getter methods, need simplification to reduce team's mental overhead
- The timing of store notifying all subscribers should be manually controlled by developers, rather than automatic notification
- Should reduce reactive capabilities, especially the `onMount` capability - the framework shouldn't provide this ability

To address these issues, I created Rippling to express my thoughts on state management. Before detailing the differences from Jotai, we need to understand Rippling's Atom types and subscription system.

## More Semantic Atom Types

Like Jotai, Rippling is also an Atom State solution. However, unlike Jotai, Rippling doesn't expose Raw Atom, instead dividing Atoms into three types:

### `state` (equivalent to "Primitive Atom" in Jotai)

`state` is a readable and writable "variable", similar to a Primitive Atom in Jotai. Reading a `state` involves no computation process, and writing to a `state` won't trigger any Listener execution - it's simply a variable.

```typescript
const i = state(0);
const store = createStore();
console.log(store.get(i)); // 0
store.set(i, 1);
console.log(store.get(i)); // 1
store.set(i, (x) => x * 10);
console.log(store.get(i)); // 10
```

### `computed` (equivalent to "Read-only Atom" in Jotai)

`computed` is a readable computed variable whose calculation process should be side-effect free. As long as its dependent Atoms don't change, repeatedly reading the value of a `computed` should yield identical results. `computed` is similar to a Read-only Atom in Jotai.

```typescript
const i = state(0);
const j = computed(() => store.get(i) * 10);
console.log(store.get(j)); // 0
store.set(i, 1);
console.log(store.get(j)); // 10
```

### `effect` (equivalent to "Write-only Atom" in Jotai)

`effect` is used to encapsulate a process code block. The code inside an Effect only executes when an external `set` call is made on it. `effect` is also the only type in rippling that can modify state without relying on a `store`.

```typescript
const num = state(1);
const doubleEffect = effect((get, set) => {
  const double = get(num) * 2;
  set(num, double);
});
console.log(store.get(num)); // 1
store.set(doubleEffect);
console.log(store.get(num)); // 2
store.set(doubleEffect);
console.log(store.get(num)); // 4
```

## Subscription System

Rippling's subscription system is very different from Jotai's. First, Rippling's subscription callback must be an effect.

```typescript
export const userId = state(1);

export const userIdChangeEffect = effect((get, set) => {
  const userId = get(userId);
  // ...
});

// ...
import { userId, userIdChangeEffect } from "./atoms";

function setupPage() {
  const store = createStore();
  // ...
  store.sub(userId, userIdChangeEffect);
  // ...
}
```

The consideration here is to avoid having callbacks depend on the Store object, which was a key design consideration when creating Rippling. In Rippling, `sub` is the only API with reactive capabilities, and Rippling reduces the complexity of reactive computations by limiting Store usage.

Similarly, Rippling does not have APIs like `onMount`. This is because Rippling considers `onMount` to be fundamentally an effect, and providing APIs like `onMount` in `computed` would make the computation process non-idempotent. For example, operators like `loadable` cannot be implemented in Rippling.

As an alternative solution, operators like `loadable` should be implemented as Hooks in React rather than in Rippling.

## Manual Control of Store.sub Notifications

In Jotai, `sub` notifications are automatic - whenever the subscribed Atom or its upstream atoms change, all subscribed callbacks are automatically notified. This can create performance overhead, as shown in this common editor scenario.

```typescript
const width = atom(100);
const height = atom(100);
const area = computed(() => store.get(width) * store.get(height));
store.sub(area, () => {
  // ...
});

// this will trigger the callback twice
store.set(width, 200);
store.set(height, 200);
```

In this scenario, the area value is computed twice. For an editor like Motiff, frequent CPU usage can significantly slow down the editor's response time. Instead, we prefer to notify all subscribed callbacks once after the user interaction is complete.

```typescript
const width = state(100);
const height = state(100);
const computedArea = computed(() => store.get(width) * store.get(height));
store.sub(
  computedArea,
  effect(() => {
    // ...
  })
);

store.set(width, 200);
store.set(height, 200);
// ...
store.notify();
```

## Reactive is not first-class citizen

While Reactive Programming has natural advantages in decoupling View Components, it causes many complications for editor applications like Motiff.

Regardless of the original design semantics of `useEffect`, in the current environment, `useEffect`'s semantics are deeply bound to React's rendering behavior. When engineers use `useEffect`, they subconsciously think "callback me when these things change", especially "callback me when some async process is done". While it's easy to write such waiting code using `async/await`, it feels unnatural in React.

When designing Rippling, we wanted the trigger points for state changes to be completely detached from React's Mount/Unmount lifecycle and completely decoupled from React's rendering behavior. Rippling does not consider using React's `use` hook, nor does it consider using APIs like `suspense` and `ErrorBoundary`.
