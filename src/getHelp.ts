export const getHelp = (inclHeader = false) => {
  let help = "";
  if (inclHeader) {
    help += "Force Package Manager\n";
    help +=
      "A tool to check the running package manager against a pre-defined one (npm, pnpm, yarn classic, yarn berry)\n";
    help += "\n";
    help += "To detect the wanted package manager the tool does the following checks in sequence:\n";
    help += "\t1) Checks if package manager name and/or version were provided via command line arguments -p or -r (see below), if not...\n";
    help +=
      "\t2) ...checks if package manager is defined via packageManager property in package.json file, if not...\n";
    help +=
      "\t3) ...checks if project already has certain lock files, etc. If so it will derive the package manager from that, if not the script fails.\n";
  }
  help += "\n";
  help += "Usage:\n";
  help += "force-package-manager\n";
  help += "\n";
  help += "Options:\n";
  help += "-h, --help\t\tDisplay this help info\n";
  help += "-v, --version\t\tReturn this package's version number\n";
  help += "-p, --pmname\t\tDefines the wanted package manager\n";
  help += "\t\t\t(must be one of npm, pnpm, yarn classic, yarn berry)\n";
  help += "-r, --pmrange\t\tDefines the wanted package manager version range\n";
  help += "\t\t\t(must be a valid semver version or range)\n";
  return help;
};
