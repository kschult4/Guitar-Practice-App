import { useState, useEffect, useCallback } from 'react'
import type { DayRoutine, Exercise } from '../types'
import { useTimer } from '../hooks/useTimer'
import { useMetronome } from '../hooks/useMetronome'
import { useWakeLock } from '../hooks/useWakeLock'

// Daily accent colors - "THE DROP" color system
const ACCENT_COLORS: Record<string, string> = {
  sunday: '#06B6D4',    // Cyan
  monday: '#F97316',    // Orange
  tuesday: '#3B82F6',   // Blue
  wednesday: '#22C55E', // Green
  thursday: '#A855F7',  // Purple
  friday: '#EAB308',    // Yellow
  saturday: '#EC4899',  // Pink
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

export function PracticeWorkspace({ routine, dayName, isComplete, onComplete }: PracticeWorkspaceProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const accent = ACCENT_COLORS[dayName.toLowerCase()] || '#F97316'

  const selectedExercise = selectedExerciseId
    ? routine.exercises.find(e => e.id === selectedExerciseId)
    : null

  return (
    <div className="h-screen flex bg-[--color-canvas]">
      {/* Left Rail */}
      <div className="w-1/3 flex flex-col relative overflow-hidden">
        {/* Vertical Focus Title */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
          <h1
            className="text-[8rem] font-[--font-display] uppercase tracking-tight leading-none"
            style={{ color: accent, fontFamily: 'Bebas Neue, sans-serif' }}
          >
            {routine.focus}
          </h1>
        </div>

        {/* Day label + Description */}
        <div className="p-6 pt-8">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {dayName}
          </p>
          <p className="text-[--color-text-muted] text-sm mt-2 max-w-[200px]">
            {routine.description}
          </p>
        </div>

        {/* Exercise List - positioned to avoid vertical text */}
        <div className="flex-1 flex flex-col justify-end p-6 pb-8">
          <ul className="space-y-1">
            {routine.exercises.map((exercise, index) => {
              const completed = isComplete(exercise.id)
              const isSelected = selectedExerciseId === exercise.id

              return (
                <li key={exercise.id}>
                  <button
                    onClick={() => setSelectedExerciseId(exercise.id)}
                    className="w-full text-left py-3 transition-all cursor-pointer group flex items-center gap-3"
                  >
                    <span
                      className="text-xs font-semibold w-6"
                      style={{ color: isSelected ? accent : 'var(--color-text-muted)' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-medium transition-colors ${
                        isSelected
                          ? 'text-[--color-text]'
                          : 'text-[--color-text-muted] group-hover:text-[--color-text]'
                      }`}
                    >
                      {exercise.name}
                    </span>
                    {completed && (
                      <span
                        className="ml-auto text-xs font-semibold uppercase tracking-wide"
                        style={{ color: accent }}
                      >
                        Done
                      </span>
                    )}
                  </button>
                  {isSelected && (
                    <div
                      className="h-0.5 -mt-1 mb-2"
                      style={{ backgroundColor: accent }}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Right Workspace */}
      <div className="w-2/3 flex flex-col border-l border-[--color-border]">
        {selectedExercise ? (
          <ExerciseWorkspace
            key={selectedExercise.id}
            exercise={selectedExercise}
            accent={accent}
            onComplete={() => onComplete(selectedExercise.id)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[--color-text-muted] text-lg">Select an exercise</p>
              <p className="text-[--color-text-muted] text-sm mt-1 opacity-50">to begin your session</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Inner component for exercise workspace with timer/metronome
interface ExerciseWorkspaceProps {
  exercise: Exercise
  accent: string
  onComplete: () => void
}

function ExerciseWorkspace({ exercise, accent, onComplete }: ExerciseWorkspaceProps) {
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

  const displayBeat = timer.state === 'count-in'
    ? ((timer.countInBeat - 1) % 4) + 1
    : currentBeat

  return (
    <div className="flex-1 flex flex-col">
      {/* Timer Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Timer Display */}
        <div className="text-center mb-8">
          {timer.state === 'count-in' && (
            <div
              className="text-[12rem] leading-none tabular-nums"
              style={{ color: accent, fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {timer.countInBeat}
            </div>
          )}
          {timer.state === 'running' && (
            <div
              className="text-[12rem] leading-none tabular-nums text-[--color-text]"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {formatTime(timer.timeRemaining)}
            </div>
          )}
          {timer.state === 'break' && (
            <div className="text-center">
              <div
                className="text-[12rem] leading-none tabular-nums"
                style={{ color: accent, fontFamily: 'Bebas Neue, sans-serif' }}
              >
                {timer.timeRemaining}
              </div>
              <p className="text-[--color-text-muted] text-sm uppercase tracking-widest mt-2">Break</p>
            </div>
          )}
          {timer.state === 'complete' && (
            <div
              className="text-[8rem] leading-none uppercase"
              style={{ color: accent, fontFamily: 'Bebas Neue, sans-serif' }}
            >
              Complete
            </div>
          )}
          {timer.state === 'idle' && (
            <div
              className="text-[12rem] leading-none tabular-nums text-[--color-text-muted] opacity-30"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {formatTime(exercise.duration)}
            </div>
          )}
        </div>

        {/* Status Row */}
        <div className="flex items-center gap-12 mb-8">
          <div className="text-center">
            <div
              className="text-4xl font-semibold"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {timer.currentBPM}
            </div>
            <div className="text-[--color-text-muted] text-xs uppercase tracking-widest">BPM</div>
          </div>
          <div className="text-center">
            <div
              className="text-4xl font-semibold"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {timer.currentRep}/{timer.totalReps}
            </div>
            <div className="text-[--color-text-muted] text-xs uppercase tracking-widest">Rep</div>
          </div>
        </div>

        {/* Metronome Visual */}
        <div className="flex gap-4 mb-8">
          {[1, 2, 3, 4].map((beat) => (
            <div
              key={beat}
              className={`rounded-full transition-all duration-75 ${
                beat === 1 ? 'w-5 h-5' : 'w-4 h-4'
              }`}
              style={{
                backgroundColor: displayBeat === beat
                  ? accent
                  : 'var(--color-surface-raised)',
                transform: displayBeat === beat ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          {timer.state === 'idle' && (
            <button
              onClick={handleStart}
              className="px-12 py-4 rounded-none font-semibold text-lg uppercase tracking-wider transition-colors cursor-pointer"
              style={{
                backgroundColor: accent,
                color: '#0A0A0A',
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '1.5rem',
              }}
            >
              Start
            </button>
          )}

          {isActive && (
            <>
              <button
                onClick={handleStop}
                className="px-8 py-4 bg-[--color-surface] text-[--color-text] rounded-none font-semibold uppercase tracking-wider transition-colors cursor-pointer hover:bg-[--color-surface-raised]"
                style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.25rem' }}
              >
                Stop
              </button>
              <button
                onClick={handleRestart}
                className="px-8 py-4 bg-[--color-surface] text-[--color-text] rounded-none font-semibold uppercase tracking-wider transition-colors cursor-pointer hover:bg-[--color-surface-raised]"
                style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.25rem' }}
              >
                Restart
              </button>
            </>
          )}

          {timer.state === 'complete' && (
            <button
              onClick={handleRestart}
              className="px-12 py-4 rounded-none font-semibold text-lg uppercase tracking-wider transition-colors cursor-pointer"
              style={{
                backgroundColor: accent,
                color: '#0A0A0A',
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '1.5rem',
              }}
            >
              Again
            </button>
          )}
        </div>
      </div>

      {/* Exercise Info - Bottom Section */}
      <div className="border-t border-[--color-border] p-6">
        <div className="flex gap-8">
          {/* Exercise Name & Description */}
          <div className="flex-1">
            <h2
              className="text-2xl uppercase tracking-tight mb-2"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {exercise.name}
            </h2>
            <pre className="text-[--color-text-muted] text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {exercise.description}
            </pre>
          </div>

          {/* Tips */}
          {exercise.tips && (
            <div className="w-64 border-l border-[--color-border] pl-6">
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: accent }}
              >
                Tips
              </p>
              <p className="text-[--color-text-muted] text-sm leading-relaxed">
                {exercise.tips}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
