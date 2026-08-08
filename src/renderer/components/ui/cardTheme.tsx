import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Palette, ChevronDown, ChevronUp, Check, Terminal, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import type { ThemeOperationResult } from '@shared/types'

export interface ColorSwatch {
  label: string
  color: string
}

export interface WallpaperDetails {
  name: string
  previewUrl?: string
  gradient?: string
  resolution?: string
}

export interface CardThemeProps {
  name: string
  description: string
  badgeText?: string
  isApplied?: boolean
  isApplying?: boolean
  isApplyingAny?: boolean
  operations?: ThemeOperationResult[]
  palette?: ColorSwatch[] | Record<string, string>
  wallpaper?: string | WallpaperDetails
  onApply?: () => void
}

function normalizePalette(palette?: ColorSwatch[] | Record<string, string>): ColorSwatch[] {
  if (Array.isArray(palette)) return palette

  if (palette && typeof palette === 'object') {
    return Object.entries(palette).map(([label, color]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      color: color || '#141517',
    }))
  }

  return [
    { label: 'Background', color: '#141517' },
    { label: 'Foreground', color: '#e8ebe9' },
    { label: 'Primary', color: '#a8c7b5' },
    { label: 'Accent', color: '#26332c' },
    { label: 'Border', color: '#2d3033' },
  ]
}

function normalizeWallpaper(name: string, wallpaper?: string | WallpaperDetails): WallpaperDetails {
  if (typeof wallpaper === 'string') {
    return {
      name: wallpaper,
      resolution: '1920x1080',
      gradient: 'linear-gradient(135deg, #1a1c1e 0%, #26332c 50%, #141517 100%)',
    }
  }

  if (wallpaper && typeof wallpaper === 'object') {
    return wallpaper
  }

  return {
    name: `${name} Desktop Background`,
    resolution: '1920x1080',
    gradient: 'linear-gradient(135deg, #1f232a 0%, #141517 100%)',
  }
}

const CardTheme = ({
  name,
  description,
  badgeText = 'Available',
  isApplied = false,
  isApplying = false,
  isApplyingAny = false,
  operations,
  palette,
  wallpaper,
  onApply,
}: CardThemeProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [imgFailed, setImgFailed] = React.useState(false)

  React.useEffect(() => {
    if (isApplying || (operations && operations.length > 0)) {
      setIsExpanded(true)
    }
  }, [isApplying, operations])

  const normalizedPalette = normalizePalette(palette)
  const normalizedWallpaper = normalizeWallpaper(name, wallpaper)
  const detailsId = `theme-details-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
  const failedOps = operations?.filter((op) => op.status === 'FAILED' || op.status === 'WARNING')

  const bgColor = normalizedPalette.find((p) => p.label.toLowerCase() === 'background')?.color || '#141517'
  const primaryColor = normalizedPalette.find((p) => p.label.toLowerCase() === 'primary')?.color || '#a8c7b5'
  const accentColor = normalizedPalette.find((p) => p.label.toLowerCase() === 'accent')?.color || primaryColor
  const borderColor = normalizedPalette.find((p) => p.label.toLowerCase() === 'border')?.color || '#2d3033'

  const hasValidImage = Boolean(normalizedWallpaper.previewUrl) && !imgFailed

  return (
    <Card
      className={`relative flex flex-col overflow-hidden transition-all duration-300 ${
        isApplied
          ? 'border-primary/80 bg-card shadow-xs ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      {isApplied && <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l bg-primary" />}

      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-stretch justify-between">
        {/* Left Column: Theme Information & Actions */}
        <section aria-label={`${name} theme details`} className="flex flex-1 flex-col justify-between min-w-0">
          <CardHeader className="p-0 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-2xs transition-transform"
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  color: primaryColor,
                }}
              >
                <Palette className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base font-semibold text-foreground tracking-tight">{name}</CardTitle>
                  <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0.5">
                    {badgeText}
                  </Badge>
                  {isApplied && (
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/50 text-primary bg-primary/10">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          {/* Action Bar */}
          <div className="flex items-center gap-2 pt-4 mt-auto">
            {isApplying ? (
              <Button variant="default" size="sm" disabled className="min-w-[95px] gap-1.5 h-8 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Applying...</span>
              </Button>
            ) : isApplied ? (
              <Badge
                variant="accent"
                className="flex h-8 items-center gap-1.5 border border-success/30 bg-success/15 px-3 font-mono text-xs text-success"
              >
                <Check className="h-3.5 w-3.5 text-success" />
                Applied
              </Badge>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onApply}
                disabled={isApplyingAny}
                aria-label={`Apply ${name} theme`}
                className="h-8 px-4 text-xs font-medium"
              >
                Apply
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={detailsId}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${name} theme details`}
              className="h-8 gap-1.5 text-xs"
            >
              <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </section>

        {/* Right Column: Dynamic Theme Visual Preview Frame */}
        <section aria-label={`${name} wallpaper preview`} className="w-full md:w-[300px] shrink-0">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-background/50 shadow-xs group">
            {hasValidImage ? (
              <img
                src={normalizedWallpaper.previewUrl}
                alt={`${name} wallpaper preview`}
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{
                  background:
                    normalizedWallpaper.gradient ||
                    `linear-gradient(135deg, ${bgColor} 0%, ${borderColor} 50%, ${primaryColor} 100%)`,
                }}
              />
            )}

            {/* Dark glassmorphic backdrop for contrast */}
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] transition-opacity group-hover:bg-black/25" />

            {/* Mini Window Mockup Overlay */}
            <div className="absolute inset-2 flex flex-col justify-between rounded-lg border border-white/15 bg-black/45 p-2.5 text-white/90 backdrop-blur-md shadow-md">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500/80" />
                  <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                  <span className="h-2 w-2 rounded-full bg-green-500/80" />
                  <span className="ml-1 font-mono text-[9px] text-white/70 truncate max-w-[120px]">{name}.conf</span>
                </div>
                {normalizedWallpaper.resolution && (
                  <span className="font-mono text-[9px] text-white/50">{normalizedWallpaper.resolution}</span>
                )}
              </div>

              {/* Code Snippet Sample */}
              <div className="py-1 font-mono text-[10px] leading-tight space-y-0.5 select-none">
                <div className="flex items-center gap-1">
                  <span style={{ color: primaryColor }}>const</span>
                  <span className="text-white/90">theme</span>
                  <span className="text-white/60">=</span>
                  <span style={{ color: accentColor }}>"{name}"</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/50">status:</span>
                  <span className="text-emerald-400 font-semibold">{isApplied ? 'active' : 'ready'}</span>
                </div>
              </div>

              {/* Token Swatches Ribbon */}
              <div className="flex items-center gap-1 pt-1 border-t border-white/10">
                {normalizedPalette.map((swatch) => (
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
        </section>
      </div>

      {/* Expanded Content Section */}
      {isExpanded && (
        <CardContent id={detailsId} className="px-5 pb-5 pt-3 space-y-4 border-t border-border mt-1">
          {/* 1. Environment Configuration Status (if present) */}
          {operations && operations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span>Environment Configuration Status</span>
              </div>
              <div className="space-y-1.5 rounded-lg border border-border bg-background/50 p-3">
                {operations.map((op) => (
                  <div key={op.name} className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {op.status === 'SUCCESS' && <Check className="h-3.5 w-3.5 shrink-0 text-success" />}
                      {op.status === 'WARNING' && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />}
                      {op.status === 'FAILED' && <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
                      {op.status === 'SKIPPED' && <span className="mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />}
                      <span className="font-medium text-foreground">{op.name}</span>
                    </div>
                    <span className="max-w-[280px] truncate text-[11px] text-muted-foreground">{op.message}</span>
                  </div>
                ))}
              </div>

              {failedOps && failedOps.length > 0 && (
                <div className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-foreground">
                  {failedOps.map((op) => (
                    <div key={op.name} className="space-y-0.5">
                      <p className="font-semibold text-destructive">Operation: Failed to configure {op.name}</p>
                      <p className="text-[11px] text-muted-foreground">Reason: {op.message}</p>
                      <p className="text-[11px] italic text-secondary-text">
                        Recovery: Previous configuration intact / backup saved in ~/.config/pegasus/backups/
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Color Palette Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Palette className="h-3.5 w-3.5 text-primary" />
              <span>Color Palette</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              {normalizedPalette.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col justify-between gap-2 rounded-lg border border-border bg-background/50 p-2.5 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-medium text-muted-foreground">{item.label}</span>
                    <div
                      className="h-4 w-4 shrink-0 rounded-full border border-white/10 shadow-xs"
                      style={{ backgroundColor: item.color }}
                      title={`${item.label}: ${item.color}`}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-foreground">{item.color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Wallpaper Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <span>Wallpaper</span>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-background/50 p-3">
              {hasValidImage ? (
                <img
                  src={normalizedWallpaper.previewUrl}
                  alt={`${normalizedWallpaper.name} preview`}
                  onError={() => setImgFailed(true)}
                  className="h-32 w-full rounded-md border border-border object-cover"
                />
              ) : (
                <div
                  className="relative flex h-32 w-full flex-col justify-between overflow-hidden rounded-md border border-border p-3"
                  style={{
                    background:
                      normalizedWallpaper.gradient ||
                      `linear-gradient(135deg, ${bgColor} 0%, ${borderColor} 50%, ${primaryColor} 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-background/80 text-[10px] backdrop-blur-xs">
                      Theme Canvas
                    </Badge>
                    {normalizedWallpaper.resolution && (
                      <span className="text-[10px] font-mono text-foreground/80">{normalizedWallpaper.resolution}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] text-secondary-text px-0.5 pt-1">
                <span>{normalizedWallpaper.name}</span>
                {normalizedWallpaper.resolution && (
                  <span className="font-mono text-[10px]">{normalizedWallpaper.resolution}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export { CardTheme }
