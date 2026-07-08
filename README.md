# smili

A small, dependency-light CLI of cross-repo developer utilities. Extracted from a monorepo
so it can be shared across repositories.

## Commands

| Command                   | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `smili clean-git`         | Remove local branches whose remote tracking branch was deleted. |
| `smili clean-git --force` | Delete all stale branches without the interactive prompt.       |
| `smili free-port <port>`  | Kill any process listening on the given TCP port.               |

## Development

This repo ships a devcontainer (Node 24 + TypeScript + Biome, managed via `pnpm`/corepack).
Open the folder in VS Code and choose **Reopen in Container**.

```bash
pnpm install                # installs deps (runs automatically in the devcontainer)
pnpm run check              # biome lint + tsc type check
pnpm run check:fix          # auto-fix lint/format issues, then type check
pnpm exec smili clean-git   # run the CLI locally (native TS via Node 24)
pnpm exec smili free-port 5173
```

## Notes

The CLI currently runs directly from TypeScript source using Node 24's native type
stripping. Before publishing to npm it needs a build step so it runs on consumer machines
regardless of their Node version — this and the rest of the publish checklist live in
[plan.md](./plan.md).
