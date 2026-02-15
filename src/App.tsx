import { useState } from 'react'
import { PracticeWorkspace } from './pages/PracticeWorkspace'
import { ServicesDirectory } from './pages/ServicesDirectory'
import { useCompletion } from './hooks/useCompletion'
import routinesData from './data/routines.json'
import servicesData from './data/services.json'
import type { Routines, DayOfWeek, ServiceEntry } from './types'

const routines = routinesData as Routines
const services = servicesData as ServiceEntry[]

type Page = 'practice' | 'services'

function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

function App() {
  const [page, setPage] = useState<Page>('practice')
  const currentDay = getCurrentDay()
  const todayRoutine = routines[currentDay]
  const { isComplete, markComplete } = useCompletion()

  const dayDisplayName = currentDay.charAt(0).toUpperCase() + currentDay.slice(1)

  if (page === 'services') {
    return (
      <ServicesDirectory
        services={services}
        onBack={() => setPage('practice')}
      />
    )
  }

  return (
    <div className="relative">
      {/* Services Directory Link */}
      <button
        onClick={() => setPage('services')}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-[--color-surface-raised] hover:bg-[--color-surface-elevated] border border-[--color-border] text-sm font-medium text-[--color-text-muted] hover:text-[--color-text] transition-all cursor-pointer"
      >
        Services Directory
      </button>
      <PracticeWorkspace
        routine={todayRoutine}
        dayName={dayDisplayName}
        isComplete={isComplete}
        onComplete={markComplete}
      />
    </div>
  )
}

export default App
