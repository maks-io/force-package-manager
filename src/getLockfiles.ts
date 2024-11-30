import { identifyMonorepoRoot } from "identify-monorepo-root";
import fs from "node:fs";
import { lockfileMapping } from "./lockfileMapping";

export const getLockfiles = () => {
  const monorepoRoot = identifyMonorepoRoot();
  const files: string[] = fs.readdirSync(monorepoRoot);
  let foundLockfiles: string[] = [];
  Object.values(lockfileMapping).forEach((lockfile) => {
    foundLockfiles.push(...files.filter((f) => f === lockfile));
  });
  return Array.from(new Set(foundLockfiles));
};
