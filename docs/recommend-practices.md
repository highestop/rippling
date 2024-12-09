# Recommend Practices

## Naming

Add the suffix `Atom` to `Value` and `Computed` and use `Effect` for `Effect`. Since we often need to get values from Atoms in many scenarios, adding the suffix after Atom can avoid naming conflicts.

```typescript
const countAtom = $value(0);
const doubleAtom = $computed((get) => get(countAtom) * 2);
const updateCountEffect = $effect((get, set, val) => {
  set(countAtom, val);
});

// ...
const count = get(countAtom) // will not conflict with normal value

// in react component
const updateCount = useSet(updateCountEffect) // Effect suffix is useful for this 

return <button onClick={() => updateCount(10)}>update</button>
```

## Do not use `store` directly

TODO

## Use `store.sub` with caution

TODO
