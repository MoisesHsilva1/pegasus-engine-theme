import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Home as HomeIcon, Palette, ChessKnight } from 'lucide-react'

export type ActiveNav = 'home' | 'themes'
interface SidebarProps {
  activeNav: ActiveNav
  onSelectNav: (nav: ActiveNav) => void
}

export function Sidebar({ activeNav, onSelectNav }: SidebarProps) {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: HomeIcon },
    { id: 'themes' as const, label: 'Themes', icon: Palette },
  ]

  return (
    <aside className="w-52 border-r border-border bg-surface flex flex-col justify-between p-3 select-none shrink-0">
      <div className="space-y-4">

        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
            <ChessKnight className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-xs leading-none text-foreground tracking-tight">
              Pegasus
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">Theme</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start gap-2 h-7.5 font-medium text-xs rounded-md px-2.5 transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-semibold border border-accent-border'
                    : 'text-secondary-text hover:text-foreground hover:bg-surface-elevated'
                )}
                onClick={() => onSelectNav(item.id)}
              >
                <Icon
                  className={cn('h-3.5 w-3.5', isActive ? 'text-primary' : 'text-muted-foreground')}
                />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
