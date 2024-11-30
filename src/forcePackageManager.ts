import { whoAmINow } from "who-am-i-now";
import { PackageManagerName } from "identify-package-manager";
import { cheese, CheeseColors } from "cheese-log";
import { getWantedPackageManagerName } from "./getWantedPackageManagerName";
import { getWantedPackageManagerVersion } from "./getWantedPackageManagerVersion";
import { Range, satisfies } from "semver";
import { getRunningPackageManagerInfo } from "./getRunningPackageManagerInfo";
import { allowedVerboseModes, VerboseMode } from "./allowedVerboseModes";
import { log } from "./log";
import { cleanLockfiles } from "./cleanLockfiles";

cheese.config({
  reportGlobalConfigChange: false,
  reportInitialization: false,
  showCheeseIcon: false,
  showLogLevel: false,
  showDate: false,
  forceNewlines: false,
});

const pkgPrefix = "force-package-manager";

const step1Title = "Step 1/3 - detect wanted package manager";
const step2Title = "Step 2/3 - detect running package manager";
const step3Title = "Step 3/3 - validate running package manager vs. wanted package manager";

export const forcePackageManager = (pkgMngrNameFromArgs?: string, pkgMngrVersionFromArgs?: string, clean?: boolean, outputMode: VerboseMode = "verbose") => {
  const who = whoAmINow();

  if (!who.isServerApp) {
    throw new Error("Library 'force-package-manager' can only be used server side.");
  }

  if (!allowedVerboseModes.includes(outputMode)) {
    throw new Error(`Invalid output mode '${outputMode}', should be one of ${allowedVerboseModes.map((o) => `'${o}'`).join(", ")}`);
  }

  log(outputMode, "normal", CheeseColors.blue, `==== ${pkgPrefix} =====`);

  let error = "";

  ///// Step 1/3 /////

  log(outputMode, "normal", CheeseColors.blue, `\t${step1Title} - START`);

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
    error = e.message;
  }

  if (error) {
    log(outputMode, "normal", CheeseColors.red, `\t${step1Title} - DONE WITH ERROR`);
    log(outputMode, "normal", CheeseColors.gray, `\t${step2Title} - SKIPPED`);
    log(outputMode, "normal", CheeseColors.gray, `\t${step3Title} - SKIPPED`);
  } else {
    log(outputMode, "normal", CheeseColors.blue, `\t${step1Title} - DONE`);
  }

  ///// Step 2/3 /////

  let packageManagerRunning;

  if (!error) {
    log(outputMode, "normal", error ? CheeseColors.gray : CheeseColors.blue, `\t${step2Title} - START`);
    try {
      packageManagerRunning = getRunningPackageManagerInfo();

      log(outputMode, "normal", CheeseColors.blue, "\t\tDetected package manager name:");
      log(outputMode, "normal", CheeseColors.green, `\t\t${packageManagerRunning.name}`);
      log(outputMode, "normal", CheeseColors.blue, "\t\tDetected package manager version:");
      log(outputMode, "normal", CheeseColors.green, `\t\t${packageManagerRunning.version}`);
    } catch (e) {
      error = e.message;
    }

    if (error) {
      log(outputMode, "normal", CheeseColors.red, `\t${step2Title} - DONE WITH ERROR`);
      log(outputMode, "normal", CheeseColors.gray, `\t${step3Title} - SKIPPED`);
    } else {
      log(outputMode, "normal", CheeseColors.blue, `\t${step2Title} - DONE`);
    }
  }

  ///// Step 3/3 /////

  let isValid = false;
  if (!error) {
    log(outputMode, "normal", error ? CheeseColors.gray : CheeseColors.blue, `\t${step3Title} - START`);

    isValid = packageManagerRunning.name === packageManagerName && satisfies(packageManagerRunning.version, packageManagerVersion);

    if (isValid) {
      log(outputMode, "normal", CheeseColors.green, `\t\tPackage manager '${packageManagerRunning.name}' with version ${packageManagerRunning.version} is valid!`);
    } else {
      if (packageManagerRunning.name !== packageManagerName) {
        const errorReason = `\t\tRunning Package manager is '${packageManagerRunning.name}', but should be '${packageManagerName}'!`;
        error = errorReason;
        log(outputMode, "normal", CheeseColors.red, errorReason);
      } else {
        const errorReason = `\t\tRunning Package manager version is '${packageManagerRunning.version}', which does not satisfy ${packageManagerVersion}!`;
        error = errorReason;
        log(outputMode, "normal", CheeseColors.red, errorReason);
      }
    }

    if (error) {
      log(outputMode, "normal", CheeseColors.red, `\t${step3Title} - DONE WITH ERROR`);
    } else {
      log(outputMode, "normal", CheeseColors.blue, `\t${step3Title} - DONE`);
    }
  }

  if (error) {
    if (clean && packageManagerName) {
      cleanLockfiles(outputMode, packageManagerName);
    } else {
      if (!packageManagerRunning) {
        try {
          // this is an additional step, in case error already occurred during step 1
          packageManagerRunning = getRunningPackageManagerInfo();
        } catch (e) {}
      }
      if (packageManagerRunning.name !== packageManagerName) {
        log(
          outputMode,
          "mute",
          CheeseColors.yellow,
          `WARNING: since the running package manager (${packageManagerRunning.name}) is different from the wanted one (${packageManagerName}), a new lockfile could have just been created. Consider using the script's --clean / -c option to automatically remove it.`,
        );
      }
    }

    log(outputMode, "normal", CheeseColors.red, `SUMMARY: Package Manager Validation Error:`);
    log(outputMode, "mute", CheeseColors.red, `${error.replace(/\t/g, "")}`);
  }

  log(outputMode, "normal", CheeseColors.blue, `=================================`);
  return !error;
};
