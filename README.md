# smili

A small, dependency-light CLI of cross-repo developer utilities. Extracted from a monorepo
so it can be shared across repositories.

## Install

Run it on demand with `npx`:

```bash
npx @dev-smili/cli clean-git
npx @dev-smili/cli free-port 5173
```

Or install it globally to get the `smili` binary:

```bash
npm install -g @dev-smili/cli
smili clean-git
smili free-port 5173
```

## Commands

| Command                   | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `smili clean-git`         | Remove local branches whose remote tracking branch was deleted. |
| `smili clean-git --force` | Delete all stale branches without the interactive prompt.       |
| `smili free-port <port>`  | Kill any process listening on the given TCP port.               |

## Development

This repo ships a devcontainer (Node 24 + TypeScript + Biome, managed via `npm`).
Open the folder in VS Code and choose **Reopen in Container**.

```bash
npm install                    # installs deps (runs automatically in the devcontainer)
npm run check                  # biome lint/format (auto-fix) + tsc type check
npm run ci                     # biome lint + tsc type check (no writes, used in CI)
npm run test                   # run the unit tests with vitest
npm run build                  # bundle to dist/ with tsdown
npm run smili -- clean-git     # run the CLI locally from source (native TS via Node 24)
npm run smili -- free-port 5173
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the release process.
