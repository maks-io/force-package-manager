import { CheeseColors } from "cheese-log";
import { Range, satisfies, subset, valid, validRange } from "semver";
import { identifyPackageManager } from "identify-package-manager";
import { log } from "./log";
import { VerboseMode } from "./allowedVerboseModes";

export const getWantedPackageManagerVersion = (outputMode: VerboseMode, pkgMngrVersionFromArgs?: string): string | Range | undefined => {
  log(outputMode, "verbose", "", `\t\tWas the package manager version restricted via command line?`);

  let semverRangeFromArgs: string | Range;
  if (pkgMngrVersionFromArgs) {
    if (!validRange(pkgMngrVersionFromArgs)) {
      log(outputMode, "normal", CheeseColors.red, `\t\t→ Yes, but value is invalid: '${pkgMngrVersionFromArgs}', but it must be a valid semver version range`);
      throw new Error(`A semver version/range was provided via command line arguments, but it is not valid: ${pkgMngrVersionFromArgs}`);
    } else {
      log(outputMode, "verbose", CheeseColors.green, `\t\t→ Yes: '${pkgMngrVersionFromArgs}'`);
      semverRangeFromArgs = pkgMngrVersionFromArgs;
    }
  } else {
    log(outputMode, "verbose", "", `\t\t→ No.`);
  }

  log(outputMode, "verbose", "", `\t\tDo we have a version of the project's package manager?`);

  const { version } = identifyPackageManager(false);
  const simpleVersion = version?.simple;

  if (simpleVersion) {
    if (!validRange(simpleVersion)) {
      log(outputMode, "normal", CheeseColors.red, `\t\t→ Yes, but it is not a valid semver version range: '${simpleVersion}'`);
      throw new Error(`The semver version range that was retrieved is not valid: ${simpleVersion}`);
    } else {
      log(outputMode, "verbose", CheeseColors.green, `\t\t→ Yes: '${simpleVersion}'`);
    }
  } else {
    if (semverRangeFromArgs) {
      log(outputMode, "verbose", "", `\t\t→ No, we only have a range restriction from the command line args`);
      return semverRangeFromArgs;
    } else {
      log(outputMode, "verbose", "", `\t\t→ No, we have no version info at all`);
      return undefined;
    }
  }

  if (simpleVersion) {
    const isSpecificVersion = Boolean(valid(simpleVersion));

    if (semverRangeFromArgs) {
      if (isSpecificVersion) {
        log(outputMode, "verbose", "", `\t\tWe have a given version (${simpleVersion}) as well as a restriction (${semverRangeFromArgs}), let's validate if they go together...`);
        if (!satisfies(simpleVersion, semverRangeFromArgs)) {
          const errorReason = `The project's package manager version is ${simpleVersion}, but the required semver version range is ${semverRangeFromArgs}\n\t\tSeems like the project's configuration and the force-package-manager script are having conflicting setups`;
          log(outputMode, "verbose", CheeseColors.red, `\t\t→ No. ${errorReason}`);
          throw new Error(errorReason);
        } else {
          log(outputMode, "verbose", CheeseColors.green, `\t\t→ Yes`);
          return semverRangeFromArgs; // <- return the defined range from args
        }
      } else {
        log(outputMode, "verbose", "", `\t\tWe have a given version range (${simpleVersion}) as well as a restriction (${semverRangeFromArgs}), let's validate if they go together...`);
        if (!subset(simpleVersion, semverRangeFromArgs)) {
          const errorReason = `The project's package manager version range is ${simpleVersion}, but the required semver version range: '${semverRangeFromArgs}'\n\t\tSeems like the project's configuration and the force-package-manager script are having conflicting setups`;
          log(outputMode, "verbose", CheeseColors.red, `\t\t→ No. ${errorReason}`);
          throw new Error(errorReason);
        } else {
          log(outputMode, "verbose", CheeseColors.green, `\t\t→ Yes`);
          return simpleVersion; // <- return the smallest allowed range
        }
      }
    } else {
      return simpleVersion;
    }
  }
};
