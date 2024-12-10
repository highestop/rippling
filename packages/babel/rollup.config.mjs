// @ts-check
import * as fs from 'node:fs';
import * as path from 'node:path';
import { babel } from '@rollup/plugin-babel';
import { dts } from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { ModuleKind, ModuleResolutionKind } from 'typescript';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRootDir = path.resolve(__dirname);

/** @type {import('./package.json')} */
const pkg = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));
const extensions = ['.ts', '.js'];

function external(id) {
  return !id.startsWith('.') && !id.startsWith(projectRootDir);
}

function generateTarget({ input, targetCJS, targetES }) {
  const commonConfigs = {
    input,
    onwarn: (warning) => {
      throw new Error(warning?.message);
    },
    external,
  };
  return [
    {
      ...commonConfigs,
      plugins: [
        nodeResolve({
          extensions,
        }),
        babel({
          exclude: 'node_modules/**',
          extensions,
          babelHelpers: 'bundled',
          configFile: path.resolve(projectRootDir, './babel.config.json'),
        }),
      ],
      output: [
        {
          file: targetCJS,
          format: 'cjs',
        },
        {
          file: targetES,
          format: 'es',
        },
      ],
    },
    {
      ...commonConfigs,
      plugins: [
        dts({
          respectExternal: true,
          tsconfig: path.resolve(projectRootDir, './tsconfig.json'),
        }),
      ],
      output: [
        {
          file: targetES.replace(/\.js$/, '.d.ts'),
        },
        {
          file: targetCJS.replace(/\.cjs$/, '.d.cts'),
        },
      ],
    },
  ];
}

/** @type { Array<import('rollup').RollupOptions> } */
export default [
  ...generateTarget({
    input: './src/preset.ts',
    targetCJS: './dist/preset.cjs',
    targetES: './dist/preset.js',
  }),
  ...generateTarget({
    input: './src/plugin-debug-label.ts',
    targetCJS: './dist/plugin-debug-label.cjs',
    targetES: './dist/plugin-debug-label.js',
  }),

  ...generateTarget({
    input: './src/plugin-react-refresh.ts',
    targetCJS: './dist/plugin-react-refresh.cjs',
    targetES: './dist/plugin-react-refresh.js',
  }),
];
