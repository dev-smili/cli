import { execSync } from 'node:child_process'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStaleBranches } from './clean-git.ts'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
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
