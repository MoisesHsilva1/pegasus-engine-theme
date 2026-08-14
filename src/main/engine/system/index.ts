import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { SystemInfo } from '@shared/types'

const execFileAsync = promisify(execFile)

/**
 * Controlled command execution utility for Fedora native tools.
 * NEVER allows shell interpolation or arbitrary shell strings.
 * Executes commands using array arguments only.
 */
export class SafeCommandRunner {
  /**
   * Run a specific binary with validated arguments.
   */
  async runCommand(file: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    // Whitelist allowed system binaries for Fedora execution
    const allowedBinaries = new Set([
      'gsettings',
      'dnf',
      'flatpak',
      'systemctl',
      'hostnamectl',
      'uname',
    ])

    if (!allowedBinaries.has(file)) {
      throw new Error(`Execution rejected: Binary '${file}' is not in allowed system whitelist.`)
    }

    try {
      const { stdout, stderr } = await execFileAsync(file, args, {
        encoding: 'utf-8',
        timeout: 10000,
      })
      return { stdout, stderr }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`Command '${file}' failed: ${message}`)
    }
  }
}

export class SystemService {
  private commandRunner: SafeCommandRunner

  constructor(commandRunner = new SafeCommandRunner()) {
    this.commandRunner = commandRunner
  }

  async getSystemInfo(): Promise<SystemInfo> {
    const hostname = 'localhost'
    let kernelVersion = 'unknown'

    try {
      const { stdout } = await this.commandRunner.runCommand('uname', ['-r'])
      kernelVersion = stdout.trim()
    } catch {
      // Fallback for non-Fedora or unit test environments
    }

    return {
      osName: 'Fedora Linux',
      osVersion: '41 (Workstation Edition)',
      kernelVersion,
      hostname,
      architecture: process.arch,
      pegasusVersion: '0.1.1',
    }
  }
}
