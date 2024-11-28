import { cheese } from "cheese-log";
import { major, Range, satisfies, subset, valid, validRange } from "semver";
import { identifyPackageManager } from "identify-package-manager";

export const getWantedPackageManagerVersion = (pkgMngrVersionFromArgs?: string): string | Range | undefined => {
  cheese.infoBlack(`\tWas the package manager version restricted via command line?`);

  let semverRangeFromArgs: string | Range;
  if (pkgMngrVersionFromArgs) {
    if (!validRange(pkgMngrVersionFromArgs)) {
      cheese.infoRed(
        `\tYes, but value is invalid: '${pkgMngrVersionFromArgs}', but it must be a valid semver version range`,
      );
      throw new Error(`Failed.`); // TODO
    } else {
      cheese.infoGreen(`\tYes: '${pkgMngrVersionFromArgs}'`);
      semverRangeFromArgs = pkgMngrVersionFromArgs;
    }
  } else {
    cheese.infoBlack(`\tNo.`);
  }

  cheese.infoBlack(`\tDo we have a version of the project's package manager?`);

  const { version } = identifyPackageManager(false);
  const simpleVersion = version?.simple;

  if (simpleVersion) {
    if (!validRange(simpleVersion)) {
      cheese.infoRed(`\tYes, but it is not a valid semver version range: '${simpleVersion}'`);
      throw new Error(`Failed.`); // TODO
    } else {
      cheese.infoGreen(`\tYes: '${simpleVersion}'`);
    }
  } else {
    if (semverRangeFromArgs) {
      cheese.infoBlack(`\tNo, we only have a range restriction from the command line args`);
      return semverRangeFromArgs;
    } else {
      cheese.infoBlack(`\tNo, we have no version info at all`);
      return undefined;
    }
  }

  if (simpleVersion) {
    const isSpecificVersion = Boolean(valid(simpleVersion));

    if (semverRangeFromArgs) {
      if (isSpecificVersion) {
        cheese.infoBlack(
          `\tWe have a given version (${simpleVersion}) as well as a restriction (${semverRangeFromArgs}), let's validate if they go together...`,
        );
        if (!satisfies(simpleVersion, semverRangeFromArgs)) {
          cheese.infoRed(
            `\tNo, the project's package manager version is ${simpleVersion}, but the required semver version range: '${semverRangeFromArgs}'\n\tSeems like the project's configuration and the force-package-manager script are having conflicting setups`,
          );
          throw new Error(`Failed.`); // TODO
        } else {
          cheese.infoGreen(`\tYes`);
          return semverRangeFromArgs; // <- return the defined range from args
        }
      } else {
        cheese.infoBlack(
          `\tWe have a given version range (${simpleVersion}) as well as a restriction (${semverRangeFromArgs}), let's validate if they go together...`,
        );
        if (!subset(simpleVersion, semverRangeFromArgs)) {
          cheese.infoRed(
            `\tNo, the project's package manager version range is ${simpleVersion}, but the required semver version range: '${semverRangeFromArgs}'\n\tSeems like the project's configuration and the force-package-manager script are having conflicting setups`,
          );
          throw new Error(`Failed.`); // TODO
        } else {
          cheese.infoGreen(`\tYes`);
          return simpleVersion; // <- return the smallest allowed range
        }
      }
    } else {
      return simpleVersion;
    }
  }
};
