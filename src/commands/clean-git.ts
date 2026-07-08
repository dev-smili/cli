import { execSync } from 'node:child_process'
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
    const branches = getStaleBranches()

    if (branches.length === 0) {
      console.log('No stale branches to clean up.')
      return
    }

    if (args.force) {
      for (const branch of branches) {
        execSync(`git branch -D ${branch}`, { stdio: 'inherit' })
      }
      console.log(`Deleted ${branches.length} branch(es).`)
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

    for (const branch of selected) {
      execSync(`git branch -D ${branch}`, { stdio: 'inherit' })
    }

    outro(`Deleted ${selected.length} branch(es).`)
  },
})

export default main
