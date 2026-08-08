import type { PegasusEngine } from '@main/engine'
import type { AppSettings, IpcResult } from '@shared/types'

export async function handleGetSettings(engine: PegasusEngine): Promise<IpcResult<AppSettings>> {
  try {
    const settings = await engine.settings.getSettings()
    return { success: true, data: settings }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return { success: false, error }
  }
}

export async function handleUpdateSettings(
  engine: PegasusEngine,
  updatePayload: unknown
): Promise<IpcResult<AppSettings>> {
  if (typeof updatePayload !== 'object' || updatePayload === null) {
    return { success: false, error: 'Invalid settings update payload' }
  }

  try {
    const updated = await engine.settings.updateSettings(updatePayload as Partial<AppSettings>)
    return { success: true, data: updated }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return { success: false, error }
  }
}
