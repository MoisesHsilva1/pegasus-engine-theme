import type { TerminalConfig } from '@shared/types'

export class TerminalService {
  async getTerminalConfig(): Promise<TerminalConfig> {
    return {
      fontFamily: 'JetBrains Mono',
      fontSize: 13,
      themeName: 'Pegasus Dark',
      opacity: 0.95,
    }
  }
}
