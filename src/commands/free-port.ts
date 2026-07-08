import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { defineCommand } from 'citty'

/**
 * Finds PIDs listening on the given port using platform-appropriate commands.
 * @param port - The TCP port number to search for
 * @returns An array of PID strings listening on the port
 */
function findListeningPids(port: string): string[] {
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

const main = defineCommand({
  meta: {
    name: 'free-port',
    description: 'Kill any process listening on the given TCP port',
  },
  args: {
    port: {
      type: 'positional',
      description: 'The TCP port to free',
      required: true,
    },
  },
  run({ args }) {
    const port = args.port

    try {
      const pids = findListeningPids(port)

      if (pids.length === 0) {
        console.log(`No process listening on port ${port}.`)
        return
      }

      if (platform() === 'win32') {
        for (const pid of pids) {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
          console.log(`Killed process ${pid} on port ${port}.`)
        }
      } else {
        for (const pid of pids) {
          process.kill(Number(pid), 'SIGTERM')
          console.log(`Killed process ${pid} on port ${port}.`)
        }
      }
    } catch {
      console.log(`No process listening on port ${port}.`)
    }
  },
})

export default main
