import * as React from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/context/LanguageContext'
import type { Language } from '@shared/types'
import { Globe, Sliders } from 'lucide-react'

export function SettingsView() {
  const { language, setLanguage, t } = useTranslation()

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language)
  }

  return (
    <div className="max-w-4xl space-y-6 pb-8">
      <PageHeader
        title={t('header.settingsTitle')}
        description={t('header.settingsDesc')}
      />

      {/* Language Preferences Card */}
      <Card className="border-border bg-card">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-primary border border-border">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
                {t('settings.languageSectionTitle')}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {t('settings.languageSectionDesc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-background/50 p-4">
            <div className="space-y-0.5">
              <label
                htmlFor="language-select"
                className="text-xs font-semibold text-foreground block cursor-pointer"
              >
                {t('settings.selectLanguage')}
              </label>
              <p className="text-[11px] text-muted-foreground">
                {language === 'pt-BR'
                  ? 'Português (Brasil) ativo'
                  : 'English active'}
              </p>
            </div>

            <select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
              aria-label={t('settings.selectLanguage')}
              className="h-9 w-full sm:w-56 rounded-md border border-border bg-card px-3 text-xs text-foreground font-medium shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
            >
              <option value="en">{t('settings.english')}</option>
              <option value="pt-BR">{t('settings.ptBR')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* General Settings / Preferences Overview */}
      <Card className="border-border bg-card">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-primary border border-border">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
                {t('settings.appearanceSectionTitle')}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {t('settings.appearanceSectionDesc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-2 space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/50 p-4">
            <div>
              <p className="text-xs font-semibold text-foreground">{t('settings.darkMode')}</p>
              <p className="text-[11px] text-muted-foreground">{t('settings.darkModeDesc')}</p>
            </div>
            <span className="text-[11px] font-mono text-primary font-medium px-2 py-1 rounded bg-primary/10 border border-primary/20">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/50 p-4">
            <div>
              <p className="text-xs font-semibold text-foreground">{t('settings.autoApply')}</p>
              <p className="text-[11px] text-muted-foreground">{t('settings.autoApplyDesc')}</p>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground px-2 py-1 rounded bg-surface-elevated border border-border">
              Disabled
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/50 p-4">
            <div>
              <p className="text-xs font-semibold text-foreground">{t('settings.notifications')}</p>
              <p className="text-[11px] text-muted-foreground">{t('settings.notificationsDesc')}</p>
            </div>
            <span className="text-[11px] font-mono text-primary font-medium px-2 py-1 rounded bg-primary/10 border border-primary/20">
              Enabled
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
