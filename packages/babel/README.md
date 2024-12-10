# Rippling babel Preset

## Introduction

This is babel plugins for [Rippling](https://github.com/e7h4n/rippling). It helps Rippling developers debug more easily:

- Hot Module Reload Support, adds a global cacheMap to make each atom a singleton, avoiding duplicate atom creation caused by HMR
- Automatically adds Debug Labels by using babel to automatically add debug information to each atom for easier debugging

## Installation

npm

```
npm install --dev rippling-babel
```

yarn

```
yarn add -D rippling-babel
```

pnpm

```typescript
pnpm add -D rippling-babel
```

## Usage

```
// babel.config.json
{
  "presets": [["rippling-babel/preset"]]
}

// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: ['rippling-babel/preset'],
      },
    }),
  ],
});
```

## Options

Options:

- `projectRoot`: The root directory of the project, this path will be used to filter out local environment information when generating debug information. default: `undefined`
- `customAtomNames`: Custom atom method names, method calls matching these names will generate debug information and support Hot Module Reload. default: `['$value', '$computed', '$func']`

Pass a second argument to the preset to specify options.

```
// babel.config.json
{
  "presets": [["rippling-babel/preset", { "customAtomNames": ["$value", "$computed", "$func", "$action"] }]]
}

// vite.config.ts
export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: [['rippling-babel/preset', { projectRoot: __dirname }]],
      },
    }),
  ],
});
```

## Changelog

[Changelog](CHANGELOG.md)

## Special Thanks

Thanks [Jotai](https://github.com/pmndrs/jotai). Without their work, this project would not exist.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
