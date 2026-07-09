import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import freePort, { endProcess, findListeningPids } from './free-port.ts'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

vi.mock('node:os', () => ({
  platform: vi.fn(),
}))

const mockedExecSync = vi.mocked(execSync)
const mockedPlatform = vi.mocked(platform)

describe('findListeningPids', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('on unix-like platforms', () => {
    beforeEach(() => {
      mockedPlatform.mockReturnValue('linux')
    })

    it('parses lsof output into a list of PIDs', () => {
      mockedExecSync.mockReturnValue('1234\n5678')

      expect(findListeningPids('3000')).toEqual(['1234', '5678'])
    })

    it('returns an empty array when nothing is listening', () => {
      mockedExecSync.mockReturnValue('')

      expect(findListeningPids('3000')).toEqual([])
    })
  })

  describe('on windows', () => {
    beforeEach(() => {
      mockedPlatform.mockReturnValue('win32')
    })

    it('dedupes PIDs and only matches the exact port', () => {
      mockedExecSync.mockReturnValue(
        [
          '  TCP    127.0.0.1:3000    0.0.0.0:0    LISTENING    4321',
          '  TCP    [::1]:3000        [::]:0       LISTENING    4321',
          '  TCP    127.0.0.1:30000   0.0.0.0:0    LISTENING    9999',
        ].join('\n'),
      )

      expect(findListeningPids('3000')).toEqual(['4321'])
    })

    it('ignores entries with a PID of 0', () => {
      mockedExecSync.mockReturnValue(
        '  TCP    127.0.0.1:3000    0.0.0.0:0    LISTENING    0',
      )

      expect(findListeningPids('3000')).toEqual([])
    })
  })
})

describe('endProcess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('on unix-like platforms', () => {
    beforeEach(() => {
      mockedPlatform.mockReturnValue('linux')
    })

    it('sends SIGTERM by default', () => {
      const kill = vi.spyOn(process, 'kill').mockReturnValue(true)

      endProcess('1234', false)

      expect(kill).toHaveBeenCalledWith(1234, 'SIGTERM')
    })

    it('sends SIGKILL when force is set', () => {
      const kill = vi.spyOn(process, 'kill').mockReturnValue(true)

      endProcess('1234', true)

      expect(kill).toHaveBeenCalledWith(1234, 'SIGKILL')
    })
  })

  describe('on windows', () => {
    beforeEach(() => {
      mockedPlatform.mockReturnValue('win32')
    })

    it('uses taskkill without /F by default', () => {
      endProcess('4321', false)

      expect(mockedExecSync).toHaveBeenCalledWith(
        'taskkill /PID 4321',
        expect.objectContaining({ stdio: 'ignore' }),
      )
    })

    it('adds /F when force is set', () => {
      endProcess('4321', true)

      expect(mockedExecSync).toHaveBeenCalledWith(
        'taskkill /PID 4321 /F',
        expect.objectContaining({ stdio: 'ignore' }),
      )
    })
  })
})

describe('free-port command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects an invalid port before touching the system', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit')
    })

    expect(() => freePort.run?.({ args: { port: 'abc' } } as never)).toThrow('exit')
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Invalid port'))
    expect(exit).toHaveBeenCalledWith(1)
    expect(mockedExecSync).not.toHaveBeenCalled()
  })

  it('surfaces a distinct error when a process cannot be ended', () => {
    mockedPlatform.mockReturnValue('linux')
    mockedExecSync.mockReturnValue('1234')
    vi.spyOn(process, 'kill').mockImplementation(() => {
      throw new Error('EPERM')
    })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    freePort.run?.({ args: { port: '3000', force: false } } as never)

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to end process 1234 on port 3000'),
    )
  })
})
