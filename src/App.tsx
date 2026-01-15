import { PracticeWorkspace } from './pages/PracticeWorkspace'
import { useCompletion } from './hooks/useCompletion'
import routinesData from './data/routines.json'
import type { Routines, DayOfWeek } from './types'

const routines = routinesData as Routines

function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

function App() {
  const currentDay = getCurrentDay()
  const todayRoutine = routines[currentDay]
  const { isComplete, markComplete } = useCompletion()

  const dayDisplayName = currentDay.charAt(0).toUpperCase() + currentDay.slice(1)

  return (
    <PracticeWorkspace
      routine={todayRoutine}
      dayName={dayDisplayName}
      isComplete={isComplete}
      onComplete={markComplete}
    />
  )
}

export default App
