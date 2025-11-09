'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

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

interface Availability {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

interface RandevuAlClientProps {
  subjects: Subject[]
}

export default function RandevuAlClient({ subjects }: RandevuAlClientProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
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

  // Öğretmen ve tarih seçilince müsait saatleri yükle
  useEffect(() => {
    if (selectedTeacher && selectedDate) {
      loadAvailableSlots()
    } else {
      setAvailableSlots([])
      setSelectedSlot('')
    }
  }, [selectedTeacher, selectedDate])

  // Öğretmenleri yükle
  async function loadTeachers() {
    setLoading(true)
    try {
      // 1. teacher_subjects'ten teacher_id'leri al
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

      // Unique teacher ID'leri
      const teacherIds = [...new Set(teacherSubjects.map(ts => ts.teacher_id))]

      // 2. Teachers ve profiles bilgilerini al
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, user_id')
        .in('id', teacherIds)

      if (teachersError) throw teachersError

      if (!teachersData || teachersData.length === 0) {
        setTeachers([])
        return
      }

      // 3. Profile bilgilerini al
      const userIds = teachersData.map(t => t.user_id)
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      if (profilesError) throw profilesError

      // 4. Birleştir
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

  // Müsait saatleri yükle
  async function loadAvailableSlots() {
    setLoading(true)
    try {
      const date = new Date(selectedDate)
      const dayOfWeek = date.getDay() // 0=Pazar, 1=Pazartesi...

      // Öğretmenin o gün müsaitliklerini al
      const { data: availabilities, error: availError } = await supabase
        .from('availabilities')
        .select('id, day_of_week, start_time, end_time')
        .eq('teacher_id', selectedTeacher)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .eq('is_recurring', true)

      if (availError) throw availError

      if (!availabilities || availabilities.length === 0) {
        setAvailableSlots([])
        setMessage({ type: 'warning', text: 'Bu tarihte öğretmen müsait değil' })
        return
      }

      // O tarihte var olan randevuları al
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('teacher_id', selectedTeacher)
        .eq('appointment_date', selectedDate)
        .not('status', 'in', '(cancelled_by_student,cancelled_by_teacher)')

      // Müsait slotları hesapla
      const slots: string[] = []
      
      availabilities.forEach((avail: Availability) => {
        const startHour = parseInt(avail.start_time.split(':')[0])
        const endHour = parseInt(avail.end_time.split(':')[0])

        for (let hour = startHour; hour < endHour; hour++) {
          const slotStart = `${hour.toString().padStart(2, '0')}:00`
          const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`

          // Bu slot dolu mu kontrol et
          const isBooked = existingAppointments?.some((apt: any) => {
            return slotStart >= apt.start_time && slotStart < apt.end_time
          })

          if (!isBooked) {
            slots.push(`${slotStart} - ${slotEnd}`)
          }
        }
      })

      setAvailableSlots(slots)
      
      if (slots.length === 0) {
        setMessage({ type: 'warning', text: 'Bu tarihte tüm saatler dolu' })
      } else {
        setMessage({ type: '', text: '' })
      }
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
      // Slot'u parçala (örn: "10:00 - 11:00")
      const [startTime, endTime] = selectedSlot.split(' - ')

      // Kullanıcı ID'sini al
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
        setSelectedDate('')
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

  // Minimum tarih (bugün)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Mesaj */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* 1. Ders Seç */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1️⃣ Ders Seçin
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2️⃣ Öğretmen Seçin
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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

        {/* 3. Tarih Seç */}
        {selectedTeacher && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3️⃣ Tarih Seçin
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* 4. Saat Seç */}
        {selectedDate && availableSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              4️⃣ Saat Seçin
            </label>
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

        {/* 5. Not Ekle (Opsiyonel) */}
        {selectedSlot && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Randevu Al Butonu */}
        {selectedSlot && (
          <button
            onClick={handleCreateAppointment}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {loading ? 'Randevu Oluşturuluyor...' : '✓ Randevuyu Onayla'}
          </button>
        )}
      </div>
    </div>
  )
}