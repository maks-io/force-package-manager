import { PackageManagerName } from "identify-package-manager";

export const lockfileMapping: Record<PackageManagerName, string> = {
  npm: "package-lock.json",
  "yarn-classic": "yarn.lock",
  "yarn-berry": "yarn.lock",
  pnpm: "pnpm-lock.yaml",
  bun: "bun.lockb",
  unknown: "unknown",
};
