import { PracticeWorkspace } from './pages/PracticeWorkspace'
import { useCompletion } from './hooks/useCompletion'
import { useRoutine } from './hooks/useRoutine'

function getCurrentDayName(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
}

function App() {
  const dayName = getCurrentDayName()
  const { isComplete, markComplete } = useCompletion()
  const { loading, routine, warmup } = useRoutine()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-[--color-text-muted] text-lg">Loading today's routine…</p>
      </div>
    )
  }

  if (!routine) return null

  return (
    <PracticeWorkspace
      routine={routine}
      warmupItems={warmup}
      dayName={dayName}
      isComplete={isComplete}
      onComplete={markComplete}
    />
  )
}

export default App
