import { useState, useEffect } from 'react'
import type { DayRoutine, WarmupItem, Routines, DayOfWeek } from '../types'
import routinesData from '../data/routines.json'

const API_BASE = 'http://guitar.lan:5000'
const CACHE_KEY = 'guitar-routine-cache'

interface CachedData {
  date: string
  routine: DayRoutine
  warmup: WarmupItem[]
}

interface UseRoutineResult {
  loading: boolean
  routine: DayRoutine | null
  warmup: WarmupItem[]
  error: string | null
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function getDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

export function useRoutine(): UseRoutineResult {
  const [loading, setLoading] = useState(true)
  const [routine, setRoutine] = useState<DayRoutine | null>(null)
  const [warmup, setWarmup] = useState<WarmupItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const today = getTodayString()

    // Check localStorage cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const data: CachedData = JSON.parse(cached)
        if (data.date === today) {
          setRoutine(data.routine)
          setWarmup(data.warmup)
          setLoading(false)
          return
        }
      }
    } catch {}

    async function fetchRoutine() {
      try {
        const [routineRes, warmupRes] = await Promise.all([
          fetch(`${API_BASE}/routine/today`),
          fetch(`${API_BASE}/warmup/today`),
        ])

        const routineData = await routineRes.json()
        const warmupData = await warmupRes.json()

        const dayRoutine: DayRoutine = {
          focus: routineData.focus,
          description: routineData.description,
          exercises: routineData.exercises,
        }
        const warmupItems: WarmupItem[] = warmupData.warmup

        setRoutine(dayRoutine)
        setWarmup(warmupItems)

        const cacheData: CachedData = { date: today, routine: dayRoutine, warmup: warmupItems }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      } catch {
        // Fall back to static routines.json
        const day = getDayOfWeek()
        const routines = routinesData as Routines
        setRoutine(routines[day])
        setWarmup([])
        setError('API unavailable — using static routine')
      } finally {
        setLoading(false)
      }
    }

    fetchRoutine()
  }, [])

  return { loading, routine, warmup, error }
}
