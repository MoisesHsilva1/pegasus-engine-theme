

interface HeaderProps {
  activeTitle: string
}

export function Header({ activeTitle }: HeaderProps) {
  return (
    <header className="h-11 border-b border-border bg-surface px-4 flex items-center justify-between select-none shrink-0">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold text-foreground tracking-wide uppercase">
          {activeTitle}
        </h2>
      </div>
    </header>
  )
}
