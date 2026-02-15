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

export interface ServiceEntry {
  id: string
  category: string
  serviceName: string
  contactInfo: string
  apiAccessDetails: string
  notes: string
  assignedAgent: string
  checkInFrequency: string
}

export type ServiceCategory =
  | 'Travel'
  | 'Health'
  | 'Beauty / Wellness'
  | 'Shopping'
  | 'Finance'
  | 'Daily Life'
  | 'Special Occasions'
