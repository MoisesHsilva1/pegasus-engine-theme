import { useState } from 'react'
import { Sidebar, type ActiveNav } from '@/components/shared/Sidebar'
import { HomeView } from '@/features/home/HomeView'
import { ThemesView } from '@/features/themes/ThemesView'
import { SettingsView } from '@/features/settings/SettingsView'
import { LanguageProvider } from '@/context/LanguageContext'

export function AppContent() {
  const [activeNav, setActiveNav] = useState<ActiveNav>('home')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar activeNav={activeNav} onSelectNav={setActiveNav} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {activeNav === 'home' && <HomeView onNavigate={setActiveNav} />}
          {activeNav === 'themes' && <ThemesView />}
          {activeNav === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  )
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
