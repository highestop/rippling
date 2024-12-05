// @ts-check
import * as fs from "node:fs";
import * as path from "node:path";
import { babel } from "@rollup/plugin-babel";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRootDir = path.resolve(__dirname);

/** @type {import('./package.json')} */
const pkg = JSON.parse(
    fs.readFileSync("./package.json", { encoding: "utf-8" })
);

/** @type { import('rollup').RollupOptions } */
const commonConfig = {
    onwarn: (warning) => {
        throw new Error(warning?.message);
    },
    external: [
        ...Object.keys(pkg.peerDependencies),
    ]
}

/** @type { Record<string, { input: string, output: { cjs: string, esm: string, dts: { cjs: string, esm: string } } }> } */
const entries = {
        index: {
            input: "./src/index.ts",
            output: {
                cjs: "./dist/index.js",
                esm: "./dist/esm/index.mjs",
                dts: {
                    cjs: "./dist/index.d.ts",
                    esm: "./dist/esm/index.d.mts"
                }
            }
        },
        core: {
            input: "./src/core/index.ts",
            output: {
                cjs: "./dist/core.js",
                esm: "./dist/esm/core.mjs",
                dts: {
                    cjs: "./dist/core.d.ts",
                    esm: "./dist/esm/core.d.mts"
                }
            }
        },
        react: {
            input: "./src/react/index.ts",
            output: {
                cjs: "./dist/react.js",
                esm: "./dist/esm/react.mjs",
                dts: {
                    cjs: "./dist/react.d.ts",
                    esm: "./dist/esm/react.d.mts"
                }
            }
        },
    };

    /** @type { (entry: typeof entries[keyof typeof entries]) => import('rollup').RollupOptions } */
    const dtsConfig = (entry) => {
        return {
            ...commonConfig,
            input: entry.input,
            plugins: [
                dts({
                    respectExternal: true,
                    tsconfig: path.resolve(projectRootDir, "./tsconfig.json"),
                }),
            ],
            output: [
                {
                    file: entry.output.dts.cjs,
                },
                {
                    file: entry.output.dts.esm,
                },
            ],
        }
    };

    /** @type { (entry: typeof entries[keyof typeof entries]) => import('rollup').RollupOptions } */
    const sourceConfig = (entry) => ({
        ...commonConfig,
        input: entry.input,
        plugins: [
            nodeResolve({
                extensions: [".ts"],
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
                file: entry.output.cjs,
                format: "cjs",
            },
            {
                file: entry.output.esm,
                format: "es",
            },
        ],
    });

    /** @type { Array<import('rollup').RollupOptions> } */
    export default [
        ...Object.values(entries).flatMap((entry) => [
            sourceConfig(entry),
            dtsConfig(entry),
        ]),
    ];
