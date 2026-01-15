import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'guitar-practice-completions'

interface CompletionData {
  date: string // YYYY-MM-DD
  completedIds: string[]
}

function getTodayString(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

function loadCompletions(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return new Set()

    const data: CompletionData = JSON.parse(stored)
    const today = getTodayString()

    // Purge if data is from a different day
    if (data.date !== today) {
      localStorage.removeItem(STORAGE_KEY)
      return new Set()
    }

    return new Set(data.completedIds)
  } catch {
    return new Set()
  }
}

function saveCompletions(completedIds: Set<string>): void {
  const data: CompletionData = {
    date: getTodayString(),
    completedIds: Array.from(completedIds),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useCompletion() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => loadCompletions())

  // Check for midnight purge periodically
  useEffect(() => {
    const checkMidnight = () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: CompletionData = JSON.parse(stored)
        if (data.date !== getTodayString()) {
          localStorage.removeItem(STORAGE_KEY)
          setCompletedIds(new Set())
        }
      }
    }

    // Check every minute
    const interval = setInterval(checkMidnight, 60000)
    return () => clearInterval(interval)
  }, [])

  const markComplete = useCallback((exerciseId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      next.add(exerciseId)
      saveCompletions(next)
      return next
    })
  }, [])

  const isComplete = useCallback((exerciseId: string) => {
    return completedIds.has(exerciseId)
  }, [completedIds])

  return {
    completedIds,
    markComplete,
    isComplete,
  }
}
