# force-package-manager 🚔📦

[![Version](https://img.shields.io/npm/v/force-package-manager)](https://www.npmjs.com/package/force-package-manager)

**npm** | **yarn-classic** | **yarn-berry** | **pnpm** | **bun**
... never mix package managers again!

A Command Line Tool to avoid that different team members use different package managers by accident, and therefor mess up your repository.

_Note: this tool clearly distinguishes between yarn version 1 ('classic') vs. yarn version 2+ ('berry')._

## Usage

Just add a `preinstall` script to your `package.json` file, like so:

```json
{
  "scripts": {
    "preinstall": "npx -l -y force-package-manager -p npm"
  }
}
```

A more detailed example with some options:

```json
{
  "scripts": {
    "preinstall": "npx -l -y force-package-manager -p npm -r '7.x.x' -o mute -c"
  }
}
```

The variant above additionally restricts the version range for `npm` to `7.x.x`, only prints minimal output due to `-o mute` and cleans up unwanted lockfiles in case of errors due to `-c`.

## How does it work

### Quick summary

The script works in 3 steps:

1. Tries to find the wanted package manager
2. Tries to find the currently running package manager
3. Compares them

### Detailed

Let us look at more details about the individual steps:

1. Tries to find the wanted package manager
   1. Checks if the wanted package manager is defined via the `-p` / `--pmname` option
   2. If not, it checks if the package manager is defined via the `packageManager` property in the `package.json` file. This is done with the [identify-package-manager](https://www.npmjs.com/package/identify-package-manager) package.
   3. If not, it checks if the project has already been installed and therefore a lockfile, which can tell us the wanted package manager as well. This is also done with the [identify-package-manager](https://www.npmjs.com/package/identify-package-manager) package.
2. Tries to find the currently running package manager
   1. This is done with the [which-pm-runs](https://www.npmjs.com/package/which-pm-runs) package.
3. Compares them
   1. First it compares if the package manager itself matches
   2. If yes, it also checks if the desired version range is satisfied (via the [semver](https://www.npmjs.com/package/semver) package).

<img src="./documentation/graph/force-package-manager.svg" alt="Force Package Manager" style="padding: 8px; background-color: white;" />

## Clean up step

In case an error occurs the script also allows to try and clean up any created lockfiles automatically, at the end.

Imagine the following scenario:

Your wanted package manager is `yarn-classic` and someone runs `npm install` accidentally. The `force-package-manager` script will detect the mismatch, however it cannot prevent `npm` from creating its `package-lock.json` lockfile. Due to this, we added a clean-up step via the `--clean` / `-c` option, which will automatically try and remove all lockfiles that do not belong to the wanted package manager.

## Options / Arguments

| option      | short option | description                                                                                                                                              | allowed values                                     | default value | example |
|-------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------| ------------- | ------- |
| `--version` | `-v`         | Display this package's version number                                                                                                                    | -                                                  | -             | -       |
| `--help`    | `-h`         | Display this package's help + usage info                                                                                                                 | -                                                  | -             | -       |
| `--pmname`  | `-p`         | Defines which package manager is wanted                                                                                                                  | `npm`, `yarn-classic`, `yarn-berry`, `pnpm`, `bun` | -             | `npm`   |
| `--pmrange` | `-r`         | Defines a restricting version range for the wanted package manager                                                                                       | Any valid semver range                             | -             | `"> 4"` |
| `--clean`   | `-c`         | Activates the clean-up step at the end of the script, in case of errors (see above)                                                                      | -                                                  | -             |  |
| `--output`  | `-o`         | Defines how many messages are being printed during the process. Use `mute` if you do not want to see any information except for negative script results. | `mute`, `normal`, `verbose`                        | `normal`      | `mute`  |
