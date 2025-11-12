'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  notes: string | null
  created_at: string
  student: {
    id: string
    full_name: string
    email: string
  }
  subject: {
    id: string
    name: string
  }
}

interface RandevularimClientProps {
  appointments: Appointment[]
  teacherId: string
}

export default function RandevularimClient({ appointments: initialAppointments, teacherId }: RandevularimClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past' | 'cancelled'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesText, setNotesText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const filteredAppointments = appointments.filter(apt => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const aptDate = new Date(apt.appointment_date)

  if (filter === 'today') {
    return aptDate.getTime() === today.getTime() && apt.status !== 'cancelled_by_teacher' && apt.status !== 'cancelled_by_student'
  } else if (filter === 'upcoming') {
    return aptDate >= tomorrow && (apt.status === 'scheduled')
  } else if (filter === 'past') {
    return aptDate < today || apt.status === 'completed'
  } else if (filter === 'cancelled') {
    return apt.status === 'cancelled_by_teacher' || apt.status === 'cancelled_by_student'
  }
  return true
})

  async function handleStatusChange(appointmentId: string, newStatus: 'completed' | 'cancelled_by_teacher') {
    const confirmMsg = newStatus === 'completed' 
      ? 'Bu randevuyu tamamlandı olarak işaretlemek istediğinizden emin misiniz?'
      : 'Bu randevuyu iptal etmek istediğinizden emin misiniz?'
    
    if (!confirm(confirmMsg)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)

      if (error) throw error

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      )

      setMessage({ 
        type: 'success', 
        text: newStatus === 'completed' ? 'Randevu tamamlandı olarak işaretlendi' : 'Randevu iptal edildi' 
      })
      
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus })
      }

      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: 'İşlem başarısız: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveNotes() {
    if (!selectedAppointment) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ notes: notesText || null })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.id ? { ...apt, notes: notesText || null } : apt
        )
      )

      setSelectedAppointment({ ...selectedAppointment, notes: notesText || null })
      setEditingNotes(false)
      setMessage({ type: 'success', text: 'Notlar kaydedildi' })

      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Notlar kaydedilemedi: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      scheduled: { text: 'Planlandı', class: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Tamamlandı', class: 'bg-green-100 text-green-800' },
      cancelled_by_student: { text: 'İptal Edildi (Öğrenci)', class: 'bg-orange-100 text-orange-800' },
      cancelled_by_teacher: { text: 'İptal Edildi (Öğretmen)', class: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        {badge.text}
      </span>
    )
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} - ${days[date.getDay()]}`
  }

  function openDetailModal(apt: Appointment) {
    setSelectedAppointment(apt)
    setNotesText(apt.notes || '')
    setEditingNotes(false)
  }

  return (
    <div>
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Tümü ({appointments.length})
          </button>
          <button onClick={() => setFilter('today')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Bugün
          </button>
          <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Gelecek
          </button>
          <button onClick={() => setFilter('past')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Geçmiş
          </button>
          <button onClick={() => setFilter('cancelled')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            İptal Edilenler
          </button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz randevu yok</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Henüz hiç randevu oluşturulmamış.'
              : 'Bu filtrede gösterilecek randevu bulunamadı.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{apt.subject.name}</h3>
                    {getStatusBadge(apt.status)}
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">👨‍🎓 Öğrenci:</span>
                      {apt.student.full_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📅 Tarih:</span>
                      {formatDate(apt.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">🕐 Saat:</span>
                      {apt.start_time} - {apt.end_time}
                    </div>
                    {apt.notes && (
                      <div className="flex items-start gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">📝 Not:</span>
                        <span className="flex-1">{apt.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button onClick={() => openDetailModal(apt)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    Detay
                  </button>
                  {apt.status === 'scheduled' && (
                    <>
                      <button onClick={() => handleStatusChange(apt.id, 'completed')} disabled={loading} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50">
                        Tamamlandı
                      </button>
                      <button onClick={() => handleStatusChange(apt.id, 'cancelled_by_teacher')} disabled={loading} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50">
                        İptal Et
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Randevu Detayı</h2>
              <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ders</label>
                <p className="text-lg text-gray-900">{selectedAppointment.subject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Öğrenci</label>
                <p className="text-lg text-gray-900">{selectedAppointment.student.full_name}</p>
                <p className="text-sm text-gray-600">{selectedAppointment.student.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tarih</label>
                <p className="text-lg text-gray-900">{formatDate(selectedAppointment.appointment_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Saat</label>
                <p className="text-lg text-gray-900">{selectedAppointment.start_time} - {selectedAppointment.end_time}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Durum</label>
                <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Notlar</label>
                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Randevu notları..." />
                    <div className="flex gap-2">
                      <button onClick={handleSaveNotes} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                        Kaydet
                      </button>
                      <button onClick={() => { setEditingNotes(false); setNotesText(selectedAppointment.notes || '') }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {selectedAppointment.notes ? (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">Not eklenmemiş</p>
                    )}
                    <button onClick={() => setEditingNotes(true)} className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      {selectedAppointment.notes ? 'Düzenle' : 'Not Ekle'}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</label>
                <p className="text-gray-900">{new Date(selectedAppointment.created_at).toLocaleString('tr-TR')}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              {selectedAppointment.status === 'scheduled' && (
                <>
                  <button onClick={() => handleStatusChange(selectedAppointment.id, 'completed')} disabled={loading} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                    Tamamlandı Olarak İşaretle
                  </button>
                  <button onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled_by_teacher')} disabled={loading} className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                    Randevuyu İptal Et
                  </button>
                </>
              )}
              <button onClick={() => setSelectedAppointment(null)} className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}