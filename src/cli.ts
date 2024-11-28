#!/usr/bin/env node
import minimist from "minimist";
import { getHelp } from "./getHelp";
import { forcePackageManager } from "./forcePackageManager";

const packageJson = require("../package.json");
const argv = minimist(process.argv.slice(2));

const { h, help, v, version, n, p, pmname, r, pmrange, ...rest } = argv;

const remainingOptions = [...Object.keys(rest), ...rest._];

if (remainingOptions.length > 1) {
  console.log(`Option '${remainingOptions[1]}' unknown.\n`);
  console.log(getHelp(true));
  process.exit(0);
}

if (h || help) {
  console.log(getHelp(true));
  process.exit(0);
}

if (v || version) {
  console.log(packageJson.version);
  process.exit(0);
}

const output = forcePackageManager(p || pmname, r || pmrange);
if (typeof output === "string" && output === "true") {
  console.log(output);
  process.exit(0);
} else {
  process.exit(1);
}
