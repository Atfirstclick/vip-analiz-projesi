'use client'

interface MonthlyCalendarProps {
  availableDates: string[]
  selectedDate: string | null
  onDateSelect: (date: string) => void
  currentMonth: Date
  onMonthChange: (newMonth: Date) => void
}

export default function MonthlyCalendar({
  availableDates,
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange
}: MonthlyCalendarProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Ayın ilk günü (Pazartesi başlangıçlı: 0=Pzt, 6=Paz)
  let firstDay = new Date(year, month, 1).getDay()
  firstDay = firstDay === 0 ? 6 : firstDay - 1
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Bu ayın ilk günü
  const firstDayOfMonth = new Date(year, month, 1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  // Önceki ay disabled mi? (geçmişse)
  const isPreviousMonthDisabled = firstDayOfMonth <= today

  // Önceki ay
  function handlePreviousMonth() {
    if (isPreviousMonthDisabled) return
    const newDate = new Date(year, month - 1, 1)
    onMonthChange(newDate)
  }

  // Sonraki ay
  function handleNextMonth() {
    const newDate = new Date(year, month + 1, 1)
    onMonthChange(newDate)
  }

  // Günleri oluştur
  const days = []
  
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-16" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dateObj = new Date(year, month, day)
    
    const isPast = dateObj < today
    const isAvailable = availableDates.includes(dateStr)
    const isSelected = selectedDate === dateStr
    const isToday = dateObj.getTime() === today.getTime()

    days.push(
      <button
        key={day}
        onClick={() => !isPast && isAvailable && onDateSelect(dateStr)}
        disabled={isPast || !isAvailable}
        className={`
          h-16 rounded-lg border-2 font-medium transition-all
          ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : ''}
          ${!isSelected && isAvailable && !isPast ? 'border-green-400 bg-green-50 text-green-700 hover:border-green-500 hover:bg-green-100' : ''}
          ${!isAvailable || isPast ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
          ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
        `}
      >
        <div className="text-lg">{day}</div>
        {isAvailable && !isPast && (
          <div className="text-xs mt-1">✓</div>
        )}
      </button>
    )
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  return (
    <div>
      {/* Ay Başlığı + Navigasyon */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={handlePreviousMonth}
          disabled={isPreviousMonthDisabled}
          className={`p-2 rounded-lg transition-colors ${
            isPreviousMonthDisabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Önceki ay"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-xl font-bold text-gray-900 min-w-[180px] text-center">
          {monthNames[month]} {year}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Sonraki ay"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Takvim Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>

      {/* Açıklama */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border-2 border-green-400 rounded" />
          <span className="text-gray-600">Müsait</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded" />
          <span className="text-gray-600">Müsait değil</span>
        </div>
      </div>
    </div>
  )
}