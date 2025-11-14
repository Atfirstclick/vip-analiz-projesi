'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ClassData {
  id: string
  name: string
  grade: string
  season: string
}

interface Subject {
  id: string
  name: string
  icon: string
}

interface Teacher {
  id: string
  full_name: string
}

interface Schedule {
  id: string
  class_id: string
  subject_id: string
  teacher_id: string
  day_of_week: number
  start_time: string
  end_time: string
  classroom: string | null
  subject: Subject
  teacher: Teacher
}

interface Props {
  classData: ClassData
  schedule: Schedule[]
  subjects: Subject[]
  teachers: Teacher[]
}

const DAYS = [
  { value: 1, label: 'Pazartesi', short: 'Pzt' },
  { value: 2, label: 'Salı', short: 'Sal' },
  { value: 3, label: 'Çarşamba', short: 'Çar' },
  { value: 4, label: 'Perşembe', short: 'Per' },
  { value: 5, label: 'Cuma', short: 'Cum' },
  { value: 6, label: 'Cumartesi', short: 'Cmt' },
  { value: 7, label: 'Pazar', short: 'Paz' }
]

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

export default function ProgramClient({
  classData,
  schedule,
  subjects,
  teachers
}: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  const [formData, setFormData] = useState({
    subject_id: '',
    teacher_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    classroom: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Takvim için ders kartlarını gruplama
  function getScheduleForSlot(day: number, time: string): Schedule | null {
    return schedule.find(sch => {
      if (sch.day_of_week !== day) return false
      const schStart = sch.start_time.substring(0, 5) // "09:00:00" -> "09:00"
      return schStart === time
    }) || null
  }

  function resetForm() {
    setFormData({
      subject_id: '',
      teacher_id: '',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:00',
      classroom: ''
    })
    setEditingSchedule(null)
    setShowForm(false)
  }

  function handleEdit(sch: Schedule) {
    setFormData({
      subject_id: sch.subject_id,
      teacher_id: sch.teacher_id,
      day_of_week: sch.day_of_week,
      start_time: sch.start_time.substring(0, 5),
      end_time: sch.end_time.substring(0, 5),
      classroom: sch.classroom || ''
    })
    setEditingSchedule(sch)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Validation
      if (formData.start_time >= formData.end_time) {
        throw new Error('Bitiş saati başlangıç saatinden büyük olmalı')
      }

      // Çakışma kontrolü (öğretmen)
      const teacherConflict = schedule.find(sch => {
        if (editingSchedule && sch.id === editingSchedule.id) return false
        if (sch.teacher_id !== formData.teacher_id) return false
        if (sch.day_of_week !== formData.day_of_week) return false

        const existingStart = sch.start_time.substring(0, 5)
        const existingEnd = sch.end_time.substring(0, 5)
        const newStart = formData.start_time
        const newEnd = formData.end_time

        // Zaman çakışması var mı?
        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        )
      })

      if (teacherConflict) {
        throw new Error('Bu öğretmen seçili saatte başka bir derse giriyor!')
      }

      // Çakışma kontrolü (sınıf)
      const classConflict = schedule.find(sch => {
        if (editingSchedule && sch.id === editingSchedule.id) return false
        if (sch.day_of_week !== formData.day_of_week) return false

        const existingStart = sch.start_time.substring(0, 5)
        const existingEnd = sch.end_time.substring(0, 5)
        const newStart = formData.start_time
        const newEnd = formData.end_time

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        )
      })

      if (classConflict) {
        throw new Error('Bu sınıfın seçili saatte zaten bir dersi var!')
      }

      if (editingSchedule) {
        // Güncelle
        const { error } = await supabase
          .from('class_schedule')
          .update({
            subject_id: formData.subject_id,
            teacher_id: formData.teacher_id,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            classroom: formData.classroom || null
          })
          .eq('id', editingSchedule.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Ders güncellendi!' })
      } else {
        // Yeni ekle
        const { error } = await supabase
          .from('class_schedule')
          .insert({
            class_id: classData.id,
            subject_id: formData.subject_id,
            teacher_id: formData.teacher_id,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            classroom: formData.classroom || null
          })

        if (error) throw error
        setMessage({ type: 'success', text: 'Ders eklendi!' })
      }

      setTimeout(() => {
        router.refresh()
        resetForm()
        setMessage({ type: '', text: '' })
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(scheduleId: string) {
    if (!confirm('Bu dersi silmek istediğinizden emin misiniz?')) return

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('class_schedule')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Ders silindi!' })
      
      setTimeout(() => {
        router.refresh()
        setMessage({ type: '', text: '' })
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/siniflar" className="hover:text-blue-600">
            Sınıflar
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{classData.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📅 {classData.name} - Haftalık Program
            </h1>
            <p className="mt-2 text-gray-600">
              Sınıfın haftalık ders programını yönetin
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {showForm ? '✕ Kapat' : '+ Ders Ekle'}
          </button>
        </div>
      </div>

      {/* Mesaj */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSchedule ? '✏️ Ders Düzenle' : '➕ Yeni Ders Ekle'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ders *</label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Ders seçin...</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öğretmen *</label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Öğretmen seçin...</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gün *</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {DAYS.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç *</label>
              <select
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş *</label>
              <select
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Derslik</label>
              <input
                type="text"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="A101, B205..."
              />
            </div>

            <div className="md:col-span-3 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Kaydediliyor...' : (editingSchedule ? 'Güncelle' : 'Ders Ekle')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Takvim */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-24">
                Saat
              </th>
              {DAYS.map(day => (
                <th key={day.value} className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(time => (
              <tr key={time}>
                <td className="border border-gray-200 p-3 text-sm font-medium text-gray-600 bg-gray-50">
                  {time}
                </td>
                {DAYS.map(day => {
                  const sch = getScheduleForSlot(day.value, time)
                  return (
                    <td key={day.value} className="border border-gray-200 p-2 align-top h-24">
                      {sch ? (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded text-xs h-full flex flex-col justify-between">
                          <div>
                            <div className="font-semibold text-blue-900">
                              {sch.subject.icon} {sch.subject.name}
                            </div>
                            <div className="text-gray-600 mt-1">
                              👨‍🏫 {sch.teacher.full_name}
                            </div>
                            <div className="text-gray-500 mt-1">
                              ⏰ {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}
                            </div>
                            {sch.classroom && (
                              <div className="text-gray-500">
                                🏫 {sch.classroom}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => handleEdit(sch)}
                              className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(sch.id)}
                              className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-300 text-xs">
                          Boş
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}