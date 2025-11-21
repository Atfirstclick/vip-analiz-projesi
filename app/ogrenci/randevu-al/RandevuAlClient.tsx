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

      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const dates: string[] = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        
        if (date < today) continue

        const dayOfWeek = date.getDay()
        
        const dayAvailability = availabilities.filter(a => a.day_of_week === dayOfWeek)
        
        if (dayAvailability.length === 0) continue

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        const { data: existingAppointments } = await supabase
          .from('appointments')
          .select('start_time, end_time')
          .eq('teacher_id', selectedTeacher)
          .eq('appointment_date', dateStr)
          .not('status', 'in', '(cancelled_by_student,cancelled_by_teacher)')

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

  // Tarih formatla
  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} - ${days[date.getDay()]}`
  }

  return (
    <div className="space-y-6">
      {/* Mesaj Kartı */}
      {message.text && (
        <div className={`p-4 rounded-xl border-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-300' 
            : message.type === 'warning' 
            ? 'bg-yellow-50 text-yellow-800 border-yellow-300' 
            : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* 1. Ders Seç */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border-2 border-vip-gold/20">
        <label className="flex items-center gap-2 text-xl font-bold text-vip-navy mb-4">
          <span className="text-2xl">1️⃣</span>
          Ders Seçin
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none text-lg transition-all"
        >
          <option value="">📚 Ders seçin...</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Öğretmen Seç */}
      {selectedSubject && (
        <div className="bg-white shadow-lg rounded-2xl p-6 border-2 border-vip-gold/20">
          <label className="flex items-center gap-2 text-xl font-bold text-vip-navy mb-4">
            <span className="text-2xl">2️⃣</span>
            Öğretmen Seçin
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none disabled:bg-gray-100 text-lg transition-all"
          >
            <option value="">👨‍🏫 Öğretmen seçin...</option>
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
        <div className="bg-white shadow-lg rounded-2xl p-6 border-2 border-vip-gold/20">
          <h2 className="flex items-center gap-2 text-xl font-bold text-vip-navy mb-4">
            <span className="text-2xl">3️⃣</span>
            Tarih Seçin
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-vip-gold border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Müsait tarihler yükleniyor...</p>
            </div>
          ) : availableDates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-xl text-gray-600">📅</p>
              <p className="mt-2 text-gray-600">Bu ay için müsait tarih bulunamadı.</p>
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
        <div className="bg-white shadow-lg rounded-2xl p-6 border-2 border-vip-gold/20">
          <h2 className="flex items-center gap-2 text-xl font-bold text-vip-navy mb-2">
            <span className="text-2xl">4️⃣</span>
            Saat Seçin
          </h2>
          <p className="text-sm text-gray-600 mb-6 ml-8">
            📅 {formatDate(selectedDate)}
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                  selectedSlot === slot
                    ? 'border-vip-gold bg-vip-gold text-vip-navy shadow-lg scale-105'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-vip-gold hover:bg-vip-gold/10'
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
        <div className="bg-white shadow-lg rounded-2xl p-6 border-2 border-vip-gold/20">
          <label className="flex items-center gap-2 text-xl font-bold text-vip-navy mb-4">
            <span className="text-2xl">5️⃣</span>
            Not Ekle (Opsiyonel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Randevu hakkında not ekleyebilirsiniz..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none transition-all"
          />
        </div>
      )}

      {/* 6. Onayla */}
      {selectedSlot && (
        <div className="bg-white shadow-lg rounded-2xl p-6 border-2 border-vip-gold/20">
          <button
            onClick={handleCreateAppointment}
            disabled={loading}
            className="w-full bg-vip-navy text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-vip-gold hover:text-vip-navy disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Randevu Oluşturuluyor...
              </span>
            ) : (
              '✓ Randevuyu Onayla'
            )}
          </button>
        </div>
      )}
    </div>
  )
}