import { useRef, useCallback, useEffect } from 'react'
import * as Tone from 'tone'

interface MetronomeConfig {
  bpm: number
  onBeat?: (beat: number) => void // 1-4
}

interface MetronomeReturn {
  start: () => Promise<void>
  stop: () => void
  setBpm: (bpm: number) => void
  isInitialized: boolean
}

export function useMetronome(config: MetronomeConfig): MetronomeReturn {
  const synthRef = useRef<Tone.MembraneSynth | null>(null)
  const loopRef = useRef<Tone.Loop | null>(null)
  const beatRef = useRef(0)
  const isInitializedRef = useRef(false)
  const isRunningRef = useRef(false)
  const onBeatRef = useRef(config.onBeat)

  // Keep onBeat callback updated
  useEffect(() => {
    onBeatRef.current = config.onBeat
  }, [config.onBeat])

  // Initialize Tone.js on first user interaction
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) return

    await Tone.start()

    // Create a membrane synth for wood block sound
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination()

    // Create the loop once
    loopRef.current = new Tone.Loop((time) => {
      beatRef.current = (beatRef.current % 4) + 1
      const beat = beatRef.current

      // Emphasize beat 1 (higher pitch, louder)
      if (beat === 1) {
        synthRef.current?.triggerAttackRelease('C3', '16n', time, 0.8)
      } else {
        synthRef.current?.triggerAttackRelease('G2', '16n', time, 0.4)
      }

      // Schedule callback on main thread
      Tone.getDraw().schedule(() => {
        onBeatRef.current?.(beat)
      }, time)
    }, '4n')

    isInitializedRef.current = true
  }, [])

  const start = useCallback(async () => {
    if (isRunningRef.current) return

    await initialize()

    if (!synthRef.current || !loopRef.current) return

    // Reset state
    beatRef.current = 0
    Tone.getTransport().bpm.value = config.bpm
    Tone.getTransport().position = 0

    // Start loop and transport
    loopRef.current.start(0)
    Tone.getTransport().start()
    isRunningRef.current = true
  }, [config.bpm, initialize])

  const stop = useCallback(() => {
    if (!isRunningRef.current) return

    loopRef.current?.stop()
    Tone.getTransport().stop()
    Tone.getTransport().position = 0
    beatRef.current = 0
    isRunningRef.current = false
  }, [])

  const setBpm = useCallback((bpm: number) => {
    Tone.getTransport().bpm.value = bpm
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loopRef.current?.dispose()
      synthRef.current?.dispose()
      Tone.getTransport().stop()
    }
  }, [])

  return {
    start,
    stop,
    setBpm,
    isInitialized: isInitializedRef.current,
  }
}
