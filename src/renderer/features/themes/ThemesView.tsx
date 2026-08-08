import * as React from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { CardTheme } from '@/components/ui/cardTheme'
import { Badge } from '@/components/ui/badge'
import { themes as staticThemes, profileToThemeDefinition, type ThemeDefinition } from './data/themes'
import type { ThemeOperationResult } from '@shared/types'
import { useTranslation, type TranslationKey } from '@/context/LanguageContext'

export function ThemesView() {
  const { t } = useTranslation()
  const [appliedThemeId, setAppliedThemeId] = React.useState<string>('matte-black')
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
    if (typeof window !== 'undefined' && window.pegasus?.themes?.getActive) {
      try {
        const activeRes = await window.pegasus.themes.getActive()
        if (activeRes.success && activeRes.data) {
          setAppliedThemeId(activeRes.data.id)
        }
      } catch {
        // Fall back
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
          setAppliedThemeId(themeId)
          await loadThemes()
        }
      } else {
        // Fallback for non-electron environment preview
        setAppliedThemeId(themeId)
      }
    } catch {
      // Error handled silently or via operations map
    } finally {
      setApplyingThemeId(null)
    }
  }

  const activeTheme = themeList.find((t) => t.id === appliedThemeId) || themeList[0]

  return (
    <div className="max-w-4xl space-y-5 pb-6">
      <PageHeader
        title={t('header.themesTitle')}
        description={t('header.themesDesc')}
      />

      {/* Active Theme & System Overview Bar */}
      <div className="rounded-lg border border-border bg-card/60 backdrop-blur-xs p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-muted-foreground">{t('themes.activeProfile')}</span>
          <span className="font-semibold text-foreground">{activeTheme?.name || 'Matte Black'}</span>
          <Badge variant="secondary" className="font-mono text-[10px] py-0 px-2">
            {appliedThemeId}
          </Badge>
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
            isApplied={appliedThemeId === theme.id}
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

