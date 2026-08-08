import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import App from '../../src/renderer/app/App'
import { SettingsView } from '../../src/renderer/features/settings/SettingsView'
import { LanguageProvider, useTranslation } from '../../src/renderer/context/LanguageContext'

function TestConsumer() {
  const { t, language } = useTranslation()
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="title">{t('header.settingsTitle')}</span>
      <span data-testid="dynamic">
        {t('themes.availableThemes', { count: 7 })}
      </span>
    </div>
  )
}

describe('Internationalization (i18n) — Brazilian Portuguese (pt-BR) Support', () => {
  beforeEach(() => {
    // Mock pegasus window object for settings IPC
    window.pegasus = {
      system: { getInfo: vi.fn() },
      themes: { list: vi.fn(), apply: vi.fn() },
      terminal: { getConfig: vi.fn() },
      packages: { list: vi.fn() },
      settings: {
        get: vi.fn().mockResolvedValue({
          success: true,
          data: {
            language: 'en',
            darkMode: true,
            autoApplyTheme: false,
            notificationsEnabled: true,
            logLevel: 'info',
          },
        }),
        update: vi.fn().mockResolvedValue({
          success: true,
          data: {
            language: 'pt-BR',
            darkMode: true,
            autoApplyTheme: false,
            notificationsEnabled: true,
            logLevel: 'info',
          },
        }),
      },
    }
  })

  it('defaults to English and renders correctly', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )

    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('title')).toHaveTextContent('Settings')
    expect(screen.getByTestId('dynamic')).toHaveTextContent('7 Available Themes')
  })

  it('switches to Português (Brasil) immediately and interpolates dynamic values', () => {
    render(
      <LanguageProvider initialLanguage="pt-BR">
        <TestConsumer />
      </LanguageProvider>
    )

    expect(screen.getByTestId('lang')).toHaveTextContent('pt-BR')
    expect(screen.getByTestId('title')).toHaveTextContent('Configurações')
    expect(screen.getByTestId('dynamic')).toHaveTextContent('7 Temas Disponíveis')
  })

  it('renders language selector in Settings view with user-facing option Português (Brasil)', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <SettingsView />
      </LanguageProvider>
    )

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByLabelText('Language')).toBeInTheDocument()

    const select = screen.getByRole('combobox', { name: 'Language' }) as HTMLSelectElement
    expect(select.value).toBe('en')

    const options = screen.getAllByRole('option')
    const optionTexts = options.map((opt) => opt.textContent)
    expect(optionTexts).toContain('English')
    expect(optionTexts).toContain('Português (Brasil)')
  })

  it('allows user to switch language in Settings view and calls IPC persistence', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <SettingsView />
      </LanguageProvider>
    )

    const select = screen.getByRole('combobox', { name: 'Language' })
    fireEvent.change(select, { target: { value: 'pt-BR' } })

    // Instantly updates UI strings to pt-BR
    expect(screen.getByRole('heading', { name: 'Configurações' })).toBeInTheDocument()
    expect(screen.getByText('Português (Brasil) ativo')).toBeInTheDocument()

    // Calls IPC settings update for persistence
    expect(window.pegasus!.settings.update).toHaveBeenCalledWith({ language: 'pt-BR' })
  })

  it('navigates through desktop app in Portuguese after language switch', async () => {
    await act(async () => {
      render(<App />)
    })

    // Open Settings nav item
    const settingsNav = screen.getByRole('button', { name: 'Settings' })
    await act(async () => {
      fireEvent.click(settingsNav)
    })

    // Switch language to pt-BR
    const select = screen.getByRole('combobox')
    await act(async () => {
      fireEvent.change(select, { target: { value: 'pt-BR' } })
    })

    // Sidebar items updated to Portuguese
    expect(screen.getByRole('button', { name: 'Início' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Temas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Configurações' })).toBeInTheDocument()

    // Navigate back to Início (Home)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Início' }))
    })
    expect(screen.getByRole('heading', { name: 'Início', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Seu ambiente, personalizado do seu jeito.')).toBeInTheDocument()
    expect(screen.getByText('Explorar Temas')).toBeInTheDocument()

    // Navigate to Temas (Themes)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Temas' }))
    })
    expect(screen.getByRole('heading', { name: 'Temas do Sistema', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Temas Disponíveis/)).toBeInTheDocument()
  })
})
