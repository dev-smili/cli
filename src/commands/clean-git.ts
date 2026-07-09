import { execFileSync, execSync } from 'node:child_process'
import { cancel, intro, isCancel, multiselect, outro } from '@clack/prompts'
import { defineCommand } from 'citty'

/**
 * Returns local branches whose remote tracking branch has been deleted.
 * @returns Array of branch names that are stale
 */
export function getStaleBranches(): string[] {
  execSync('git fetch --prune', { stdio: 'pipe' })
  const branches = execSync('git branch -vv', { encoding: 'utf-8' })
  return branches
    .split('\n')
    .filter((line) => line.includes(': gone]'))
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean)
}

/**
 * Force-deletes the given local branches, continuing past any that fail.
 * @param branches - Branch names to delete
 * @returns The number of branches successfully deleted
 */
function deleteBranches(branches: string[]): number {
  let deleted = 0
  for (const branch of branches) {
    try {
      execFileSync('git', ['branch', '-D', branch], { stdio: 'inherit' })
      deleted++
    } catch {
      console.error(`Failed to delete branch '${branch}'.`)
    }
  }
  return deleted
}

const main = defineCommand({
  meta: {
    name: 'clean-git',
    description: 'Remove local branches whose remote tracking branch was deleted',
  },
  args: {
    force: {
      type: 'boolean',
      description: 'Delete all stale branches without prompting',
      default: false,
    },
  },
  async run({ args }) {
    let branches: string[]
    try {
      branches = getStaleBranches()
    } catch {
      console.error(
        'Could not check for stale branches. Make sure you are in a git repository with a configured remote.',
      )
      process.exit(1)
    }

    if (branches.length === 0) {
      console.log('No stale branches to clean up.')
      return
    }

    if (args.force) {
      const deleted = deleteBranches(branches)
      console.log(`Deleted ${deleted} branch(es).`)
      return
    }

    intro('Git Branch Cleanup')

    const selected = await multiselect({
      message: 'Select branches to delete (space to toggle, enter to confirm):',
      options: branches.map((b) => ({ value: b, label: b })),
      initialValues: branches,
    })

    if (isCancel(selected)) {
      cancel('Cancelled.')
      process.exit(0)
    }

    if (selected.length === 0) {
      outro('No branches selected.')
      return
    }

    const deleted = deleteBranches(selected)

    outro(`Deleted ${deleted} branch(es).`)
  },
})

export default main
