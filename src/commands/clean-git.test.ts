import { execSync } from 'node:child_process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import cleanGit, { getStaleBranches } from './clean-git.ts'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
  execFileSync: vi.fn(),
}))

const mockedExecSync = vi.mocked(execSync)

describe('getStaleBranches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns branches whose upstream tracking branch is gone', () => {
    mockedExecSync
      .mockReturnValueOnce('') // git fetch --prune
      .mockReturnValueOnce(
        [
          '  feature-a  abc1234 [origin/feature-a: gone] first commit',
          '* main       def5678 [origin/main] up to date',
          '  feature-b  aaa0000 [origin/feature-b: gone] second commit',
        ].join('\n'),
      )

    expect(getStaleBranches()).toEqual(['feature-a', 'feature-b'])
  })

  it('returns an empty array when no branches are stale', () => {
    mockedExecSync
      .mockReturnValueOnce('')
      .mockReturnValueOnce('* main def5678 [origin/main] up to date')

    expect(getStaleBranches()).toEqual([])
  })

  it('prunes remotes before inspecting local branches', () => {
    mockedExecSync.mockReturnValueOnce('').mockReturnValueOnce('')

    getStaleBranches()

    expect(mockedExecSync).toHaveBeenNthCalledWith(
      1,
      'git fetch --prune',
      expect.objectContaining({ stdio: 'pipe' }),
    )
  })
})

describe('clean-git command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exits with a friendly message when the git fetch fails', async () => {
    mockedExecSync.mockImplementation(() => {
      throw new Error('fatal: No remote repository specified.')
    })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit')
    })

    await expect(cleanGit.run?.({ args: { force: false } } as never)).rejects.toThrow(
      'exit',
    )
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('Could not check for stale branches'),
    )
    expect(exit).toHaveBeenCalledWith(1)
  })
})
