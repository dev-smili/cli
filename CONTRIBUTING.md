# Contributing

Thanks for your interest in improving `smili`!

## Getting started

This repo ships a devcontainer (Node 24 + TypeScript + Biome, managed via `npm`). Open the
folder in VS Code and choose **Reopen in Container**, or install dependencies locally:

```bash
npm install
```

## Development workflow

```bash
npm run smili -- clean-git       # run the CLI from source (native TS via Node 24)
npm run smili -- free-port 5173  # or any other subcommand + args
npm run check                    # biome lint + tsc type check (no writes, used in CI)
npm run check:fix                # biome lint/format (auto-fix) + tsc type check
npm run test                     # run the unit tests with vitest
npm run build                    # bundle to dist/ with tsdown
```

Before opening a pull request, make sure the following pass:

```bash
npm run check  # biome lint + tsc type check (no writes)
npm run test
npm run build
```

## Releasing

Releases are fully automated with [semantic-release](https://semantic-release.org/), driven
by [Conventional Commits](https://www.conventionalcommits.org/). Because we squash-merge,
each PR's (Conventional-Commit) title becomes a commit on `main`, which semantic-release
analyzes to determine the next version.

`"version"` in [package.json](./package.json) is intentionally pinned to `0.0.0` and never
edited — semantic-release computes the real version at release time and does **not** commit
it back to the repo. There is no `CHANGELOG.md`; release notes live on the GitHub Releases
page.

To cut a release:

1. Make sure the changes you want to ship are merged into `main`.
2. Trigger the [`Release`](./.github/workflows/release.yaml) workflow from the **Actions**
   tab (Run workflow). Tip: enable the **Dry run** input first to preview the next version
   and release notes without publishing anything.

semantic-release then:

- analyzes the commits since the last release and determines the next version,
- publishes to npm with provenance via [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers)
  (no npm token is stored in the repository),
- creates the `vX.Y.Z` git tag and a GitHub Release with generated notes.

> Notes:
>
> - **Dry run** (`dry_run: true`) runs the full analysis and prints the next version +
>   notes, but skips publishing, tagging, and the GitHub Release.
> - The npm trusted publisher must be configured once on npmjs.com for this repository and
>   the `Release` workflow file before the first release.
> - The first release will be `1.0.0`.
