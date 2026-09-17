import { execFileSync } from 'node:child_process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import loginGh, { isGhInstalled } from './login-gh.ts'

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(),
}))

const mockedExecFileSync = vi.mocked(execFileSync)

describe('isGhInstalled', () => {
  beforeEach(() => {
    mockedExecFileSync.mockReset()
  })

  it('returns true when gh is available', () => {
    expect(isGhInstalled()).toBe(true)
    expect(mockedExecFileSync).toHaveBeenCalledWith(
      'gh',
      ['--version'],
      expect.objectContaining({ stdio: 'ignore' }),
    )
  })

  it('returns false when gh cannot be executed', () => {
    mockedExecFileSync.mockImplementationOnce(() => {
      throw new Error('ENOENT')
    })

    expect(isGhInstalled()).toBe(false)
  })
})

describe('login-gh command', () => {
  beforeEach(() => {
    mockedExecFileSync.mockReset()
    mockedExecFileSync.mockReturnValue('')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exits with an install message when gh is unavailable', () => {
    mockedExecFileSync.mockImplementation(() => {
      throw new Error('ENOENT')
    })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit')
    })

    expect(() => loginGh.run?.({ args: {} } as never)).toThrow('exit')
    expect(error).toHaveBeenCalledWith(expect.stringContaining('is not installed'))
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('skips login when already authenticated and sets up git', () => {
    loginGh.run?.({ args: {} } as never)

    expect(mockedExecFileSync).toHaveBeenNthCalledWith(
      1,
      'gh',
      ['--version'],
      expect.objectContaining({ stdio: 'ignore' }),
    )
    expect(mockedExecFileSync).toHaveBeenNthCalledWith(
      2,
      'gh',
      ['auth', 'status'],
      expect.objectContaining({ stdio: 'ignore' }),
    )
    expect(mockedExecFileSync).toHaveBeenNthCalledWith(
      3,
      'gh',
      ['auth', 'setup-git'],
      expect.objectContaining({ stdio: 'inherit' }),
    )
  })

  it('launches login when not authenticated before setting up git', () => {
    mockedExecFileSync.mockReturnValueOnce('').mockImplementationOnce(() => {
      throw new Error('not authenticated')
    })
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    loginGh.run?.({ args: {} } as never)

    expect(log).toHaveBeenCalledWith('GitHub CLI: launching interactive login...')
    expect(mockedExecFileSync).toHaveBeenNthCalledWith(
      3,
      'gh',
      ['auth', 'login'],
      expect.objectContaining({ stdio: 'inherit' }),
    )
    expect(mockedExecFileSync).toHaveBeenNthCalledWith(
      4,
      'gh',
      ['auth', 'setup-git'],
      expect.objectContaining({ stdio: 'inherit' }),
    )
  })
})
