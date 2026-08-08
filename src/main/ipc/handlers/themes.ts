import type { PegasusEngine } from '@main/engine'
import type { IpcResult, ThemeApplyResult, ThemeProfile } from '@shared/types'

export async function handleListThemes(engine: PegasusEngine): Promise<IpcResult<ThemeProfile[]>> {
  try {
    const list = await engine.themes.listThemes()
    return { success: true, data: list }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return { success: false, error }
  }
}

export async function handleApplyTheme(
  engine: PegasusEngine,
  themeId: unknown
): Promise<IpcResult<ThemeApplyResult>> {
  if (typeof themeId !== 'string' || !themeId.trim()) {
    return {
      success: false,
      error: 'Invalid themeId provided',
      data: {
        status: 'FAILED',
        themeId: String(themeId),
        operations: [],
        error: 'Invalid themeId provided',
      },
    }
  }

  try {
    const result = await engine.themes.applyTheme(themeId)
    return { success: result.status !== 'FAILED', data: result }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      error,
      data: {
        status: 'FAILED',
        themeId,
        operations: [],
        error,
      },
    }
  }
}
