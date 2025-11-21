'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  notes: string | null
  created_at: string
  teacher: {
    id: string
    user_id: string
    profiles: {
      full_name: string
    }
  }
  subject: {
    id: string
    name: string
  }
}

interface RandevularimClientProps {
  appointments: Appointment[]
}

export default function RandevularimClient({ appointments: initialAppointments }: RandevularimClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const filteredAppointments = appointments.filter(apt => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const aptDate = new Date(apt.appointment_date)

    if (filter === 'upcoming') {
      return aptDate >= today && apt.status === 'scheduled'
    } else if (filter === 'past') {
      return aptDate < today || apt.status === 'completed'
    } else if (filter === 'cancelled') {
      return apt.status === 'cancelled_by_student' || apt.status === 'cancelled_by_teacher'
    }
    return true
  })

  async function handleCancel(appointmentId: string) {
    if (!confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled_by_student' })
        .eq('id', appointmentId)

      if (error) throw error

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'cancelled_by_student' } : apt
        )
      )

      setMessage({ type: 'success', text: '✓ Randevu başarıyla iptal edildi' })
      setSelectedAppointment(null)

      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Randevu iptal edilemedi: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      scheduled: { text: 'Planlandı', class: 'bg-blue-100 text-blue-800 border-blue-300' },
      completed: { text: 'Tamamlandı', class: 'bg-green-100 text-green-800 border-green-300' },
      cancelled_by_student: { text: 'İptal Edildi (Öğrenci)', class: 'bg-red-100 text-red-800 border-red-300' },
      cancelled_by_teacher: { text: 'İptal Edildi (Öğretmen)', class: 'bg-orange-100 text-orange-800 border-orange-300' }
    }
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800 border-gray-300' }
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${badge.class}`}>
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

  return (
    <div>
      {/* Mesaj */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-300' 
            : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          <p className="font-semibold">{message.text}</p>
        </div>
      )}

      {/* Filtreler */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border-2 border-vip-gold/20">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              filter === 'all' 
                ? 'bg-vip-navy text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-vip-gold/20 hover:text-vip-navy'
            }`}
          >
            Tümü ({appointments.length})
          </button>
          <button 
            onClick={() => setFilter('upcoming')} 
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              filter === 'upcoming' 
                ? 'bg-vip-navy text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-vip-gold/20 hover:text-vip-navy'
            }`}
          >
            📅 Yaklaşan
          </button>
          <button 
            onClick={() => setFilter('past')} 
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              filter === 'past' 
                ? 'bg-vip-navy text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-vip-gold/20 hover:text-vip-navy'
            }`}
          >
            📝 Geçmiş
          </button>
          <button 
            onClick={() => setFilter('cancelled')} 
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              filter === 'cancelled' 
                ? 'bg-vip-navy text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-vip-gold/20 hover:text-vip-navy'
            }`}
          >
            ❌ İptal Edilenler
          </button>
        </div>
      </div>

      {/* Randevu Listesi */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white shadow-lg rounded-2xl p-12 text-center border-2 border-vip-gold/20">
          <div className="text-8xl mb-6">📅</div>
          <h3 className="text-2xl font-bold text-vip-navy mb-3">Henüz randevu yok</h3>
          <p className="text-gray-600 mb-8 text-lg">
            {filter === 'all' 
              ? 'Henüz hiç randevu oluşturmadınız.' 
              : 'Bu filtrede gösterilecek randevu bulunamadı.'}
          </p>
          <Link 
            href="/ogrenci/randevu-al" 
            className="inline-block bg-vip-navy text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-vip-gold hover:text-vip-navy transition-all shadow-lg hover:shadow-xl"
          >
            📅 Randevu Al
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div 
              key={apt.id} 
              className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-vip-gold/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-vip-navy">{apt.subject.name}</h3>
                    {getStatusBadge(apt.status)}
                  </div>
                  <div className="space-y-2.5 text-gray-700">
                    <div className="flex items-center gap-2 text-base">
                      <span className="font-semibold">👨‍🏫 Öğretmen:</span>
                      {apt.teacher.profiles.full_name}
                    </div>
                    <div className="flex items-center gap-2 text-base">
                      <span className="font-semibold">📅 Tarih:</span>
                      {formatDate(apt.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-base">
                      <span className="font-semibold">🕐 Saat:</span>
                      {apt.start_time} - {apt.end_time}
                    </div>
                    {apt.notes && (
                      <div className="flex items-start gap-2 mt-4 p-4 bg-vip-gold/10 rounded-xl border-2 border-vip-gold/30">
                        <span className="font-semibold">📝 Not:</span>
                        <span className="flex-1">{apt.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-6">
                  <button 
                    onClick={() => setSelectedAppointment(apt)} 
                    className="px-5 py-2.5 bg-vip-navy text-white rounded-xl hover:bg-vip-gold hover:text-vip-navy transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Detay
                  </button>
                  {apt.status === 'scheduled' && (
                    <button 
                      onClick={() => handleCancel(apt.id)} 
                      disabled={loading} 
                      className="px-5 py-2.5 bg-red-50 text-red-700 border-2 border-red-300 rounded-xl hover:bg-red-100 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detay Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-vip-gold">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <h2 className="text-3xl font-bold text-vip-navy">Randevu Detayı</h2>
                <button 
                  onClick={() => setSelectedAppointment(null)} 
                  className="text-gray-400 hover:text-vip-navy transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Ders</label>
                <p className="text-xl text-vip-navy font-semibold mt-1">{selectedAppointment.subject.name}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Öğretmen</label>
                <p className="text-xl text-gray-900 font-semibold mt-1">{selectedAppointment.teacher.profiles.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Tarih</label>
                <p className="text-xl text-gray-900 font-semibold mt-1">{formatDate(selectedAppointment.appointment_date)}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Saat</label>
                <p className="text-xl text-gray-900 font-semibold mt-1">{selectedAppointment.start_time} - {selectedAppointment.end_time}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 block">Durum</label>
                {getStatusBadge(selectedAppointment.status)}
              </div>
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Not</label>
                  <p className="text-gray-900 bg-vip-gold/10 p-4 rounded-xl mt-2 border-2 border-vip-gold/30">{selectedAppointment.notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Oluşturulma Tarihi</label>
                <p className="text-gray-900 mt-1">{new Date(selectedAppointment.created_at).toLocaleString('tr-TR')}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 flex gap-3">
              {selectedAppointment.status === 'scheduled' && (
                <button 
                  onClick={() => handleCancel(selectedAppointment.id)} 
                  disabled={loading} 
                  className="flex-1 bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Randevuyu İptal Et
                </button>
              )}
              <button 
                onClick={() => setSelectedAppointment(null)} 
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}