import { whoAmINow } from "who-am-i-now";
import { PackageManagerName } from "identify-package-manager";
import { cheese, CheeseColors } from "cheese-log";
import { getWantedPackageManagerName } from "./getWantedPackageManagerName";
import { getWantedPackageManagerVersion } from "./getWantedPackageManagerVersion";
import { Range, satisfies } from "semver";
import { getRunningPackageManagerInfo } from "./getRunningPackageManagerInfo";
import { allowedVerboseModes, VerboseMode } from "./allowedVerboseModes";
import { log } from "./log";

// TODO fix too many newlines in cheeselog
cheese.config({
  reportGlobalConfigChange: false,
  reportInitialization: false,
  showCheeseIcon: false,
  showLogLevel: false,
  showDate: false,
  forceNewlines: false,
});

const pkgPrefix = "force-package-manager";

export const forcePackageManager = (pkgMngrNameFromArgs?: string, pkgMngrVersionFromArgs?: string, outputMode: VerboseMode = "verbose") => {
  const who = whoAmINow();

  if (!who.isServerApp) {
    throw new Error("Library 'force-package-manager' can only be used server side.");
  }

  if (!allowedVerboseModes.includes(outputMode)) {
    throw new Error(`Invalid output mode '${outputMode}', should be one of ${allowedVerboseModes.map((o) => `'${o}'`).join(", ")}`);
  }

  log(outputMode, "normal", CheeseColors.blue, `==== ${pkgPrefix} =====`);

  let errorOccurred = false;

  log(outputMode, "normal", CheeseColors.blue, `\tStep 1/3 - detect wanted package manager - START`);

  let packageManagerName: PackageManagerName;
  let packageManagerVersion: string | Range | undefined;

  try {
    packageManagerName = getWantedPackageManagerName(outputMode, pkgMngrNameFromArgs);
    packageManagerVersion = getWantedPackageManagerVersion(outputMode, pkgMngrVersionFromArgs);

    log(outputMode, "normal", CheeseColors.blue, "\t\tDetected package manager name:");
    log(outputMode, "normal", CheeseColors.green, `\t\t${packageManagerName}`);
    log(outputMode, "normal", CheeseColors.blue, "\t\tDetected package manager version:");
    log(outputMode, "normal", CheeseColors.green, `\t\t${packageManagerVersion}`);
  } catch (e) {
    errorOccurred = true;
  }

  log(outputMode, "normal", CheeseColors.blue, `\tStep 1/3 - detect wanted package manager - DONE`);

  log(outputMode, "normal", CheeseColors.blue, `\tStep 2/3 - detect running package manager - START`);

  let packageManagerRunning;

  if (errorOccurred) {
    log(outputMode, "normal", "", `\t\t(skipped due to error)`);
  } else {
    try {
      packageManagerRunning = getRunningPackageManagerInfo();

      log(outputMode, "normal", CheeseColors.blue, "\t\tDetected package manager name:");
      log(outputMode, "normal", CheeseColors.green, `\t\t${packageManagerRunning.name}`);
      log(outputMode, "normal", CheeseColors.blue, "\t\tDetected package manager version:");
      log(outputMode, "normal", CheeseColors.green, `\t\t${packageManagerRunning.version}`);
    } catch (e) {
      errorOccurred = true;
    }
  }

  log(outputMode, "normal", CheeseColors.blue, `\tStep 2/3 - detect running package manager - DONE`);

  log(outputMode, "normal", CheeseColors.blue, `\tStep 3/3 - validate running package manager vs. wanted package manager - START`);

  if (errorOccurred) {
    log(outputMode, "normal", "", `\t\t(skipped due to error)`);
  } else {
    const isValid = packageManagerRunning.name === packageManagerName && satisfies(packageManagerRunning.version, packageManagerVersion);

    if (isValid) {
      log(outputMode, "normal", CheeseColors.green, `\t\tPackage manager '${packageManagerRunning.name}' with version ${packageManagerRunning.version} is valid!`);

      log(outputMode, "normal", CheeseColors.blue, `\tStep 3/3 - validate running package manager vs. wanted package manager - DONE`);

      return true;
    } else {
      if (packageManagerRunning.name !== packageManagerName) {
        log(outputMode, "mute", CheeseColors.red, `\t\tRunning Package manager is '${packageManagerRunning.name}', but should be '${packageManagerName}'!`);
      } else {
        log(outputMode, "mute", CheeseColors.red, `\t\tRunning Package manager version is '${packageManagerRunning.version}', which does not satisfy ${packageManagerVersion}!`);
      }
    }

    log(outputMode, "normal", CheeseColors.blue, `\tStep 3/3 - validate running package manager vs. wanted package manager - DONE`);
    log(outputMode, "normal", CheeseColors.blue, `=================================`);
    return false;
  }

  log(outputMode, "normal", CheeseColors.blue, `\tStep 3/3 - validate running package manager vs. wanted package manager - DONE`);
  log(outputMode, "normal", CheeseColors.blue, `=================================`);
};
