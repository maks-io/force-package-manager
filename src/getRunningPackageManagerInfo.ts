import whichPmRuns from "which-pm-runs";
import { gte, SemVer } from "semver";
import { PackageManagerName } from "identify-package-manager";

export const getRunningPackageManagerInfo = (): {
  name: PackageManagerName;
  version: string | SemVer;
} => {
  const runningPM: { name: string; version: string } = whichPmRuns();
  if (runningPM.name === "yarn") {
    if (gte(runningPM.version, "2.0.0")) {
      // yarn berry
      return {
        name: "yarn-berry",
        version: runningPM.version,
      };
    } else {
      return {
        name: "yarn-classic",
        version: runningPM.version,
      };
    }
  } else {
    return { name: runningPM.name as PackageManagerName, version: runningPM.version };
  }
};
