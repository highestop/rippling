# Rippling

![NPM Type Definitions](https://img.shields.io/npm/types/rippling)
![NPM Version](https://img.shields.io/npm/v/rippling)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/rippling)
[![CI](https://github.com/e7h4n/rippling/actions/workflows/ci.yaml/badge.svg)](https://github.com/e7h4n/rippling/actions/workflows/ci.yaml)
[![Coverage Status](https://coveralls.io/repos/github/e7h4n/rippling/badge.svg?branch=main)](https://coveralls.io/github/e7h4n/rippling?branch=main)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0b68839fea9c990a3eb/maintainability)](https://codeclimate.com/github/e7h4n/rippling/maintainability)
[![CodSpeed Badge](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://codspeed.io/e7h4n/rippling)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Core Concepts

### Value

Value is the basic stateful unit in Rippling. They can be thought of as a simple key-value store.

For Example:

```typescript
const store = createStore();
const countAtom = $value(0);
store.set(countAtom, 1);
console.log(store.get(countAtom)); // 1
```

### Computed

Computed are the basic compute units in Rippling. They can read other Values / Computed.

For Example:

```typescript
const store = createStore();
const countAtom = $value(0);
const doubleCountAtom = $computed((get) => get(countAtom) * 2);
console.log(store.get(doubleCountAtom)); // 0
```

### Effect

Effect is the basic command unit in Rippling. It can read Value / Computed and write to Value / Effect.

For Example:

```typescript
const store = createStore();
const countAtom = $value(0);
const doubleCountAtom = $value(0);
const updateCountEffect = $effect((get, set, value) => {
  set(countAtom, value);
  set(doubleCountAtom, get(count) * 2);
});
store.set(updateCountEffect, 1);
console.log(store.get(countAtom)); // 1
console.log(store.get(doubleCountAtom)); // 2
```

## Changelog

[Changelog](packages/rippling/CHANGELOG.md)

## Special Thanks

Thanks [Jotai](https://github.com/pmndrs/jotai) for the inspiration and some code snippets, especially the test cases. Without their work, this project would not exist.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
