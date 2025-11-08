'use client'

import { useState } from 'react'
import { Availability, WeekSchedule, DAY_NAMES, WORK_HOURS } from './types'

interface WeeklyCalendarProps {
  availabilities: Availability[]
  onSlotClick: (day: number, hour: number) => void
  onAvailabilityClick: (availability: Availability) => void
}

export default function WeeklyCalendar({
  availabilities,
  onSlotClick,
  onAvailabilityClick
}: WeeklyCalendarProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  
  // Availabilities'i grid formatına dönüştür
  function buildWeekSchedule(): WeekSchedule {
    const schedule: WeekSchedule = {
      0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}
    }

    availabilities.forEach(avail => {
      const startHour = parseInt(avail.start_time.split(':')[0])
      const endHour = parseInt(avail.end_time.split(':')[0])

      for (let hour = startHour; hour < endHour; hour++) {
        if (WORK_HOURS.includes(hour)) {
          schedule[avail.day_of_week][hour] = {
            hour,
            available: true,
            availabilityId: avail.id,
            notes: avail.notes || undefined
          }
        }
      }
    })

    return schedule
  }

  const weekSchedule = buildWeekSchedule()

  // Liste görünümü için gruplama
  function groupAvailabilitiesByDay() {
    const grouped: { [key: number]: Availability[] } = {}
    
    availabilities.forEach(avail => {
      if (!grouped[avail.day_of_week]) {
        grouped[avail.day_of_week] = []
      }
      grouped[avail.day_of_week].push(avail)
    })

    return grouped
  }

  const groupedAvailabilities = groupAvailabilitiesByDay()

  return (
    <div>
      {/* Mobil Görünüm Değiştirici */}
      <div className="lg:hidden mb-4 flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300'
          }`}
        >
          📋 Liste
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300'
          }`}
        >
          📅 Takvim
        </button>
      </div>

      {/* Grid Görünümü - Desktop: Her zaman, Mobil: Sadece grid seçiliyse */}
      <div className={`${viewMode === 'grid' ? 'block' : 'hidden'} lg:block`}>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b bg-gray-50">
              <div className="col-span-1 p-3 font-semibold text-gray-700 text-center">
                Saat
              </div>
              {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => (
                <div
                  key={dayIndex}
                  className="p-3 text-center font-semibold text-gray-700 border-l"
                >
                  <span className="hidden sm:inline">{DAY_NAMES[dayIndex]}</span>
                  <span className="sm:hidden">{DAY_NAMES[dayIndex].slice(0, 3)}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="divide-y">
              {WORK_HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 hover:bg-gray-50">
                  <div className="col-span-1 p-3 text-sm text-gray-600 font-medium text-center border-r bg-gray-50">
                    {hour.toString().padStart(2, '0')}:00
                  </div>

                  {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
                    const slot = weekSchedule[dayIndex][hour]
                    const isAvailable = slot?.available

                    return (
                      <button
                        key={`${dayIndex}-${hour}`}
                        onClick={() => {
                          if (isAvailable && slot.availabilityId) {
                            const availability = availabilities.find(
                              a => a.id === slot.availabilityId
                            )
                            if (availability) {
                              onAvailabilityClick(availability)
                            }
                          } else {
                            onSlotClick(dayIndex, hour)
                          }
                        }}
                        className={`
                          p-3 text-xs border-l transition-colors relative
                          ${isAvailable 
                            ? 'bg-green-50 hover:bg-green-100 text-green-800 font-medium' 
                            : 'bg-white hover:bg-blue-50 text-gray-400'
                          }
                        `}
                      >
                        {isAvailable ? (
                          <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-lg">✓</span>
                            <span className="text-xs hidden sm:inline">Müsait</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-2xl text-gray-300">+</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="border-t bg-gray-50 px-6 py-3 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Müsait</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span className="text-gray-600">Boş</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste Görünümü - Sadece mobilde ve liste seçiliyse */}
      <div className={`${viewMode === 'list' ? 'block' : 'hidden'} lg:hidden`}>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
            const dayAvailabilities = groupedAvailabilities[dayIndex] || []

            return (
              <div key={dayIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <h3 className="text-white font-semibold text-lg">
                    {DAY_NAMES[dayIndex]}
                  </h3>
                </div>
                
                <div className="p-4">
                  {dayAvailabilities.length > 0 ? (
                    <div className="space-y-3">
                      {dayAvailabilities.map(avail => (
                        <button
                          key={avail.id}
                          onClick={() => onAvailabilityClick(avail)}
                          className="w-full text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-green-800">
                                ⏰ {avail.start_time} - {avail.end_time}
                              </div>
                              {avail.notes && (
                                <div className="text-sm text-gray-600 mt-1">
                                  📝 {avail.notes}
                                </div>
                              )}
                            </div>
                            <div className="text-green-600 text-2xl">
                              ✓
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => onSlotClick(dayIndex, 9)}
                      className="w-full bg-gray-50 hover:bg-blue-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 transition-colors"
                    >
                      <div className="text-3xl mb-2">+</div>
                      <div className="text-sm">Müsaitlik eklemek için tıklayın</div>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}