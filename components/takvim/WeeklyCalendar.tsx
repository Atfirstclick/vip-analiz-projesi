'use client'

import { useState } from 'react'
import { Availability } from './types'

interface Appointment {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
  student: { id: string; full_name: string }
  subject: { id: string; name: string; icon: string }
}

interface ClassSchedule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  classroom: string | null
  class: { id: string; name: string; grade: string }
  subject: { id: string; name: string; icon: string }
}

interface WeeklyCalendarProps {
  availabilities: Availability[]
  appointments?: Appointment[]
  classSchedule?: ClassSchedule[]
  readOnly?: boolean
  onSlotClick?: (day: number, hour: number) => void
  onAvailabilityClick?: (availability: Availability) => void
}

const DAYS = [
  { value: 1, label: 'Pazartesi' },
  { value: 2, label: 'Salı' },
  { value: 3, label: 'Çarşamba' },
  { value: 4, label: 'Perşembe' },
  { value: 5, label: 'Cuma' },
  { value: 6, label: 'Cumartesi' },
  { value: 7, label: 'Pazar' }
]

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8-20

export default function WeeklyCalendar({ 
  availabilities, 
  appointments = [],
  classSchedule = [],
  readOnly = false,
  onSlotClick, 
  onAvailabilityClick 
}: WeeklyCalendarProps) {
  
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)

  function getWeekStartDate() {
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayOfWeek + 1 + (currentWeekOffset * 7))
    return monday
  }

  function getWeekDates() {
    const monday = getWeekStartDate()
    return DAYS.map((day, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return {
        ...day,
        date: date,
        dateStr: date.toISOString().split('T')[0],
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('tr-TR', { month: 'short' })
      }
    })
  }

  const weekDates = getWeekDates()
  const weekStart = getWeekStartDate()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  function getAvailabilityForSlot(day: number, hour: number): Availability | null {
    return availabilities.find(a => {
      const startHour = parseInt(a.start_time.split(':')[0])
      const endHour = parseInt(a.end_time.split(':')[0])
      return a.day_of_week === day && hour >= startHour && hour < endHour
    }) || null
  }

  function getAppointmentsForSlot(dateStr: string, hour: number): Appointment[] {
    return appointments.filter(apt => {
      if (apt.date !== dateStr) return false
      const aptHour = parseInt(apt.start_time.split(':')[0])
      return aptHour === hour
    })
  }

  function getClassScheduleForSlot(day: number, hour: number): ClassSchedule[] {
    return classSchedule.filter(cs => {
      if (cs.day_of_week !== day) return false
      const startHour = parseInt(cs.start_time.substring(0, 2))
      const endHour = parseInt(cs.end_time.substring(0, 2))
      return hour >= startHour && hour < endHour
    })
  }

  function renderSlot(dayInfo: any, hour: number) {
    const availability = getAvailabilityForSlot(dayInfo.value, hour)
    const dayAppointments = getAppointmentsForSlot(dayInfo.dateStr, hour)
    const dayClasses = getClassScheduleForSlot(dayInfo.value, hour)

    const today = new Date()
    const isToday = 
      dayInfo.date.getDate() === today.getDate() &&
      dayInfo.date.getMonth() === today.getMonth() &&
      dayInfo.date.getFullYear() === today.getFullYear()

    return (
      <div
        key={`${dayInfo.value}-${hour}`}
        onClick={() => {
          if (readOnly) return
          if (availability && onAvailabilityClick) {
            onAvailabilityClick(availability)
          } else if (dayAppointments.length === 0 && dayClasses.length === 0 && onSlotClick) {
            onSlotClick(dayInfo.value, hour)
          }
        }}
        className={`
          border border-gray-200 p-2 min-h-20
          ${isToday ? 'bg-blue-50' : ''}
          ${availability ? 'bg-green-50' : !isToday ? 'bg-white' : ''}
          ${!readOnly && 'hover:bg-gray-50 cursor-pointer'}
          transition-colors
        `}
      >
        {/* Müsaitlik */}
        {availability && (
          <div className="text-xs">
            <div className="font-semibold text-green-800 mb-1">✅ Müsait</div>
            <div className="text-green-600">
              {availability.start_time.substring(0, 5)} - {availability.end_time.substring(0, 5)}
            </div>
          </div>
        )}

        {/* Randevular */}
        {dayAppointments.map((apt) => (
          <div key={apt.id} className="text-xs mb-1 p-1 bg-blue-100 border-l-2 border-blue-500 rounded">
            <div className="font-semibold text-blue-900">{apt.subject.icon} {apt.subject.name}</div>
            <div className="text-blue-700">👤 {apt.student.full_name}</div>
            <div className="text-blue-600">{apt.start_time.substring(0, 5)} - {apt.end_time.substring(0, 5)}</div>
          </div>
        ))}

        {/* Sınıf Dersleri */}
        {dayClasses.map((cls) => (
          <div key={cls.id} className="text-xs mb-1 p-1 bg-purple-100 border-l-2 border-purple-500 rounded">
            <div className="font-semibold text-purple-900">{cls.subject.icon} {cls.subject.name}</div>
            <div className="text-purple-700">🏫 {cls.class.name} Sınıfı</div>
            <div className="text-purple-600">{cls.start_time.substring(0, 5)} - {cls.end_time.substring(0, 5)}</div>
            {cls.classroom && <div className="text-purple-500">📍 {cls.classroom}</div>}
          </div>
        ))}

        {/* Boş slot */}
        {!availability && dayAppointments.length === 0 && dayClasses.length === 0 && (
          <div className="text-gray-400 text-xs text-center mt-4">Boş</div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - {weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)} 
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Önceki Hafta
            </button>
            <button 
              onClick={() => setCurrentWeekOffset(0)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bu Hafta
            </button>
            <button 
              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)} 
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sonraki Hafta →
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Müsait</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Randevu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Sınıf Dersi</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-3 text-center font-semibold text-gray-700 w-24 bg-gray-100">
                Saat
              </th>
              {weekDates.map(dayInfo => {
                const today = new Date()
                const isToday = 
                  dayInfo.date.getDate() === today.getDate() && 
                  dayInfo.date.getMonth() === today.getMonth() &&
                  dayInfo.date.getFullYear() === today.getFullYear()
                
                return (
                  <th 
                    key={dayInfo.value} 
                    className={`border border-gray-200 p-3 text-center font-semibold min-w-[140px] ${
                      isToday ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div>{dayInfo.label}</div>
                    <div className={`text-xs font-normal mt-1 ${isToday ? 'text-blue-100' : 'text-gray-500'}`}>
                      {dayInfo.dayNumber} {dayInfo.monthName}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="border border-gray-200 p-3 text-center font-medium text-gray-700 bg-gray-50">
                  {hour.toString().padStart(2, '0')}:00
                </td>
                {weekDates.map(dayInfo => (
                  <td key={`${dayInfo.value}-${hour}`} className="border border-gray-200 p-0">
                    {renderSlot(dayInfo, hour)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}