import * as fs from "node:fs";
import { createTarget } from "../../shared/rollup.config.mjs";


const pkg = JSON.parse(
    fs.readFileSync("./package.json", { encoding: "utf-8" }),
);

export default createTarget(pkg);