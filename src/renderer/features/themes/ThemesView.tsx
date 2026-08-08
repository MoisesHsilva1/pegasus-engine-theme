import * as React from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { CardTheme } from '@/components/ui/cardTheme'
import { themes as staticThemes, profileToThemeDefinition, type ThemeDefinition } from './data/themes'
import type { ThemeOperationResult } from '@shared/types'
import { useTranslation, type TranslationKey } from '@/context/LanguageContext'

export function ThemesView() {
  const { t } = useTranslation()
  const [applyingThemeId, setApplyingThemeId] = React.useState<string | null>(null)
  const [operationsMap, setOperationsMap] = React.useState<Record<string, ThemeOperationResult[]>>({})
  const [themeList, setThemeList] = React.useState<ThemeDefinition[]>(staticThemes)

  const loadThemes = React.useCallback(async () => {
    if (typeof window !== 'undefined' && window.pegasus?.themes?.list) {
      try {
        const res = await window.pegasus.themes.list()
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((profile) => {
            const fallback = staticThemes.find((st) => st.id === profile.id)
            return profileToThemeDefinition(profile, fallback)
          })
          setThemeList(mapped)
        }
      } catch {
        // Fall back to static themes on IPC failure
      }
    }
  }, [])

  React.useEffect(() => {
    loadThemes()
  }, [loadThemes])

  const handleApplyTheme = async (themeId: string) => {
    if (applyingThemeId) return // Prevent double click or parallel execution

    setApplyingThemeId(themeId)
    try {
      if (typeof window !== 'undefined' && window.pegasus?.themes?.apply) {
        const res = await window.pegasus.themes.apply(themeId)

        if (res.data?.operations) {
          setOperationsMap((prev) => ({
            ...prev,
            [themeId]: res.data!.operations,
          }))
        }
        if (res.success || (res.data && res.data.status !== 'FAILED')) {
          await loadThemes()
        }
      } else {
        // Fallback for non-electron environment preview
      }
    } catch {
      // Error handled silently or via operations map
    } finally {
      setApplyingThemeId(null)
    }
  }

  return (
    <div className="max-w-4xl space-y-5 pb-6">
      <PageHeader
        title={t('header.themesTitle')}
        description={t('header.themesDesc')}
      />

      {/* System Overview Bar */}
      <div className="rounded-lg border border-border bg-card/60 backdrop-blur-xs p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-semibold text-foreground">Pegasus Desktop Customizer</span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground font-mono text-[11px]">
          <span>{t('themes.availableThemes', { count: themeList.length })}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{t('themes.instantPreviews')}</span>
        </div>
      </div>

      {themeList.map((theme) => {
        const descriptionKey = `themeDescriptions.${theme.id}` as TranslationKey
        const translatedDescription = t(descriptionKey) || theme.description
        return (
          <CardTheme
            key={theme.id || theme.name}
            name={theme.name}
            description={translatedDescription}
            palette={theme.palette}
            wallpaper={theme.wallpaper}
            isApplying={applyingThemeId === theme.id}
            isApplyingAny={applyingThemeId !== null}
            operations={operationsMap[theme.id]}
            onApply={() => handleApplyTheme(theme.id)}
          />
        )
      })}
    </div>
  )
}

