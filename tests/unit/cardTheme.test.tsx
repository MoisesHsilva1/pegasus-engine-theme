import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CardTheme } from '../../src/renderer/components/ui/cardTheme'

describe('CardTheme component', () => {
  const defaultProps = {
    name: 'Nordic Dark',
    description: 'Arctic ice blue palette for developer workspace.',
    badgeText: 'Official',
    vscode: {
      themeName: 'Nord Theme',
    },
    palette: [
      { label: 'Background', color: '#2e3440' },
      { label: 'Foreground', color: '#d8dee9' },
      { label: 'Primary', color: '#88c0d0' },
      { label: 'Accent', color: '#81a1c1' },
      { label: 'Border', color: '#4c566a' },
    ],
    wallpaper: {
      name: 'Nordic Aurora Boreal',
      resolution: '3840x2160',
    },
  }

  it('renders collapsed card state by default with Apply and Expand actions', () => {
    render(<CardTheme {...defaultProps} />)

    expect(screen.getByText('Nordic Dark')).toBeInTheDocument()
    expect(
      screen.getByText('Arctic ice blue palette for developer workspace.')
    ).toBeInTheDocument()
    expect(screen.getByText('Official')).toBeInTheDocument()

    // Apply button visible in collapsed state
    const applyButton = screen.getByRole('button', { name: /Apply Nordic Dark theme/i })
    expect(applyButton).toBeInTheDocument()

    // Expand button visible in collapsed state
    const expandButton = screen.getByRole('button', { name: /Expand Nordic Dark theme details/i })
    expect(expandButton).toBeInTheDocument()
    expect(expandButton).toHaveAttribute('aria-expanded', 'false')

    // Expanded details NOT visible yet
    expect(screen.queryByText('VS Code Theme')).not.toBeInTheDocument()
    expect(screen.queryByText('Color Palette')).not.toBeInTheDocument()
    expect(screen.queryByText('Wallpaper')).not.toBeInTheDocument()
  })

  it('allows applying theme from collapsed state', () => {
    const handleApply = vi.fn()
    render(<CardTheme {...defaultProps} onApply={handleApply} />)

    const applyButton = screen.getByRole('button', { name: /Apply Nordic Dark theme/i })
    fireEvent.click(applyButton)

    expect(handleApply).toHaveBeenCalledTimes(1)
  })

  it('renders applying loading state when isApplying is true', () => {
    render(<CardTheme {...defaultProps} isApplying={true} />)
    expect(screen.getByText('Applying...')).toBeInTheDocument()
  })

  it('renders operations status when expanded and operations prop is provided', () => {
    const operations = [
      { name: 'GNOME Desktop', status: 'SUCCESS' as const, message: 'Applied GNOME colors' },
      { name: 'Alacritty', status: 'WARNING' as const, message: 'Alacritty config updated' },
    ]
    render(<CardTheme {...defaultProps} operations={operations} />)

    // Operations prop auto-expands details view
    expect(screen.getByRole('button', { name: /Collapse Nordic Dark theme details/i })).toBeInTheDocument()
    expect(screen.getByText('Environment Configuration Status')).toBeInTheDocument()
    expect(screen.getByText('GNOME Desktop')).toBeInTheDocument()
    expect(screen.getByText('Applied GNOME colors')).toBeInTheDocument()
  })

  it('expands theme details upon clicking Expand button and shows VS Code theme, palette, wallpaper', () => {
    const handleApply = vi.fn()
    render(<CardTheme {...defaultProps} onApply={handleApply} />)

    const expandButton = screen.getByRole('button', { name: /Expand Nordic Dark theme details/i })
    fireEvent.click(expandButton)

    expect(expandButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /Collapse Nordic Dark theme details/i })).toBeInTheDocument()

    // VS Code details
    expect(screen.getByText('VS Code Theme')).toBeInTheDocument()
    expect(screen.getByText('Nord Theme')).toBeInTheDocument()

    // Color palette details
    expect(screen.getByText('Color Palette')).toBeInTheDocument()
    expect(screen.getByText('#2e3440')).toBeInTheDocument()
    expect(screen.getByText('#d8dee9')).toBeInTheDocument()
    expect(screen.getByText('#88c0d0')).toBeInTheDocument()

    // Wallpaper details
    expect(screen.getByText('Wallpaper')).toBeInTheDocument()
    expect(screen.getAllByText('Nordic Aurora Boreal').length).toBeGreaterThan(0)

    // Apply button still accessible in expanded state
    const applyButton = screen.getByRole('button', { name: /Apply Nordic Dark theme/i })
    fireEvent.click(applyButton)
    expect(handleApply).toHaveBeenCalledTimes(1)
  })

  it('collapses card back to compact state when Collapse button is clicked', () => {
    render(<CardTheme {...defaultProps} />)

    const expandButton = screen.getByRole('button', { name: /Expand Nordic Dark theme details/i })
    fireEvent.click(expandButton)
    expect(screen.getByText('VS Code Theme')).toBeInTheDocument()

    const collapseButton = screen.getByRole('button', { name: /Collapse Nordic Dark theme details/i })
    fireEvent.click(collapseButton)

    expect(screen.queryByText('VS Code Theme')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Expand Nordic Dark theme details/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('displays Applied badge when isApplied is true', () => {
    render(<CardTheme {...defaultProps} isApplied={true} />)

    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Apply Nordic Dark theme/i })).not.toBeInTheDocument()
  })
})
