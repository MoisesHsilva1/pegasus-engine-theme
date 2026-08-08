import { PageHeader } from '@/components/shared/PageHeader'
import { EnvironmentOverview } from './EnvironmentOverview'
import { CurrentTheme } from './CurrentTheme'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChessKnight, Palette, ArrowRight, Layers, Cpu } from 'lucide-react'
import type { ActiveNav } from '@/components/shared/Sidebar'

interface HomeViewProps {
  onNavigate?: (nav: ActiveNav) => void
}

export function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <div className="max-w-4xl space-y-6 pb-8">
      <PageHeader title="Home" description="Manage and customize your Pegasus environment." />

      {/* Pegasus Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
                <ChessKnight className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Pegasus Engine Theme</span>
              <Badge variant="outline" className="font-mono text-[10px] border-primary/40 text-primary bg-primary/10">
                v1.0.0
              </Badge>
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Your environment, customized your way.
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Centralized desktop customization engine for Fedora Linux. Manage GNOME Shell themes, Alacritty terminal configurations, wallpapers, and developer tool styling from a single unified hub.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {onNavigate && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onNavigate('themes')}
                className="gap-2 h-9 px-4 text-xs font-medium shadow-none"
              >
                <Palette className="h-4 w-4" />
                <span>Explore Themes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Decorative background subtle brand glow */}
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      </div>

      {/* System Environment Metrics */}
      <EnvironmentOverview />

      {/* Active Theme Showcase */}
      <CurrentTheme onNavigate={onNavigate} />

      {/* Quick Action Navigation Hub */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions & Configuration Hub
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            onClick={() => onNavigate?.('themes')}
            className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80 flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated text-primary border border-border group-hover:border-primary/40">
                  <Palette className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  System Themes Browser
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                Browse and switch between curated Fedora GNOME theme profiles, editor palettes, and desktop wallpapers.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated text-primary border border-border">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-foreground">
                  Environment Integrations
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                Automated synchronization across GNOME Shell, Alacritty, and Zellij.
              </p>
            </div>
            <Cpu className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          </div>
        </div>
      </section>
    </div>
  )
}
