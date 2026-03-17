export interface Exercise {
  id: string
  name: string
  description: string
  tips: string
  duration: number
  reps: number
  startBPM: number
  bpmIncrement: number
}

export interface DayRoutine {
  focus: string
  description: string
  exercises: Exercise[]
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type Routines = Record<DayOfWeek, DayRoutine>

export interface WarmupKeyExercise {
  id: string
  type: string
  key: string
  name: string
  description: string
  tips: string
  duration: number
  reps: number
  startBPM: number
  bpmIncrement: number
}

export interface WarmupItem {
  id: string
  name: string
  scaleType: string
  keys: string[]
  keyExercises: WarmupKeyExercise[]
  duration: number
  reps: number
  startBPM: number
  bpmIncrement: number
}
