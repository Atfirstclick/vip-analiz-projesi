// components/takvim/types.ts

export interface Availability {
  id: string
  teacher_id: string
  day_of_week: number  // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  start_time: string   // "09:00"
  end_time: string     // "12:00"
  is_recurring: boolean
  specific_date: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TimeSlotData {
  hour: number
  available: boolean
  availabilityId?: string
  notes?: string
}

export interface DaySchedule {
  [hour: number]: TimeSlotData
}

export interface WeekSchedule {
  [key: number]: DaySchedule
}

export const DAY_NAMES = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi'
]

export const WORK_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]