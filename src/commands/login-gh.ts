import { execFileSync } from 'node:child_process'
import { defineCommand } from 'citty'

export function isGhInstalled(): boolean {
  try {
    execFileSync('gh', ['--version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const main = defineCommand({
  meta: {
    name: 'login-gh',
    description: 'Authenticate the GitHub CLI and configure Git credential integration',
  },
  run() {
    if (!isGhInstalled()) {
      console.error(
        "GitHub CLI (gh) is not installed; skipping. Install it, then re-run 'smili login-gh'.",
      )
      process.exit(1)
    }

    try {
      execFileSync('gh', ['auth', 'status'], { stdio: 'ignore' })
      console.log('GitHub CLI: already authenticated.')
    } catch {
      console.log('GitHub CLI: launching interactive login...')
      execFileSync('gh', ['auth', 'login'], { stdio: 'inherit' })
    }

    execFileSync('gh', ['auth', 'setup-git'], { stdio: 'inherit' })
  },
})

export default main
