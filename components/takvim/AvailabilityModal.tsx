'use client'

import { useState, useEffect } from 'react'
import { Availability, DAY_NAMES } from './types'

interface AvailabilityModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AvailabilityFormData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  editingAvailability?: Availability | null
  preselectedDay?: number
  preselectedHour?: number
}

export interface AvailabilityFormData {
  day_of_week: number
  start_time: string
  end_time: string
  notes: string
  is_recurring: boolean
}

export default function AvailabilityModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingAvailability,
  preselectedDay,
  preselectedHour
}: AvailabilityModalProps) {
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AvailabilityFormData>({
    day_of_week: preselectedDay ?? 1,
    start_time: preselectedHour ? `${preselectedHour.toString().padStart(2, '0')}:00` : '09:00',
    end_time: preselectedHour ? `${(preselectedHour + 1).toString().padStart(2, '0')}:00` : '10:00',
    notes: '',
    is_recurring: true
  })

  useEffect(() => {
    if (editingAvailability) {
      setFormData({
        day_of_week: editingAvailability.day_of_week,
        start_time: editingAvailability.start_time,
        end_time: editingAvailability.end_time,
        notes: editingAvailability.notes || '',
        is_recurring: editingAvailability.is_recurring
      })
    } else if (preselectedDay !== undefined && preselectedHour !== undefined) {
      setFormData({
        day_of_week: preselectedDay,
        start_time: `${preselectedHour.toString().padStart(2, '0')}:00`,
        end_time: `${(preselectedHour + 1).toString().padStart(2, '0')}:00`,
        notes: '',
        is_recurring: true
      })
    }
  }, [editingAvailability, preselectedDay, preselectedHour])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Kaydetme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!editingAvailability || !onDelete) return
    
    if (confirm('Bu müsaitliği silmek istediğinize emin misiniz?')) {
      setLoading(true)
      try {
        await onDelete(editingAvailability.id)
        onClose()
      } catch (error) {
        console.error('Silme hatası:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingAvailability ? 'Müsaitliği Düzenle' : 'Yeni Müsaitlik Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gün Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gün *
            </label>
            <select
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {DAY_NAMES.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Başlangıç Saati */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Saati *
            </label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Bitiş Saati */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Saati *
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: Online ders, Yüz yüze..."
              rows={3}
            />
          </div>

          {/* Tekrarlayan */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700">
              Her hafta tekrarla
            </label>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 pt-4">
            {editingAvailability && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-red-300 transition-colors"
              >
                Sil
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}