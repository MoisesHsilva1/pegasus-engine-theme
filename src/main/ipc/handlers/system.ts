import type { PegasusEngine } from '@main/engine'
import type { IpcResult, SystemInfo } from '@shared/types'

export async function handleGetSystemInfo(engine: PegasusEngine): Promise<IpcResult<SystemInfo>> {
  try {
    const info = await engine.system.getSystemInfo()
    return { success: true, data: info }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return { success: false, error }
  }
}
