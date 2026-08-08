import { useState } from 'react'
import { Sidebar, type ActiveNav } from '@/components/shared/Sidebar'
import { HomeView } from '@/features/home/HomeView'
import { ThemesView } from '@/features/themes/ThemesView'

export function App() {
  const [activeNav, setActiveNav] = useState<ActiveNav>('home')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar activeNav={activeNav} onSelectNav={setActiveNav} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {activeNav === 'home' && <HomeView onNavigate={setActiveNav} />}
          {activeNav === 'themes' && <ThemesView />}
        </main>
      </div>
    </div>
  )
}

export default App
