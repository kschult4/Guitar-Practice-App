import { useState, useEffect, useCallback } from 'react'
import type { DayRoutine, Exercise, WarmupItem } from '../types'
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
  warmupItems?: WarmupItem[]
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
          const code = part.slice(3, -3).trim()
          return (
            <pre
              key={index}
              className="font-mono text-base leading-relaxed text-[--color-text] whitespace-pre"
            >
              {code}
            </pre>
          )
        } else if (part.trim()) {
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

export function PracticeWorkspace({ routine, warmupItems, dayName, isComplete, onComplete }: PracticeWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<'warmup' | 'practice'>('practice')
  const [isExerciseActive, setIsExerciseActive] = useState(false)
  const dayKey = dayName.toLowerCase() as keyof typeof DAY_PALETTES
  const palette = DAY_PALETTES[dayKey] || 'violet'
  const accent = DAY_ACCENTS[dayKey] || '#A78BFA'

  const hasWarmup = warmupItems && warmupItems.length > 0

  const selectedExercise = selectedSection === 'practice' && selectedId
    ? routine.exercises.find(e => e.id === selectedId) ?? null
    : null

  const selectedWarmup = selectedSection === 'warmup' && selectedId
    ? warmupItems?.find(w => w.id === selectedId) ?? null
    : null

  function selectPractice(id: string) {
    setSelectedId(id)
    setSelectedSection('practice')
  }

  function selectWarmup(id: string) {
    setSelectedId(id)
    setSelectedSection('warmup')
  }

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ '--accent-color': accent } as React.CSSProperties}
    >
      <AmbientBackground palette={palette} isActive={isExerciseActive} />

      <div className="content-layer flex w-full">
        {/* Left Rail */}
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
          <nav className="flex-1 -mx-2 overflow-y-auto">
            {/* Warmup Section */}
            {hasWarmup && (
              <>
                <p className="text-xs font-semibold text-[--color-text-subtle] uppercase tracking-widest px-4 mb-2">
                  Warmup
                </p>
                <ul className="space-y-1 mb-4">
                  {warmupItems!.map((item, index) => {
                    const isSelected = selectedSection === 'warmup' && selectedId === item.id
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => selectWarmup(item.id)}
                          className={`
                            w-full text-left px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                            flex items-center gap-3 group
                            ${isSelected
                              ? 'bg-[--color-surface-raised]'
                              : 'hover:bg-[--color-surface]/50'
                            }
                          `}
                        >
                          <span className={`text-xs font-semibold w-6 tabular-nums ${isSelected ? 'text-[--color-text-secondary]' : 'text-[--color-text-subtle]'}`}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className={`font-medium flex-1 transition-colors text-sm ${isSelected ? 'text-[--color-text]' : 'text-[--color-text-muted] group-hover:text-[--color-text-secondary]'}`}>
                            {item.name}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div className="border-t border-[--color-border]/40 mx-4 mb-4" />

                <p className="text-xs font-semibold text-[--color-text-subtle] uppercase tracking-widest px-4 mb-2">
                  Practice
                </p>
              </>
            )}

            {/* Practice Exercises */}
            <ul className="space-y-1">
              {routine.exercises.map((exercise, index) => {
                const completed = isComplete(exercise.id)
                const isSelected = selectedSection === 'practice' && selectedId === exercise.id

                return (
                  <li key={exercise.id}>
                    <button
                      onClick={() => selectPractice(exercise.id)}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                        flex items-center gap-3 group
                        ${isSelected
                          ? 'bg-[--color-surface-raised]'
                          : 'hover:bg-[--color-surface]/50'
                        }
                      `}
                    >
                      <span className={`text-xs font-semibold w-6 tabular-nums ${isSelected ? 'text-[--color-text-secondary]' : 'text-[--color-text-subtle]'}`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={`font-medium flex-1 transition-colors ${isSelected ? 'text-[--color-text]' : 'text-[--color-text-muted] group-hover:text-[--color-text-secondary]'}`}>
                        {exercise.name}
                      </span>
                      {completed && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${accent}20`, color: accent }}
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
          ) : selectedWarmup ? (
            <WarmupWorkspace
              key={selectedWarmup.id}
              item={selectedWarmup}
              accent={accent}
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

  useEffect(() => {
    const isActive = timer.state === 'count-in' || timer.state === 'running'
    onActiveChange(isActive)
  }, [timer.state, onActiveChange])

  const handleStart = useCallback(() => { timer.start() }, [timer])
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
  const displayBeat = timer.state === 'count-in' ? ((timer.countInBeat - 1) % 4) + 1 : currentBeat
  const progressPercent = timer.state === 'running'
    ? ((exercise.duration - timer.timeRemaining) / exercise.duration) * 100
    : timer.state === 'complete' ? 100 : 0

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl">
          <h2 className="text-3xl text-headline mb-6">{exercise.name}</h2>
          <div className="mb-8">
            <DescriptionRenderer text={exercise.description} />
          </div>
          {exercise.tips && (
            <div className="px-4 py-3 rounded-xl bg-[--color-surface]/30 border border-[--color-border]/50">
              <p className="text-sm text-[--color-text-subtle]">
                <span className="font-semibold not-italic" style={{ color: accent }}>Tip: </span>
                <span className="italic">{exercise.tips}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <PlayerControls
        accent={accent}
        isPlaying={isPlaying}
        isActive={isActive}
        timerState={timer.state}
        timeRemaining={timer.timeRemaining}
        countInBeat={timer.countInBeat}
        currentRep={timer.currentRep}
        totalReps={timer.totalReps}
        currentBPM={timer.currentBPM}
        bpmIncrement={exercise.bpmIncrement}
        displayBeat={displayBeat}
        progressPercent={progressPercent}
        duration={exercise.duration}
        repLabel={`${timer.currentRep}/${timer.totalReps}`}
        onStart={handleStart}
        onStop={handleStop}
        onRestart={handleRestart}
      />
    </div>
  )
}

// Warmup workspace — shows current key's tab, rep counter shows key name
interface WarmupWorkspaceProps {
  item: WarmupItem
  accent: string
  onActiveChange: (isActive: boolean) => void
}

function WarmupWorkspace({ item, accent, onActiveChange }: WarmupWorkspaceProps) {
  const [currentBeat, setCurrentBeat] = useState(0)

  const timer = useTimer({
    duration: item.duration,
    reps: item.reps,
    startBPM: item.startBPM,
    bpmIncrement: item.bpmIncrement,
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

  useEffect(() => {
    const isActive = timer.state === 'count-in' || timer.state === 'running'
    onActiveChange(isActive)
  }, [timer.state, onActiveChange])

  const handleStart = useCallback(() => { timer.start() }, [timer])
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

  // Current key exercise to display (clamp to last if out of bounds)
  const repIndex = Math.min(timer.currentRep - 1, item.keyExercises.length - 1)
  const currentKeyEx = item.keyExercises[repIndex]
  const currentKey = item.keys[repIndex] ?? item.keys[0]

  const isActive = timer.state !== 'idle' && timer.state !== 'complete'
  const isPlaying = timer.state === 'count-in' || timer.state === 'running'
  const displayBeat = timer.state === 'count-in' ? ((timer.countInBeat - 1) % 4) + 1 : currentBeat
  const progressPercent = timer.state === 'running'
    ? ((item.duration - timer.timeRemaining) / item.duration) * 100
    : timer.state === 'complete' ? 100 : 0

  // During break, show the upcoming key
  const breakNextKey = timer.state === 'break'
    ? item.keys[Math.min(timer.currentRep, item.keys.length - 1)]
    : null

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl">
          <div className="flex items-baseline gap-4 mb-6">
            <h2 className="text-3xl text-headline">{item.scaleType}</h2>
            <span
              className="text-xl font-semibold tabular-nums"
              style={{ color: accent }}
            >
              {currentKey}
            </span>
          </div>

          {currentKeyEx && (
            <>
              <div className="mb-8">
                <DescriptionRenderer text={currentKeyEx.description} />
              </div>
              {currentKeyEx.tips && (
                <div className="px-4 py-3 rounded-xl bg-[--color-surface]/30 border border-[--color-border]/50">
                  <p className="text-sm text-[--color-text-subtle]">
                    <span className="font-semibold not-italic" style={{ color: accent }}>Tip: </span>
                    <span className="italic">{currentKeyEx.tips}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PlayerControls
        accent={accent}
        isPlaying={isPlaying}
        isActive={isActive}
        timerState={timer.state}
        timeRemaining={timer.timeRemaining}
        countInBeat={timer.countInBeat}
        currentRep={timer.currentRep}
        totalReps={timer.totalReps}
        currentBPM={timer.currentBPM}
        bpmIncrement={item.bpmIncrement}
        displayBeat={displayBeat}
        progressPercent={progressPercent}
        duration={item.duration}
        repLabel={currentKey}
        repLabelPrefix="Key"
        breakLabel={breakNextKey ? `Break — next key: ${breakNextKey}` : undefined}
        onStart={handleStart}
        onStop={handleStop}
        onRestart={handleRestart}
      />
    </div>
  )
}

// Shared player controls bar
import type { TimerState } from '../hooks/useTimer'

interface PlayerControlsProps {
  accent: string
  isPlaying: boolean
  isActive: boolean
  timerState: TimerState
  timeRemaining: number
  countInBeat: number
  currentRep: number
  totalReps: number
  currentBPM: number
  bpmIncrement: number
  displayBeat: number
  progressPercent: number
  duration: number
  repLabel: string
  repLabelPrefix?: string
  breakLabel?: string
  onStart: () => void
  onStop: () => void
  onRestart: () => void
}

function PlayerControls({
  accent, isPlaying, isActive, timerState, timeRemaining, countInBeat,
  currentBPM, bpmIncrement, displayBeat, progressPercent,
  duration, repLabel, repLabelPrefix = 'Rep', breakLabel, onStart, onStop, onRestart,
}: PlayerControlsProps) {
  return (
    <div className="border-t border-[--color-border] bg-[--color-surface]/40 backdrop-blur-xl">
      <div className="h-1.5 bg-[--color-surface-elevated]">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%`, backgroundColor: accent }}
        />
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center gap-8">
          {/* Play/Stop */}
          <button
            onClick={isPlaying ? onStop : onStart}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            style={{ backgroundColor: accent, boxShadow: `0 8px 32px -4px ${accent}50` }}
          >
            {isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Restart */}
          {(isActive || timerState === 'complete') && (
            <button
              onClick={onRestart}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-[--color-surface-raised] hover:bg-[--color-surface-elevated] transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6 text-[--color-text-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Time Display */}
          <div className="flex items-baseline gap-2 min-w-28">
            {timerState === 'count-in' && (
              <span className="text-4xl text-metric text-[--color-text]">{countInBeat}</span>
            )}
            {timerState === 'running' && (
              <span className="text-4xl text-metric text-[--color-text]">{formatTime(timeRemaining)}</span>
            )}
            {timerState === 'break' && (
              <span className="text-4xl text-metric text-[--color-text-muted]">{timeRemaining}s</span>
            )}
            {timerState === 'complete' && (
              <span className="text-2xl font-semibold text-[--color-text]">Done</span>
            )}
            {timerState === 'idle' && (
              <span className="text-4xl text-metric text-[--color-text-subtle]">{formatTime(duration)}</span>
            )}
          </div>

          {/* Beat Indicator */}
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((beat) => (
              <div
                key={beat}
                className="rounded-full transition-all duration-75"
                style={{
                  width: beat === 1 ? '16px' : '12px',
                  height: beat === 1 ? '16px' : '12px',
                  backgroundColor: displayBeat === beat ? accent : 'var(--color-surface-elevated)',
                  boxShadow: displayBeat === beat ? `0 0 20px ${accent}90` : 'none',
                  transform: displayBeat === beat ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <div className="flex-1" />

          {/* Rep Counter */}
          <div className="flex items-center gap-2">
            <span className="text-base text-[--color-text-muted]">{repLabelPrefix}</span>
            <span className="text-xl font-semibold text-[--color-text] tabular-nums">
              {repLabel}
            </span>
          </div>

          {/* BPM */}
          <div className="flex items-baseline gap-2 pl-6 border-l border-[--color-border]">
            <span className="text-5xl text-metric" style={{ color: accent }}>
              {currentBPM}
            </span>
            <span className="text-sm text-[--color-text-muted] uppercase tracking-wide">bpm</span>
          </div>
        </div>

        {/* State Label */}
        {timerState === 'break' && (
          <p className="text-center text-base text-[--color-text-muted] mt-3">
            {breakLabel ?? `Break — next rep at ${currentBPM + (bpmIncrement || 0)} BPM`}
          </p>
        )}
        {timerState === 'count-in' && (
          <p className="text-center text-base text-[--color-text-muted] mt-3">
            Get ready…
          </p>
        )}
      </div>
    </div>
  )
}
