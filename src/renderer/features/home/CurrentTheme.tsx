import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Palette, CheckCircle2, ArrowRight } from 'lucide-react'
import { themes } from '../themes/data/themes'
import type { ColorSwatch, WallpaperDetails } from '@/components/ui/cardTheme'
import type { ActiveNav } from '@/components/shared/Sidebar'

interface CurrentThemeProps {
  onNavigate?: (nav: ActiveNav) => void
}

interface Swatch {
  label: string
  color: string
}

function normalizePalette(rawPalette?: ColorSwatch[] | Record<string, string>): Swatch[] {
  if (Array.isArray(rawPalette)) return rawPalette
  if (rawPalette && typeof rawPalette === 'object') {
    return Object.entries(rawPalette).map(([label, color]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      color: String(color || '#141517'),
    }))
  }
  return [
    { label: 'Background', color: '#101010' },
    { label: 'Foreground', color: '#c8c8c8' },
    { label: 'Primary', color: '#a8c7b5' },
    { label: 'Accent', color: '#303030' },
    { label: 'Border', color: '#1a1a1a' },
  ]
}

function normalizeWallpaper(rawWallpaper?: string | WallpaperDetails): WallpaperDetails {
  if (typeof rawWallpaper === 'string') {
    return {
      name: rawWallpaper,
      resolution: '1920x1080',
      gradient: 'linear-gradient(135deg, #1a1c1e 0%, #26332c 50%, #141517 100%)',
    }
  }
  if (rawWallpaper && typeof rawWallpaper === 'object') {
    return rawWallpaper
  }
  return {
    name: 'Desktop Background',
    resolution: '3840x2160',
    gradient: 'linear-gradient(135deg, #1f232a 0%, #141517 100%)',
  }
}

export function CurrentTheme({ onNavigate }: CurrentThemeProps) {
  const [activeThemeId, setActiveThemeId] = React.useState<string>('matte-black')
  const [imgFailed, setImgFailed] = React.useState(false)

  React.useEffect(() => {
    const currentThemeAttr = document.documentElement.getAttribute('data-theme')
    if (currentThemeAttr) {
      setActiveThemeId(currentThemeAttr)
    }
  }, [])

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0]
  const activeName = activeTheme?.name || 'Matte Black'
  const activeDescription = activeTheme?.description || 'Dark graphite developer theme with desaturated sage accents.'

  const palette = normalizePalette(activeTheme?.palette)
  const wallpaper = normalizeWallpaper(activeTheme?.wallpaper)

  const activeTargets = [
    { name: 'GNOME Shell', status: 'Active' },
    { name: 'Alacritty', status: 'Active' },
    { name: 'Zellij', status: 'Active' },
  ]

  const primaryColor = palette.find((p) => p.label.toLowerCase() === 'primary')?.color || '#a8c7b5'
  const accentColor = palette.find((p) => p.label.toLowerCase() === 'accent')?.color || primaryColor

  const hasValidImage = Boolean(wallpaper.previewUrl) && !imgFailed

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Active Environment Theme
        </h2>
        {onNavigate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('themes')}
            className="h-6 text-xs text-primary hover:text-primary-hover gap-1 px-2 font-medium"
          >
            <span>Browse All Themes</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/30">
        <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-6">
          {/* Theme Meta Info */}
          <div className="flex flex-1 flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-primary border border-border">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {activeName}
                    </h3>
                    <Badge variant="accent" className="text-[10px] py-0.5 px-2 font-mono bg-success/15 text-success border border-success/30">
                      Applied
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">Graphite</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeDescription}
                  </p>
                </div>
              </div>

              {/* Color Swatch Ribbon */}
              <div className="rounded-lg bg-background p-2.5 border border-border space-y-1.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Active Palette Tokens
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {palette.map((swatch) => (
                    <div
                      key={swatch.label}
                      className="flex items-center gap-1.5 rounded border border-border bg-card p-1.5"
                    >
                      <div
                        className="h-3 w-3 rounded-full border border-white/10 shrink-0"
                        style={{ backgroundColor: swatch.color }}
                      />
                      <div className="min-w-0 flex-1 truncate">
                        <p className="text-[9px] font-medium text-muted-foreground truncate">{swatch.label}</p>
                        <p className="text-[9px] font-mono text-foreground font-semibold">{swatch.color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Integrations */}
            <div className="pt-2 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">Applied Targets:</span>
              {activeTargets.map((target) => (
                <div
                  key={target.name}
                  className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 text-xs font-medium text-foreground border border-border"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>{target.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Visual Preview Frame */}
          <div className="w-full md:w-[280px] shrink-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-background/50 shadow-xs group">
              {hasValidImage ? (
                <img
                  src={wallpaper.previewUrl}
                  alt={`${activeName} wallpaper preview`}
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{
                    background:
                      wallpaper.gradient ||
                      `linear-gradient(135deg, ${palette[0]?.color || '#141517'} 0%, ${palette[3]?.color || '#26332c'} 50%, ${palette[2]?.color || '#a8c7b5'} 100%)`,
                  }}
                />
              )}

              {/* Glassmorphic backdrop overlay */}
              <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

              {/* Mini Window Mockup */}
              <div className="absolute inset-2 flex flex-col justify-between rounded-lg border border-white/15 bg-black/45 p-2 text-white/90 backdrop-blur-md shadow-md">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500/80" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                    <span className="h-2 w-2 rounded-full bg-green-500/80" />
                    <span className="ml-1 font-mono text-[9px] text-white/70 truncate max-w-[100px]">
                      {activeName}.conf
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-[9px] py-0 px-1 font-mono">
                    Active
                  </Badge>
                </div>

                <div className="py-1 font-mono text-[10px] leading-tight space-y-0.5 select-none">
                  <div className="flex items-center gap-1">
                    <span style={{ color: primaryColor }}>const</span>
                    <span className="text-white/90">pegasus</span>
                    <span className="text-white/60">=</span>
                    <span style={{ color: accentColor }}>"{activeName}"</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/50">status:</span>
                    <span className="text-emerald-400 font-semibold">active</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-1 border-t border-white/10">
                  {palette.map((swatch) => (
                    <div
                      key={swatch.label}
                      className="h-2 flex-1 rounded-xs border border-white/20 shadow-2xs"
                      style={{ backgroundColor: swatch.color }}
                      title={`${swatch.label}: ${swatch.color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
