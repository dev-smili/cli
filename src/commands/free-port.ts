import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { defineCommand } from 'citty'

/**
 * Finds PIDs listening on the given port using platform-appropriate commands.
 * @param port - The TCP port number to search for
 * @returns An array of PID strings listening on the port
 */
export function findListeningPids(port: string): string[] {
  if (platform() === 'win32') {
    const output = execSync(
      `netstat -ano -p TCP | findstr "LISTENING" | findstr ":${port} "`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    ).trim()

    if (!output) return []

    const pids = new Set<string>()
    for (const line of output.split('\n')) {
      // netstat output format: Proto  Local Address  Foreign Address  State  PID
      const parts = line.trim().split(/\s+/)
      const localAddress = parts[1]
      const pid = parts[parts.length - 1]
      // Verify the port matches exactly (avoid :8080 matching :80)
      if (localAddress?.endsWith(`:${port}`) && pid && pid !== '0') {
        pids.add(pid)
      }
    }
    return [...pids]
  }

  const output = execSync(`lsof -ti "TCP:${port}" -sTCP:LISTEN || true`, {
    encoding: 'utf-8',
  }).trim()

  if (!output) return []
  return output.split('\n')
}

/**
 * Terminates a process by PID.
 * @param pid - The process ID to terminate
 * @param force - Use SIGKILL instead of SIGTERM when true
 */
export function killProcess(pid: string, force: boolean): void {
  if (platform() === 'win32') {
    // taskkill defaults to a graceful close; `/F` forces termination.
    execSync(`taskkill /PID ${pid}${force ? ' /F' : ''}`, { stdio: 'ignore' })
    return
  }

  process.kill(Number(pid), force ? 'SIGKILL' : 'SIGTERM')
}

const main = defineCommand({
  meta: {
    name: 'free-port',
    description: 'Gracefully terminate (SIGTERM) any process on the given TCP port',
  },
  args: {
    port: {
      type: 'positional',
      description: 'The TCP port to free',
      required: true,
    },
    force: {
      type: 'boolean',
      description: 'Use SIGKILL instead of the default SIGTERM',
      default: false,
    },
  },
  run({ args }) {
    const port = args.port
    const portNumber = Number(port)

    if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
      console.error(`Invalid port: ${port}. Provide a number between 1 and 65535.`)
      process.exit(1)
    }

    let pids: string[]
    try {
      pids = findListeningPids(port)
    } catch {
      // Some platforms' lookup commands exit non-zero when nothing matches.
      pids = []
    }

    if (pids.length === 0) {
      console.log(`No process listening on port ${port}.`)
      return
    }

    for (const pid of pids) {
      try {
        killProcess(pid, args.force)
        console.log(`Killed process ${pid} on port ${port}.`)
      } catch {
        const hint = args.force
          ? 'You may need elevated privileges.'
          : 'Try again with --force, or with elevated privileges.'
        console.error(`Failed to kill process ${pid} on port ${port}. ${hint}`)
      }
    }
  },
})

export default main
