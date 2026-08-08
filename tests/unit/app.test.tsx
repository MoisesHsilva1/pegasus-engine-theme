import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/renderer/app/App'

describe('React App Desktop Shell — Home UI', () => {
  it('renders application branding, header status, and home dashboard components', () => {
    render(<App />)

    expect(screen.getAllByText('Pegasus Engine Theme').length).toBeGreaterThan(0)
    expect(screen.getByText('Engine Theme')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Home', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Manage and customize your Pegasus environment.')).toBeInTheDocument()
    expect(screen.getByText('Fedora 44')).toBeInTheDocument()
  })
})
