# Rippling

![NPM Type Definitions](https://img.shields.io/npm/types/rippling)
![NPM Version](https://img.shields.io/npm/v/rippling)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/rippling)
[![CI](https://github.com/e7h4n/rippling/actions/workflows/ci.yaml/badge.svg)](https://github.com/e7h4n/rippling/actions/workflows/ci.yaml)
[![Coverage Status](https://coveralls.io/repos/github/e7h4n/rippling/badge.svg?branch=main)](https://coveralls.io/github/e7h4n/rippling?branch=main)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0b68839fea9c990a3eb/maintainability)](https://codeclimate.com/github/e7h4n/rippling/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Core Concepts

### Atom

Atom are the basic stateful units in Rippling. The can be thought of as a simple key-value store.

For Example:

```typescript
const store = createStore();
const count = atom(0);
store.set(count, 1);
console.log(store.get(count)); // 1
```

### Ripple

Ripple are the basic compute units in Rippling. The can read other Atom / Ripple / Drip.

For Example:

```typescript
const store = createStore();
const count = atom(0);
const doubleCount = ripple((get) => get(count) * 2);
console.log(store.get(doubleCount)); // 0
```

### Drip

Drip are the basic action units in Rippling. The can read other Atom / Ripple / Drip and write to Atom / Drip.

For Example:

```typescript
const store = createStore();
const count = atom(0);
const doubleCount = atom(0);
const updateCount = drip((get, set, value) => {
  set(count, value);
  set(doubleCount, get(count) * 2);
});
store.set(updateCount, 1);
console.log(store.get(count)); // 1
console.log(store.get(doubleCount)); // 2
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
