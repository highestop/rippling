# Recommend Practices

## Naming

Add a suffix `Atom` to `Value` & `Computed`, and use `Effect` for `Effect`. Since we often need to get values from Atoms in many scenarios, adding the suffix after Atom can avoid naming conflicts.

```typescript
const countAtom = $value(0);
const doubleAtom = $computed((get) => get(countAtom) * 2);
const updateCountEffect = $effect((get, set, val) => {
  set(countAtom, val);
});
```

## Do not use `store` directly

TODO

## Use `store.sub` with caution

TODO
