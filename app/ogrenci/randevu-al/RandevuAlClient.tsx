'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import MonthlyCalendar from './MonthlyCalendar'

interface Subject {
  id: string
  name: string
}

interface Teacher {
  id: string
  user_id: string
  profiles: {
    full_name: string
  }
}

interface RandevuAlClientProps {
  subjects: Subject[]
}

export default function RandevuAlClient({ subjects }: RandevuAlClientProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  
  // Takvim için
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Ders seçilince öğretmenleri yükle
  useEffect(() => {
    if (selectedSubject) {
      loadTeachers()
    } else {
      setTeachers([])
      setSelectedTeacher('')
    }
  }, [selectedSubject])

  // Öğretmen seçilince müsait tarihleri yükle
  useEffect(() => {
    if (selectedTeacher) {
      loadAvailableDates()
    } else {
      setAvailableDates([])
      setSelectedDate(null)
    }
  }, [selectedTeacher, currentMonth])

  // Tarih seçilince müsait saatleri yükle
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots()
    } else {
      setAvailableSlots([])
      setSelectedSlot('')
    }
  }, [selectedDate])

  // Öğretmenleri yükle
  async function loadTeachers() {
    setLoading(true)
    try {
      const { data: teacherSubjects, error: tsError } = await supabase
        .from('teacher_subjects')
        .select('teacher_id')
        .eq('subject_id', selectedSubject)

      if (tsError) throw tsError

      if (!teacherSubjects || teacherSubjects.length === 0) {
        setTeachers([])
        setMessage({ type: 'warning', text: 'Bu ders için öğretmen bulunamadı' })
        return
      }

      const teacherIds = [...new Set(teacherSubjects.map(ts => ts.teacher_id))]

      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, user_id')
        .in('id', teacherIds)

      if (teachersError) throw teachersError

      if (!teachersData || teachersData.length === 0) {
        setTeachers([])
        return
      }

      const userIds = teachersData.map(t => t.user_id)
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      if (profilesError) throw profilesError

      const teachersWithProfiles = teachersData.map(teacher => ({
        id: teacher.id,
        user_id: teacher.user_id,
        profiles: profiles?.find(p => p.id === teacher.user_id) || { full_name: 'İsimsiz' }
      }))

      setTeachers(teachersWithProfiles as Teacher[])
      setMessage({ type: '', text: '' })
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Öğretmenler yüklenemedi: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  // Öğretmenin müsait tarihlerini hesapla (aylık)
  async function loadAvailableDates() {
    setLoading(true)
    try {
      // Öğretmenin tüm müsaitliklerini al
      const { data: availabilities, error: availError } = await supabase
        .from('availabilities')
        .select('day_of_week, start_time, end_time')
        .eq('teacher_id', selectedTeacher)
        .eq('is_active', true)
        .eq('is_recurring', true)

      if (availError) throw availError

      if (!availabilities || availabilities.length === 0) {
        setAvailableDates([])
        return
      }

      // Bu aydaki tüm günleri kontrol et
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const dates: string[] = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        
        // Geçmiş tarih mi?
        if (date < today) continue

        const dayOfWeek = date.getDay()
        
        // Bu günde öğretmen müsait mi?
        const dayAvailability = availabilities.filter(a => a.day_of_week === dayOfWeek)
        
        if (dayAvailability.length === 0) continue

        // Tarih string'i
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        // Bu tarihte en az 1 boş slot var mı kontrol et
        const { data: existingAppointments } = await supabase
          .from('appointments')
          .select('start_time, end_time')
          .eq('teacher_id', selectedTeacher)
          .eq('appointment_date', dateStr)
          .not('status', 'in', '(cancelled_by_student,cancelled_by_teacher)')

        // Boş slot sayısını hesapla
        let hasAvailableSlot = false

        for (const avail of dayAvailability) {
          const startHour = parseInt(avail.start_time.split(':')[0])
          const endHour = parseInt(avail.end_time.split(':')[0])

          for (let hour = startHour; hour < endHour; hour++) {
            const slotStart = `${hour.toString().padStart(2, '0')}:00`
            const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`

            const isBooked = existingAppointments?.some((apt: any) => {
              return slotStart >= apt.start_time && slotStart < apt.end_time
            })

            if (!isBooked) {
              hasAvailableSlot = true
              break
            }
          }

          if (hasAvailableSlot) break
        }

        if (hasAvailableSlot) {
          dates.push(dateStr)
        }
      }

      setAvailableDates(dates)
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Müsait tarihler yüklenemedi' })
    } finally {
      setLoading(false)
    }
  }

  // Seçilen tarihte müsait saatleri yükle
  async function loadAvailableSlots() {
    if (!selectedDate) return

    setLoading(true)
    try {
      const date = new Date(selectedDate)
      const dayOfWeek = date.getDay()

      const { data: availabilities, error: availError } = await supabase
        .from('availabilities')
        .select('start_time, end_time')
        .eq('teacher_id', selectedTeacher)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .eq('is_recurring', true)

      if (availError) throw availError

      if (!availabilities || availabilities.length === 0) {
        setAvailableSlots([])
        return
      }

      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('teacher_id', selectedTeacher)
        .eq('appointment_date', selectedDate)
        .not('status', 'in', '(cancelled_by_student,cancelled_by_teacher)')

      const slots: string[] = []
      
      availabilities.forEach((avail: any) => {
        const startHour = parseInt(avail.start_time.split(':')[0])
        const endHour = parseInt(avail.end_time.split(':')[0])

        for (let hour = startHour; hour < endHour; hour++) {
          const slotStart = `${hour.toString().padStart(2, '0')}:00`
          const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`

          const isBooked = existingAppointments?.some((apt: any) => {
            return slotStart >= apt.start_time && slotStart < apt.end_time
          })

          if (!isBooked) {
            slots.push(`${slotStart} - ${slotEnd}`)
          }
        }
      })

      setAvailableSlots(slots)
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Müsait saatler yüklenemedi' })
    } finally {
      setLoading(false)
    }
  }

  // Randevu oluştur
  async function handleCreateAppointment() {
    if (!selectedSubject || !selectedTeacher || !selectedDate || !selectedSlot) {
      setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun' })
      return
    }

    setLoading(true)
    try {
      const [startTime, endTime] = selectedSlot.split(' - ')

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { error } = await supabase
        .from('appointments')
        .insert({
          teacher_id: selectedTeacher,
          student_id: user.id,
          subject_id: selectedSubject,
          appointment_date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          status: 'scheduled',
          notes: notes || null
        })

      if (error) throw error

      setMessage({ type: 'success', text: '✓ Randevu başarıyla oluşturuldu!' })
      
      // Formu temizle
      setTimeout(() => {
        setSelectedSubject('')
        setSelectedTeacher('')
        setSelectedDate(null)
        setSelectedSlot('')
        setNotes('')
        setMessage({ type: '', text: '' })
      }, 2000)
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Randevu oluşturulamadı' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Tarih formatla (görüntüleme için)
  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} - ${days[date.getDay()]}`
  }

  return (
    <div className="space-y-8">
      {/* Mesaj */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* 1. Ders Seç */}
      <div className="bg-white shadow rounded-lg p-6">
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          1️⃣ Ders Seçin
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        >
          <option value="">Ders seçin...</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Öğretmen Seç */}
      {selectedSubject && (
        <div className="bg-white shadow rounded-lg p-6">
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            2️⃣ Öğretmen Seçin
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-lg"
          >
            <option value="">Öğretmen seçin...</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.profiles?.full_name || 'İsimsiz'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3. Takvim */}
      {selectedTeacher && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            3️⃣ Tarih Seçin
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Müsait tarihler yükleniyor...</p>
            </div>
          ) : availableDates.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              Bu ay için müsait tarih bulunamadı.
            </div>
          ) : (
            <MonthlyCalendar
              availableDates={availableDates}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          )}
        </div>
      )}

      {/* 4. Saat Seç */}
      {selectedDate && availableSlots.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            4️⃣ Saat Seçin
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {formatDate(selectedDate)}
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  selectedSlot === slot
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Not Ekle */}
      {selectedSlot && (
        <div className="bg-white shadow rounded-lg p-6">
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            5️⃣ Not Ekle (Opsiyonel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Randevu hakkında not ekleyebilirsiniz..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* 6. Onayla */}
      {selectedSlot && (
        <div className="bg-white shadow rounded-lg p-6">
          <button
            onClick={handleCreateAppointment}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Randevu Oluşturuluyor...' : '✓ Randevuyu Onayla'}
          </button>
        </div>
      )}
    </div>
  )
}