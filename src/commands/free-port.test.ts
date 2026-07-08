import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findListeningPids } from './free-port.ts'

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
