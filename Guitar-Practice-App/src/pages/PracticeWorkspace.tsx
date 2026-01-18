import { useState, useEffect, useCallback } from 'react'
import type { DayRoutine, Exercise } from '../types'
import { useTimer } from '../hooks/useTimer'
import { useMetronome } from '../hooks/useMetronome'
import { useWakeLock } from '../hooks/useWakeLock'
import { AmbientBackground } from '../components/AmbientBackground'

// Day-specific palettes for ambient background
const DAY_PALETTES = {
  sunday: 'teal',
  monday: 'coral',
  tuesday: 'blue',
  wednesday: 'emerald',
  thursday: 'violet',
  friday: 'amber',
  saturday: 'rose',
} as const

// Softer accent colors for interactive elements
const DAY_ACCENTS = {
  sunday: '#2DD4BF',
  monday: '#FB923C',
  tuesday: '#60A5FA',
  wednesday: '#34D399',
  thursday: '#A78BFA',
  friday: '#FBBF24',
  saturday: '#FB7185',
}

interface PracticeWorkspaceProps {
  routine: DayRoutine
  dayName: string
  isComplete: (id: string) => boolean
  onComplete: (id: string) => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Simple markdown renderer for exercise descriptions
// Handles code blocks (```) and renders them with monospace font
function DescriptionRenderer({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Code block - extract content between backticks
          const code = part.slice(3, -3).trim()
          return (
            <pre
              key={index}
              className="font-mono text-sm leading-relaxed p-4 rounded-xl bg-[--color-surface]/60 border border-[--color-border] text-[--color-text-secondary] overflow-x-auto"
            >
              {code}
            </pre>
          )
        } else if (part.trim()) {
          // Regular text
          return (
            <p
              key={index}
              className="text-[--color-text-secondary] text-base leading-relaxed"
            >
              {part.trim()}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}

export function PracticeWorkspace({ routine, dayName, isComplete, onComplete }: PracticeWorkspaceProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [isExerciseActive, setIsExerciseActive] = useState(false)
  const dayKey = dayName.toLowerCase() as keyof typeof DAY_PALETTES
  const palette = DAY_PALETTES[dayKey] || 'violet'
  const accent = DAY_ACCENTS[dayKey] || '#A78BFA'

  const selectedExercise = selectedExerciseId
    ? routine.exercises.find(e => e.id === selectedExerciseId)
    : null

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ '--accent-color': accent } as React.CSSProperties}
    >
      {/* Ambient animated background - responds to exercise state */}
      <AmbientBackground palette={palette} isActive={isExerciseActive} />

      {/* Content layer */}
      <div className="content-layer flex w-full">
        {/* Left Rail - Exercise Navigation */}
        <aside className="w-80 flex flex-col p-6 border-r border-[--color-border]">
          {/* Day Header */}
          <header className="mb-8">
            <p className="text-label mb-1">{dayName}</p>
            <h1 className="text-2xl text-headline text-[--color-text]">
              {routine.focus}
            </h1>
            <p className="text-sm text-[--color-text-muted] mt-2 leading-relaxed">
              {routine.description}
            </p>
          </header>

          {/* Exercise List */}
          <nav className="flex-1 -mx-2">
            <ul className="space-y-1">
              {routine.exercises.map((exercise, index) => {
                const completed = isComplete(exercise.id)
                const isSelected = selectedExerciseId === exercise.id

                return (
                  <li key={exercise.id}>
                    <button
                      onClick={() => setSelectedExerciseId(exercise.id)}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                        flex items-center gap-3 group
                        ${isSelected
                          ? 'bg-[--color-surface-raised]'
                          : 'hover:bg-[--color-surface]/50'
                        }
                      `}
                    >
                      <span
                        className={`
                          text-xs font-semibold w-6 tabular-nums
                          ${isSelected ? 'text-[--color-text-secondary]' : 'text-[--color-text-subtle]'}
                        `}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`
                          font-medium flex-1 transition-colors
                          ${isSelected
                            ? 'text-[--color-text]'
                            : 'text-[--color-text-muted] group-hover:text-[--color-text-secondary]'
                          }
                        `}
                      >
                        {exercise.name}
                      </span>
                      {completed && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${accent}20`,
                            color: accent
                          }}
                        >
                          Done
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col">
          {selectedExercise ? (
            <ExerciseWorkspace
              key={selectedExercise.id}
              exercise={selectedExercise}
              accent={accent}
              onComplete={() => onComplete(selectedExercise.id)}
              onActiveChange={setIsExerciseActive}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[--color-text-secondary] text-xl font-medium">
                  Select an exercise
                </p>
                <p className="text-[--color-text-subtle] text-sm mt-2">
                  to begin your session
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Exercise workspace with timer and metronome
interface ExerciseWorkspaceProps {
  exercise: Exercise
  accent: string
  onComplete: () => void
  onActiveChange: (isActive: boolean) => void
}

function ExerciseWorkspace({ exercise, accent, onComplete, onActiveChange }: ExerciseWorkspaceProps) {
  const [currentBeat, setCurrentBeat] = useState(0)

  const timer = useTimer({
    duration: exercise.duration,
    reps: exercise.reps,
    startBPM: exercise.startBPM,
    bpmIncrement: exercise.bpmIncrement,
    onComplete: () => {
      metronome.stop()
      onComplete()
    },
  })

  const metronome = useMetronome({
    bpm: timer.currentBPM,
    onBeat: (beat) => setCurrentBeat(beat),
  })

  const wakeLock = useWakeLock()

  useEffect(() => {
    const isActive = timer.state === 'count-in' || timer.state === 'running' || timer.state === 'break'
    if (isActive) {
      wakeLock.request()
    } else {
      wakeLock.release()
    }
  }, [timer.state, wakeLock])

  useEffect(() => {
    if (timer.state === 'count-in' || timer.state === 'running') {
      metronome.start()
    } else {
      metronome.stop()
      setCurrentBeat(0)
    }
  }, [timer.state])

  useEffect(() => {
    metronome.setBpm(timer.currentBPM)
  }, [timer.currentBPM])

  // Report active state to parent for ambient background animation
  useEffect(() => {
    const isActive = timer.state === 'count-in' || timer.state === 'running'
    onActiveChange(isActive)
  }, [timer.state, onActiveChange])

  const handleStart = useCallback(() => {
    timer.start()
  }, [timer])

  const handleStop = useCallback(() => {
    metronome.stop()
    setCurrentBeat(0)
    timer.stop()
  }, [metronome, timer])

  const handleRestart = useCallback(() => {
    metronome.stop()
    setCurrentBeat(0)
    timer.restart()
  }, [metronome, timer])

  const isActive = timer.state !== 'idle' && timer.state !== 'complete'
  const isPlaying = timer.state === 'count-in' || timer.state === 'running'

  const displayBeat = timer.state === 'count-in'
    ? ((timer.countInBeat - 1) % 4) + 1
    : currentBeat

  // Calculate progress percentage for the progress bar
  const progressPercent = timer.state === 'running'
    ? ((exercise.duration - timer.timeRemaining) / exercise.duration) * 100
    : timer.state === 'complete' ? 100 : 0

  return (
    <div className="flex-1 flex flex-col">
      {/* Exercise Content - Primary Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl">
          {/* Exercise Title */}
          <h2 className="text-3xl text-headline mb-6">
            {exercise.name}
          </h2>

          {/* Exercise Description */}
          <div className="mb-8">
            <DescriptionRenderer text={exercise.description} />
          </div>

          {/* Tips Section */}
          {exercise.tips && (
            <div className="p-5 rounded-2xl bg-[--color-surface]/50 border border-[--color-border]">
              <p className="text-label mb-2">Tips</p>
              <p className="text-[--color-text-muted] leading-relaxed">
                {exercise.tips}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Player Controls - Bottom Bar */}
      <div className="border-t border-[--color-border] bg-[--color-surface]/40 backdrop-blur-xl">
        {/* Progress Bar */}
        <div className="h-1.5 bg-[--color-surface-elevated]">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: accent,
            }}
          />
        </div>

        <div className="px-8 py-6">
          <div className="flex items-center gap-8">
            {/* Play/Stop Button - Large and prominent */}
            <button
              onClick={isPlaying ? handleStop : handleStart}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
              style={{
                backgroundColor: accent,
                boxShadow: `0 8px 32px -4px ${accent}50`,
              }}
            >
              {isPlaying ? (
                // Stop icon
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                // Play icon
                <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Restart Button */}
            {(isActive || timer.state === 'complete') && (
              <button
                onClick={handleRestart}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-[--color-surface-raised] hover:bg-[--color-surface-elevated] transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <svg className="w-6 h-6 text-[--color-text-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}

            {/* Time Display - Larger */}
            <div className="flex items-baseline gap-2 min-w-28">
              {timer.state === 'count-in' && (
                <span className="text-4xl text-metric text-[--color-text]">
                  {timer.countInBeat}
                </span>
              )}
              {timer.state === 'running' && (
                <span className="text-4xl text-metric text-[--color-text]">
                  {formatTime(timer.timeRemaining)}
                </span>
              )}
              {timer.state === 'break' && (
                <span className="text-4xl text-metric text-[--color-text-muted]">
                  {timer.timeRemaining}s
                </span>
              )}
              {timer.state === 'complete' && (
                <span className="text-2xl font-semibold text-[--color-text]">
                  Done
                </span>
              )}
              {timer.state === 'idle' && (
                <span className="text-4xl text-metric text-[--color-text-subtle]">
                  {formatTime(exercise.duration)}
                </span>
              )}
            </div>

            {/* Beat Indicator - Larger */}
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((beat) => (
                <div
                  key={beat}
                  className="rounded-full transition-all duration-75"
                  style={{
                    width: beat === 1 ? '16px' : '12px',
                    height: beat === 1 ? '16px' : '12px',
                    backgroundColor: displayBeat === beat
                      ? accent
                      : 'var(--color-surface-elevated)',
                    boxShadow: displayBeat === beat
                      ? `0 0 20px ${accent}90`
                      : 'none',
                    transform: displayBeat === beat ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Rep Counter - Larger */}
            <div className="flex items-center gap-2">
              <span className="text-base text-[--color-text-muted]">Rep</span>
              <span className="text-xl font-semibold text-[--color-text] tabular-nums">
                {timer.currentRep}/{timer.totalReps}
              </span>
            </div>

            {/* BPM Display - Primary Metric, Much Larger */}
            <div className="flex items-baseline gap-2 pl-6 border-l border-[--color-border]">
              <span
                className="text-5xl text-metric"
                style={{ color: accent }}
              >
                {timer.currentBPM}
              </span>
              <span className="text-sm text-[--color-text-muted] uppercase tracking-wide">
                bpm
              </span>
            </div>
          </div>

          {/* State Label */}
          {timer.state === 'break' && (
            <p className="text-center text-base text-[--color-text-muted] mt-3">
              Break — next rep at {timer.currentBPM + (exercise.bpmIncrement || 0)} BPM
            </p>
          )}
          {timer.state === 'count-in' && (
            <p className="text-center text-base text-[--color-text-muted] mt-3">
              Get ready...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
