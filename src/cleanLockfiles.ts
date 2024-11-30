import { PackageManagerName } from "identify-package-manager";
import * as fs from "node:fs";
import { log } from "./log";
import { VerboseMode } from "./allowedVerboseModes";
import { CheeseColors } from "cheese-log";
import { getLockfiles } from "./getLockfiles";
import { lockfileMapping } from "./lockfileMapping";

export const cleanLockfiles = (outputMode: VerboseMode, packageManagerName: PackageManagerName) => {
  const foundLockfiles = getLockfiles();

  const filesToRemove = foundLockfiles.filter((f) => f !== lockfileMapping[packageManagerName]);

  if (filesToRemove.length > 0) {
    log(outputMode, "normal", CheeseColors.blue, `\tLockfile clean-up necessary!`);
    log(outputMode, "verbose", CheeseColors.gray, `\tFound the following lockfiles: ${foundLockfiles.join(", ")}`);
    log(outputMode, "normal", CheeseColors.blue, `\tWill remove the following lockfiles: ${filesToRemove.join(", ")}`);
    filesToRemove.forEach((f) => {
      try {
        fs.unlinkSync(f);
      } catch (err) {}
    });
  }
};
