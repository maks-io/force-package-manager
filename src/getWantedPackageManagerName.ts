import { identifyPackageManager, PackageManagerName } from "identify-package-manager";
import { CheeseColors } from "cheese-log";
import { allowedPkgManagers } from "./allowedPackageManagers";
import { VerboseMode } from "./allowedVerboseModes";
import { log } from "./log";

export const getWantedPackageManagerName = (outputMode: VerboseMode, pkgMngrNameFromArgs?: string): PackageManagerName => {
  log(outputMode, "verbose", "", `\t\tWas the package manager name defined via command line?`);

  if (pkgMngrNameFromArgs) {
    if (!allowedPkgManagers.includes(pkgMngrNameFromArgs as PackageManagerName)) {
      log(outputMode, "normal", CheeseColors.red, `\t\t→ Yes, but value is invalid: '${pkgMngrNameFromArgs}', but should be one of ${allowedPkgManagers.map((p) => `'${p}'`).join(", ")}`);
      throw new Error(`Failed.`);
    } else {
      log(outputMode, "verbose", CheeseColors.green, `\t\t→ Yes: '${pkgMngrNameFromArgs}'`);
      return pkgMngrNameFromArgs as PackageManagerName;
    }
  }
  log(outputMode, "verbose", "", `\t\t→ No.`);

  log(outputMode, "verbose", "", `\t\tWas the package manager name defined via package.json packageManager property, or is the project already installed via a certain package manager?`);

  const { name } = identifyPackageManager(false);

  if (!name || name === "unknown") {
    const errorReason = `Could not detect any info regarding wanted package manager.`;
    log(outputMode, "normal", CheeseColors.red, `\t\t→ No. ${errorReason}`);
    throw new Error(errorReason);
  } else {
    log(outputMode, "verbose", CheeseColors.green, `\t\t→ Yes, the package manager is: ${name}`);
    return name;
  }
};
