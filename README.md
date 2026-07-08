# smili

A small, dependency-light CLI of everyday developer utilities.

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
| `smili clean-git`         | Interactively remove local branches whose remote tracking branch was deleted. |
| `smili clean-git --force` | Delete all stale branches without the interactive prompt.       |
| `smili free-port <port>`  | Ends any process listening on the given TCP port.               |

## Contributions

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development
setup, workflow, and release process.
