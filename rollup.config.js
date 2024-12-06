// @ts-check
import * as fs from "node:fs";
import * as path from "node:path";
import { babel } from "@rollup/plugin-babel";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from '@rollup/plugin-node-resolve';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRootDir = path.resolve(__dirname);

/** @type {import('./package.json')} */
const pkg = JSON.parse(
    fs.readFileSync("./package.json", { encoding: "utf-8" }),
);

function generateTarget({ input, targetCJS, targetES, external, tsconfig }) {
    return [
        {
            input,
            onwarn: (warning) => {
                throw new Error(warning?.message);
            },
            external,
            plugins: [
                nodeResolve({
                    extensions: ['.ts']
                }),
                babel({
                    exclude: "node_modules/**",
                    extensions: [".ts"],
                    babelHelpers: "bundled",
                    configFile: path.resolve(projectRootDir, "./babel.config.json"),
                }),
            ],
            output: [
                {
                    file: targetCJS,
                    format: "cjs",
                },
                {
                    file: targetES,
                    format: "es",
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
                    tsconfig
                }),
            ],
            output: [
                {
                    file: targetCJS.replace(/\.cjs$/, ".d.cts"),
                },
                {
                    file: targetES.replace(/\.js$/, ".d.ts"),
                },
            ],
        },
    ]
}

/** @type { Array<import('rollup').RollupOptions> } */
export default [
    ...generateTarget({
        input: "./packages/aio/index.ts",
        targetCJS: './dist/index.cjs',
        targetES: './dist/index.js',
        external: ['react'],
        tsconfig: path.resolve(projectRootDir, "./tsconfig.json"),
    }),

    ...generateTarget({
        input: "./packages/core/index.ts",
        targetCJS: './dist/core.cjs',
        targetES: './dist/core.js',
        external: [],
        tsconfig: path.resolve(projectRootDir, "./packages/core/tsconfig.json"),
    }),

    ...generateTarget({
        input: "./packages/react/index.ts",
        targetCJS: './dist/react.cjs',
        targetES: './dist/react.js',
        external: [...Object.keys(pkg.peerDependencies)],
        tsconfig: path.resolve(projectRootDir, "./packages/react/tsconfig.json"),
    }),

    ...generateTarget({
        input: "./packages/debug/index.ts",
        targetCJS: './dist/debug.cjs',
        targetES: './dist/debug.js',
        external: [],
        tsconfig: path.resolve(projectRootDir, "./packages/debug/tsconfig.json"),
    }),
];
