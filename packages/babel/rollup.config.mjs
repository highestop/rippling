// @ts-check
import * as fs from 'node:fs';
import * as path from 'node:path';
import { babel } from '@rollup/plugin-babel';
import { dts } from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { ModuleKind } from 'typescript';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRootDir = path.resolve(__dirname);

/** @type {import('./package.json')} */
const pkg = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));

function generateTarget({ input, targetCJS, targetES, external }) {
  return [
    {
      input,
      onwarn: (warning) => {
        throw new Error(warning?.message);
      },
      external,
      plugins: [
        nodeResolve({
          extensions: ['.ts'],
        }),
        commonjs(),
        babel({
          exclude: 'node_modules/**',
          extensions: ['.ts'],
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
      input,
      onwarn: (warning) => {
        throw new Error(warning?.message);
      },
      external,
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
      ],
    },
    {
      input,
      onwarn: (warning) => {
        throw new Error(warning?.message);
      },
      external,
      plugins: [
        dts({
          respectExternal: true,
          tsconfig: path.resolve(projectRootDir, './tsconfig.json'),
          compilerOptions: {
            module: ModuleKind.CommonJS,
            verbatimModuleSyntax: false,
          },
        }),
      ],
      output: [
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
    external: [...Object.keys(pkg.peerDependencies)],
  }),
  ...generateTarget({
    input: './src/plugin-debug-label.ts',
    targetCJS: './dist/plugin-debug-label.cjs',
    targetES: './dist/plugin-debug-label.js',
    external: [...Object.keys(pkg.peerDependencies)],
  }),

  ...generateTarget({
    input: './src/plugin-react-refresh.ts',
    targetCJS: './dist/plugin-react-refresh.cjs',
    targetES: './dist/plugin-react-refresh.js',
    external: [...Object.keys(pkg.peerDependencies)],
  }),
];
