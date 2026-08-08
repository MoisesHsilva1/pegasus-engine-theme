import { Cpu, HardDrive, Shield, Terminal } from 'lucide-react'
import { useTranslation } from '@/context/LanguageContext'

export function EnvironmentOverview() {
  const { t } = useTranslation()

  const specs = [
    { label: t('environment.os'), value: 'Fedora 44', icon: HardDrive },
    { label: t('environment.desktop'), value: 'GNOME', icon: Cpu },
    { label: t('environment.displayServer'), value: 'Wayland', icon: Terminal },
    { label: t('environment.pegasus'), value: '1.0.0', icon: Shield },
  ]

  return (
    <section className="space-y-1.5">
      <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t('environment.title')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {specs.map((spec) => {
          const Icon = spec.icon
          return (
            <div
              key={spec.label}
              className="flex items-center gap-2.5 rounded-md border border-border bg-card p-2.5 transition-colors hover:border-accent-border"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-elevated text-secondary-text">
                <Icon className="h-3 w-3 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {spec.label}
                </p>
                <p className="truncate text-xs font-semibold tracking-tight text-foreground">
                  {spec.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
