import * as path from "node:path";
import { babel } from "@rollup/plugin-babel";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const babelConfig = path.resolve(__dirname, "./babel.config.json")

export function createTarget(pkg) {
    const external = Object.keys(pkg.dependencies || {})
        .concat(Object.keys(pkg.peerDependencies || {}));

    const commonOptions = {
        input: "./src/index.ts",
        onwarn: (warning) => {
            throw new Error(warning?.message);
        },
        external,
    }

    return [
        {
            ...commonOptions,
            plugins: [
                nodeResolve({
                    extensions: [".ts"],
                }),
                babel({
                    exclude: "node_modules/**",
                    extensions: [".ts"],
                    babelHelpers: "bundled",
                    configFile: babelConfig,
                }),
            ],
            output: [
                {
                    file: pkg.exports.require,
                    format: "cjs",
                },
                {
                    file: pkg.exports.import,
                    format: "es",
                },
            ],
        },
        {
            ...commonOptions,
            plugins: [
                dts({
                    respectExternal: true,
                    tsconfig: path.resolve(__dirname, "../tsconfig.json"),
                }),
            ],
            output: [
                {
                    file: pkg.exports.require.replace(/\.cjs$/, ".d.cts"),
                },
                {
                    file: pkg.exports.import.replace(/\.js$/, ".d.ts"),
                },
            ],
        },
    ];
}
