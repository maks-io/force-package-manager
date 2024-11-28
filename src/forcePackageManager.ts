import { whoAmINow } from "who-am-i-now";
import { identifyPackageManager, PackageManagerInfo, PackageManagerName } from "identify-package-manager";
import { cheese } from "cheese-log";
import { getWantedPackageManagerName } from "./getWantedPackageManagerName";
import { getWantedPackageManagerVersion } from "./getWantedPackageManagerVersion";
import { Range, satisfies } from "semver";
import { getRunningPackageManagerInfo } from "./getRunningPackageManagerInfo";

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

//TODO wrong type
export const forcePackageManager = (pkgMngrNameFromArgs?: string, pkgMngrVersionFromArgs?: string) => {
  const who = whoAmINow();

  if (!who.isServerApp) {
    throw new Error("Library 'force-package-manager' can only be used server side.");
  }

  cheese.infoBlue(`==== ${pkgPrefix} =====`);

  let errorOccurred = false;

  cheese.infoBlue(`Step 1/3 - detect wanted package manager - START`);

  let packageManagerName: PackageManagerName;
  let packageManagerVersion: string | Range | undefined;

  try {
    packageManagerName = getWantedPackageManagerName(pkgMngrNameFromArgs);
    packageManagerVersion = getWantedPackageManagerVersion(pkgMngrVersionFromArgs);

    cheese.infoBlue("\tDetected package manager name:");
    cheese.infoGreen(`\t${packageManagerName}`);
    cheese.infoBlue("\tDetected package manager version:");
    cheese.infoGreen(`\t${packageManagerVersion}`);
  } catch (e) {
    errorOccurred = true;
  }

  cheese.infoBlue(`Step 1/3 - detect wanted package manager - DONE`);

  cheese.infoBlue(`Step 2/3 - detect running package manager - START`);

  let packageManagerRunning;

  if (errorOccurred) {
    cheese.infoBlack(`\t(skipped due to error)`);
  } else {
    try {
      packageManagerRunning = getRunningPackageManagerInfo();

      cheese.infoBlue("\tDetected package manager name:");
      cheese.infoGreen(`\t${packageManagerRunning.name}`);
      cheese.infoBlue("\tDetected package manager version:");
      cheese.infoGreen(`\t${packageManagerRunning.version}`);
    } catch (e) {
      errorOccurred = true;
    }
  }

  cheese.infoBlue(`Step 2/3 - detect running package manager - DONE`);

  cheese.infoBlue(`Step 3/3 - validate running package manager vs. wanted package manager - START`);

  if (errorOccurred) {
    cheese.infoBlack(`\t(skipped due to error)`);
  } else {
    const isValid =
      packageManagerRunning.name === packageManagerName &&
      satisfies(packageManagerRunning.version, packageManagerVersion);

    if (isValid) {
      cheese.infoGreen(
        `\tPackage manager '${packageManagerRunning.name}' with version ${packageManagerRunning.version} is valid!`,
      );

      cheese.infoBlue(`Step 3/3 - validate running package manager vs. wanted package manager - DONE`);
      return true;
    } else {
      if (packageManagerRunning.name !== packageManagerName) {
        cheese.infoRed(
          `\tRunning Package manager is '${packageManagerRunning.name}', but should be '${packageManagerName}'!`,
        );
      } else {
        cheese.infoRed(
          `\tRunning Package manager version is '${packageManagerRunning.version}', which does not satisfy ${packageManagerVersion}!`,
        );
      }
    }

    cheese.infoBlue(`Step 3/3 - validate running package manager vs. wanted package manager - DONE`);
    return false;
  }
  cheese.infoBlue(`Step 3/3 - validate running package manager vs. wanted package manager - DONE`);
};
