'use client'

import { useState } from 'react'

interface Availability {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_recurring: boolean
  specific_date: string | null
}

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  subject: { name: string }
  student: { full_name: string }
}

interface TeacherWeekCalendarProps {
  teacherId: string
  availabilities: Availability[]
  appointments: Appointment[]
}

export default function TeacherWeekCalendar({ 
  teacherId, 
  availabilities, 
  appointments 
}: TeacherWeekCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(today.setDate(diff))
  })

  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 08:00 - 21:00

  function getWeekDates() {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      return date
    })
  }

  function goToPreviousWeek() {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  function goToNextWeek() {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  function goToToday() {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    setCurrentWeekStart(new Date(today.setDate(diff)))
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function getMonthYear() {
    const start = getWeekDates()[0]
    const end = getWeekDates()[6]
    
    if (start.getMonth() === end.getMonth()) {
      return start.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    } else {
      return `${start.toLocaleDateString('tr-TR', { month: 'long' })} - ${end.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`
    }
  }

  function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  function getSlotData(dayIndex: number, hour: number, date: Date) {
    // dayIndex: 0=Pazartesi, 1=Salı, ..., 6=Pazar
    // Database'de: 1=Pazartesi, 2=Salı, ..., 7=Pazar
    const dbDayOfWeek = dayIndex + 1
    const dateStr = date.toISOString().split('T')[0]
    
    const slotStartMinutes = hour * 60
    const slotEndMinutes = (hour + 1) * 60

    // Müsaitlikleri kontrol et
    const availability = availabilities.find(av => {
      const avStartMinutes = timeToMinutes(av.start_time)
      const avEndMinutes = timeToMinutes(av.end_time)
      
      if (av.is_recurring) {
        const match = av.day_of_week === dbDayOfWeek && 
               slotStartMinutes >= avStartMinutes && 
               slotStartMinutes < avEndMinutes
        

        return match
      } else {
        const match = av.specific_date === dateStr && 
               slotStartMinutes >= avStartMinutes && 
               slotStartMinutes < avEndMinutes
        
        return match
      }
    })

    // Randevuları kontrol et
    const appointment = appointments.find(apt => {
      const aptStartMinutes = timeToMinutes(apt.start_time)
      const aptEndMinutes = timeToMinutes(apt.end_time)
      
      const match = apt.appointment_date === dateStr &&
             slotStartMinutes >= aptStartMinutes &&
             slotStartMinutes < aptEndMinutes &&
             apt.status === 'scheduled'
      

      return match
    })

    return { availability, appointment }
  }

  const weekDates = getWeekDates()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getMonthYear()}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousWeek}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Önceki Hafta
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Bugün
          </button>
          <button
            onClick={goToNextWeek}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sonraki Hafta →
          </button>
        </div>
      </div>

      {/* Renk Açıklamaları */}
      <div className="flex items-center gap-6 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
          <span className="text-sm text-gray-700">Müsait</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
          <span className="text-sm text-gray-700">Randevu Var</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
          <span className="text-sm text-gray-700">Müsait Değil</span>
        </div>
      </div>



      {/* Takvim Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-8 border border-gray-200 rounded-lg overflow-hidden">
            {/* Header - Saat */}
            <div className="bg-gray-50 border-r border-gray-200 p-2 font-semibold text-center text-sm text-gray-700">
              Saat
            </div>

            {/* Header - Günler */}
            {weekDates.map((date, index) => {
              const isToday = date.toISOString().split('T')[0] === today
              return (
                <div
                  key={index}
                  className={`bg-gray-50 border-r border-gray-200 p-2 text-center ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`font-semibold text-sm ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                    {weekDays[index]}
                  </div>
                  <div className={`text-xs mt-1 ${isToday ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                    {date.getDate()} {date.toLocaleDateString('tr-TR', { month: 'short' })}
                  </div>
                </div>
              )
            })}

            {/* Saat Satırları */}
            {hours.map(hour => (
              <div key={hour} className="contents">
                {/* Saat */}
                <div className="bg-gray-50 border-r border-t border-gray-200 p-2 text-center text-sm font-medium text-gray-700">
                  {hour.toString().padStart(2, '0')}:00
                </div>

                {/* Her gün için slot */}
                {weekDates.map((date, dayIndex) => {
                  const { availability, appointment } = getSlotData(dayIndex, hour, date)
                  const isToday = date.toISOString().split('T')[0] === today

                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`border-r border-t border-gray-200 p-1 min-h-[60px] ${
                        isToday ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {appointment ? (
                        <div className="bg-blue-200 border border-blue-400 rounded p-2 h-full">
                          <div className="text-xs font-semibold text-blue-900">
                            📅 {appointment.subject.name}
                          </div>
                          <div className="text-xs text-blue-800 mt-1">
                            👤 {appointment.student.full_name}
                          </div>
                          <div className="text-xs text-blue-700 mt-1">
                            {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                          </div>
                        </div>
                      ) : availability ? (
                        <div className="bg-green-200 border border-green-400 rounded p-2 h-full">
                          <div className="text-xs font-semibold text-green-900">
                            ✓ Müsait
                          </div>
                          <div className="text-xs text-green-800 mt-1">
                            {availability.start_time.slice(0, 5)} - {availability.end_time.slice(0, 5)}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded h-full"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}