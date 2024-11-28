import { identifyPackageManager, PackageManagerName } from "identify-package-manager";
import { cheese } from "cheese-log";
import { allowedPkgManagers } from "./allowedPackageManagers";

export const getWantedPackageManagerName = (pkgMngrNameFromArgs?: string): PackageManagerName => {
  cheese.infoBlack(`\tWas the package manager name defined via command line?`);

  if (pkgMngrNameFromArgs) {
    if (!allowedPkgManagers.includes(pkgMngrNameFromArgs as PackageManagerName)) {
      cheese.infoRed(
        `\tYes, but value is invalid: '${pkgMngrNameFromArgs}', but should be one of ${allowedPkgManagers.map((p) => `'${p}'`).join(", ")}`,
      );
      throw new Error(`Failed.`); // TODO
    } else {
      cheese.infoGreen(`\tYes: '${pkgMngrNameFromArgs}'`);
      return pkgMngrNameFromArgs as PackageManagerName;
    }
  }
  cheese.infoBlack(`\tNo.`);

  cheese.infoBlack(
    `\tWas the package manager name defined via package.json packageManager property, or is the project already installed via a certain package manager?`,
  );

  const { name, version } = identifyPackageManager(false);

  if (!name || name === "unknown") {
    cheese.infoRed(`\tNo, could not detect any info regarding wanted package manager.`);
    throw new Error(`Failed.`); // TODO
  } else {
    cheese.infoGreen(`\tYes, the package manager is: ${name}`);
    return name;
  }
};
