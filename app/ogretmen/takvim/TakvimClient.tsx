'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import WeeklyCalendar from '@/components/takvim/WeeklyCalendar'
import AvailabilityModal, { AvailabilityFormData } from '@/components/takvim/AvailabilityModal'
import { Availability } from '@/components/takvim/types'

interface Appointment {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
  student: {
    id: string
    full_name: string
  }
  subject: {
    id: string
    name: string
    icon: string
  }
}

interface ClassSchedule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  classroom: string | null
  class: {
    id: string
    name: string
    grade: string
  }
  subject: {
    id: string
    name: string
    icon: string
  }
}

interface TakvimClientProps {
  teacherId: string
  initialAvailabilities: Availability[]
  appointments: Appointment[]
  classSchedule: ClassSchedule[]
}

export default function TakvimClient({ 
  teacherId, 
  initialAvailabilities,
  appointments,
  classSchedule
}: TakvimClientProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>(initialAvailabilities)
  const [showModal, setShowModal] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null)
  const [preselectedDay, setPreselectedDay] = useState<number | undefined>()
  const [preselectedHour, setPreselectedHour] = useState<number | undefined>()
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function refreshAvailabilities() {
    const { data } = await supabase
      .from('availabilities')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (data) {
      setAvailabilities(data)
    }
  }

  function handleSlotClick(day: number, hour: number) {
    setEditingAvailability(null)
    setPreselectedDay(day)
    setPreselectedHour(hour)
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  function handleAvailabilityClick(availability: Availability) {
    setEditingAvailability(availability)
    setPreselectedDay(undefined)
    setPreselectedHour(undefined)
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  function handleAddNew() {
    setEditingAvailability(null)
    setPreselectedDay(1)
    setPreselectedHour(9)
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  async function handleSave(formData: AvailabilityFormData) {
    setLoading(true)

    try {
      if (editingAvailability) {
        const { error } = await supabase
          .from('availabilities')
          .update({
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            notes: formData.notes || null,
            is_recurring: formData.is_recurring,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAvailability.id)

        if (error) throw error
        setMessage({ type: 'success', text: '✓ Müsaitlik güncellendi!' })
      } else {
        const { error } = await supabase
          .from('availabilities')
          .insert({
            teacher_id: teacherId,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            notes: formData.notes || null,
            is_recurring: formData.is_recurring,
            is_active: true
          })

        if (error) throw error
        setMessage({ type: 'success', text: '✓ Müsaitlik eklendi!' })
      }

      await refreshAvailabilities()
      setShowModal(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Bir hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('availabilities')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: '✓ Müsaitlik silindi!' })
      await refreshAvailabilities()
      setShowModal(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Silinemedi' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Takvim Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Uygun zamanlarınızı belirleyin ve düzenleyin
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Yeni Müsaitlik Ekle
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Toplam Müsaitlik</div>
          <div className="text-2xl font-bold text-gray-900">{availabilities.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Tekrarlayan</div>
          <div className="text-2xl font-bold text-gray-900">
            {availabilities.filter(a => a.is_recurring).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Haftalık Ders Saati</div>
          <div className="text-2xl font-bold text-gray-900">
            {availabilities.reduce((total, a) => {
              const start = parseInt(a.start_time.split(':')[0])
              const end = parseInt(a.end_time.split(':')[0])
              return total + (end - start)
            }, 0)} saat
          </div>
        </div>
      </div>

      {/* 🆕 WeeklyCalendar'a appointments ve classSchedule geç */}
      <WeeklyCalendar
        availabilities={availabilities}
        appointments={appointments}
        classSchedule={classSchedule}
        onSlotClick={handleSlotClick}
        onAvailabilityClick={handleAvailabilityClick}
      />

      <AvailabilityModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingAvailability(null)
          setPreselectedDay(undefined)
          setPreselectedHour(undefined)
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        editingAvailability={editingAvailability}
        preselectedDay={preselectedDay}
        preselectedHour={preselectedHour}
      />
    </div>
  )
}