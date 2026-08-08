interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-0.5 pb-3 border-b border-border">
      <h1 className="text-base font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-xs text-secondary-text">{description}</p>
    </div>
  )
}
