# Contributing

Thanks for your interest in improving `smili`! We welcome all contributions, whether it's a typo fix, a bug report, or a shiny new command. This guide walks you through the contributor lifecycle, from setting up your environment to getting a pull request merged.

## AI Usage Policy

The use of AI tools (ChatGPT, Claude, Copilot, etc.) is encouraged. That said, everything you submit is your responsibility:

- **Review, understand, and validate everything** — AI-generated code should be read, understood, and tested before submission. If you can't explain it, don't submit it.
- **AI-written PR descriptions and review comments are fine** — but keep them concise, and remember it's still your job to read and sign off on them. Anything you post goes out under your name, so make sure it's accurate and says what you mean.

## Before you start

- **Check existing work** — Is there an open issue or PR discussing the change you want to make? Please consider joining that discussion first.
- **Open an issue for larger changes** — For anything beyond a small fix, opening an issue first lets us align on the approach before you invest your time.

## 1. Setup

`smili` is written in [TypeScript][typescript] and runs on [Node.js][nodejs] with native TS execution. There are two ways to get set up.

### Option A: Devcontainer (recommended)

The repo ships a devcontainer with Node, TypeScript, and [Biome][biome] preconfigured. Open the folder in VS Code and choose **Reopen in Container**. Dependencies are installed for you automatically.

### Option B: Manual setup

Install [Node.js][nodejs], then install the dependencies:

```bash
npm install
```

<br>

> [!NOTE]
> Local development requires **Node 24+**, because the CLI is run straight from its TypeScript source via Node's native type stripping. The **published** package is compiled to JavaScript and supports **Node 20+** (see `engines` in [package.json](./package.json)).

## 2. Making changes

Once you're set up, here's what to keep in mind as you work:

- **Code style** — Code is formatted and linted by [Biome][biome]. Run `npm run lint` to lint or `npm run lint:fix` to auto-fix and format.
- **Type checking** — Types are checked by the [TypeScript][typescript] compiler. Run `npm run typecheck` to type-check without emitting output.
- **Tests** — Add or update tests for your changes and keep them passing. Tests live alongside the code in `*.test.ts` files and run with [Vitest][vitest] via `npm run test`.

<br>

> [!NOTE]
> Run `npm run check` to do all of the above at once — lint, type-check, and tests together, matching CI.


Beyond the checks above, a couple of habits keep day-to-day work smooth:

- **Documentation** — Update the [README](./README.md) if you add or change a command.
- **Run from source** — Run the CLI from source while you work with `npm run smili -- <command>`:

  ```bash
  npm run smili -- clean-git       # run a subcommand from source (native TS via Node 24)
  npm run smili -- free-port 5173  # or any other subcommand + args
  ```

## 3. Submitting changes (Pull Requests)

Changes land on `main` through squash-merged pull requests, so the PR — NOT your branch history — is what matters. The typical flow:

- **Work on a feature branch** — Commit however and as often as you like; local commit messages are never inspected and get squashed away on merge.
- **Open a pull request when you're ready to merge** — Before opening, make sure `npm run check`, `npm run test`, and `npm run build` all pass locally. Because PRs are squash-merged, the PR itself must follow a few rules:

  - **Title** — Must follow [Conventional Commits][conventional-commits], since the release process depends on it (see [Releasing changes](#releasing-changes)) and it's enforced by CI. For example:

    ```
    feat: add free-port --dry-run flag
    fix: handle missing upstream in clean-git
    ```

  - **Description** — Becomes the commit message on `main`, so treat it as the intended commit body: explain what changed and why. Keep it clean and self-contained — use PR comments, not the description, for discussion, questions, and review back-and-forth.
  - **Links** — Reference any related issues or PRs.
- **Final review, then squash-merge** — Once CI checks pass and the PR is reviewed, it's squash-merged into `main` — the title becomes the commit and the description its message.

<br>

> [!NOTE]
> Each PR should generally be a single logical change to the codebase, as this keeps review focused and the history clean. If your work is incomplete or you'd like early feedback, open a **draft PR** to start the discussion before requesting a merge.

## Releasing changes

Merging a PR into `main` does **not** publish a release — it just lands your change. Publishing an actual version release is a separate, manually triggered step owned by the project maintainers, so as a contributor there's nothing extra you need to do here.

Releases are fully automated with [semantic-release][semantic-release], driven by the Conventional Commit PR titles that land on `main`. `"version"` in [package.json](./package.json) stays pinned to `0.0.0` — semantic-release computes the real version at release time and never commits it back, so there is no `CHANGELOG.md` (release notes live on the GitHub Releases page). When it's time to publish, a maintainer triggers the [`Release`](./.github/workflows/release.yaml) workflow from the **Actions** tab.

[typescript]: https://www.typescriptlang.org/
[nodejs]: https://nodejs.org/
[biome]: https://biomejs.dev/
[vitest]: https://vitest.dev/
[conventional-commits]: https://www.conventionalcommits.org/
[semantic-release]: https://semantic-release.org/
[oidc]: https://docs.npmjs.com/trusted-publishers
