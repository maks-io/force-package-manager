#!/usr/bin/env node
import minimist from "minimist";
import { getHelp } from "./getHelp";
import { forcePackageManager } from "./forcePackageManager";
import { allowedVerboseModes } from "./allowedVerboseModes";
import { allowedPkgManagers } from "./allowedPackageManagers";

const packageJson = require("../package.json");
const argv = minimist(process.argv.slice(2));

const { h, help, v, version, n, p, pmname, r, pmrange, o, output, ...rest } = argv;

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

if (p) {
  if (!allowedPkgManagers.includes(p)) {
    console.log(`Value for option -p invalid.\n`);
    console.log(getHelp(true));
    process.exit(0);
  }
}

if (pmname) {
  if (!allowedPkgManagers.includes(pmname)) {
    console.log(`Value for option -pmname invalid.\n`);
    console.log(getHelp(true));
    process.exit(0);
  }
}

if (o) {
  if (!allowedVerboseModes.includes(o)) {
    console.log(`Value for option -o invalid.\n`);
    console.log(getHelp(true));
    process.exit(0);
  }
}

if (output) {
  if (!allowedVerboseModes.includes(output)) {
    console.log(`Value for option -output invalid.\n`);
    console.log(getHelp(true));
    process.exit(0);
  }
}

const commandOutput = forcePackageManager(p || pmname, r || pmrange, o || output || "normal");
if (typeof commandOutput === "string" && commandOutput === "true") {
  console.log(commandOutput);
  process.exit(0);
} else {
  process.exit(1);
}
