import { useState, useCallback, useRef, useEffect } from 'react'

export type TimerState = 'idle' | 'count-in' | 'running' | 'break' | 'complete'

interface TimerConfig {
  duration: number      // seconds per rep
  reps: number
  startBPM: number
  bpmIncrement: number
  onBeat?: () => void   // called each beat during count-in
  onComplete?: () => void
}

interface TimerReturn {
  state: TimerState
  currentRep: number
  totalReps: number
  timeRemaining: number
  currentBPM: number
  countInBeat: number   // 1-8 during count-in, 0 otherwise
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void      // stops and returns to start of current rep
  restart: () => void   // restart from rep 1
}

const BREAK_DURATION = 8 // seconds
const BEATS_PER_BAR = 4
const COUNT_IN_BARS = 2
const COUNT_IN_BEATS = BEATS_PER_BAR * COUNT_IN_BARS // 8 beats

export function useTimer(config: TimerConfig): TimerReturn {
  const [state, setState] = useState<TimerState>('idle')
  const [currentRep, setCurrentRep] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(config.duration)
  const [countInBeat, setCountInBeat] = useState(0)

  const intervalRef = useRef<number | null>(null)
  const beatTimeoutRef = useRef<number | null>(null)

  // Calculate current BPM based on rep number
  const currentBPM = config.startBPM + (config.bpmIncrement * (currentRep - 1))

  // Calculate milliseconds per beat
  const msPerBeat = (60 / currentBPM) * 1000

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (beatTimeoutRef.current) {
      clearTimeout(beatTimeoutRef.current)
      beatTimeoutRef.current = null
    }
  }, [])

  // Count-in logic
  const startCountIn = useCallback(() => {
    setState('count-in')
    setCountInBeat(1)
    config.onBeat?.()

    let beat = 1
    const advanceBeat = () => {
      beat++
      if (beat <= COUNT_IN_BEATS) {
        setCountInBeat(beat)
        config.onBeat?.()
        beatTimeoutRef.current = window.setTimeout(advanceBeat, msPerBeat)
      } else {
        // Count-in complete, start running
        setCountInBeat(0)
        startRunning()
      }
    }

    beatTimeoutRef.current = window.setTimeout(advanceBeat, msPerBeat)
  }, [msPerBeat, config])

  // Running timer logic
  const startRunning = useCallback(() => {
    setState('running')
    setTimeRemaining(config.duration)

    const startTime = Date.now()
    const endTime = startTime + (config.duration * 1000)

    intervalRef.current = window.setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))
      setTimeRemaining(remaining)

      if (remaining <= 0) {
        clearTimers()
        // Rep complete - go to break or complete
        if (currentRep < config.reps) {
          startBreak()
        } else {
          setState('complete')
          config.onComplete?.()
        }
      }
    }, 100) // Update every 100ms for smooth countdown
  }, [config.duration, config.reps, currentRep, clearTimers, config])

  // Break logic
  const startBreak = useCallback(() => {
    setState('break')
    setTimeRemaining(BREAK_DURATION)

    const startTime = Date.now()
    const endTime = startTime + (BREAK_DURATION * 1000)

    intervalRef.current = window.setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))
      setTimeRemaining(remaining)

      if (remaining <= 0) {
        clearTimers()
        // Move to next rep
        setCurrentRep(prev => prev + 1)
      }
    }, 100)
  }, [clearTimers])

  // When rep changes during active session, start count-in for new rep
  useEffect(() => {
    if (state === 'break' && timeRemaining === 0) {
      // This triggers after setCurrentRep in startBreak
      startCountIn()
    }
  }, [currentRep])

  const start = useCallback(() => {
    if (state === 'idle' || state === 'complete') {
      setCurrentRep(1)
      setTimeRemaining(config.duration)
      startCountIn()
    }
  }, [state, config.duration, startCountIn])

  const pause = useCallback(() => {
    if (state === 'count-in' || state === 'running' || state === 'break') {
      clearTimers()
      // Keep current state but stop timers - will need isPaused flag
    }
  }, [state, clearTimers])

  const resume = useCallback(() => {
    // For simplicity in Phase 1, resume restarts the current rep's count-in
    if (state === 'count-in' || state === 'running') {
      startCountIn()
    } else if (state === 'break') {
      startBreak()
    }
  }, [state, startCountIn, startBreak])

  const stop = useCallback(() => {
    clearTimers()
    setTimeRemaining(config.duration)
    setCountInBeat(0)
    setState('idle')
  }, [clearTimers, config.duration])

  const restart = useCallback(() => {
    clearTimers()
    setCurrentRep(1)
    setTimeRemaining(config.duration)
    setCountInBeat(0)
    setState('idle')
  }, [clearTimers, config.duration])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  return {
    state,
    currentRep,
    totalReps: config.reps,
    timeRemaining,
    currentBPM,
    countInBeat,
    start,
    pause,
    resume,
    stop,
    restart,
  }
}
