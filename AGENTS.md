# AGENTS.md

A pi extension that adds `/clear`. The README describes what it does for users.

## Commands

- `bun install`, then `bun run check` (strict tsc) and `bun test tests`.

## Releases

- Bump `version` in `package.json` with every change users should get, then tag that commit `v<version>` (signed) and create a GitHub release titled `v<version>` whose notes say what changed and what users must do.
- Users install from GitHub (`pi install git:github.com/mhrstmnn/pi-clear`): the npm package `pi-clear` is the original by another author.
