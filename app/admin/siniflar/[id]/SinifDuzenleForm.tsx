'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const GRADE_OPTIONS = ['4', '5', '6', '7', '8', '9', '10', '11', '12', 'Mezun']

interface ClassData {
  id: string
  name: string
  grade: string
  season: string
  max_students: number
  is_active: boolean
}

export default function SinifDuzenleForm({ classData }: { classData: ClassData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    name: classData.name,
    grade: classData.grade,
    season: classData.season,
    max_students: classData.max_students,
    is_active: classData.is_active
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Güncelle
      const { error } = await supabase
        .from('classes')
        .update({
          name: formData.name,
          grade: formData.grade,
          season: formData.season,
          max_students: formData.max_students,
          is_active: formData.is_active
        })
        .eq('id', classData.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Sınıf başarıyla güncellendi!' })
      
      setTimeout(() => {
        router.push('/admin/siniflar')
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Bu sınıfı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve sınıfa ait tüm öğrenci atamaları ve ders programı silinecektir!')) {
      return
    }

    setDeleting(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classData.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Sınıf silindi, yönlendiriliyorsunuz...' })
      
      setTimeout(() => {
        router.push('/admin/siniflar')
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sınıf Adı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sınıf Adı *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Örn: 9A, 10 Fen, 11B"
            required
          />
        </div>

        {/* Seviye */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seviye *
          </label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {GRADE_OPTIONS.map(grade => (
              <option key={grade} value={grade}>
                {grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`}
              </option>
            ))}
          </select>
        </div>

        {/* Sezon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sezon *
          </label>
          <input
            type="text"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="2024-2025"
            required
          />
        </div>

        {/* Max Öğrenci */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maksimum Öğrenci Sayısı *
          </label>
          <input
            type="number"
            value={formData.max_students}
            onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="50"
            required
          />
        </div>

        {/* Aktif/Pasif */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Sınıf aktif
          </label>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading || deleting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading || deleting}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            İptal
          </button>
        </div>

        {/* Sil Butonu */}
        <div className="pt-4 border-t">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
          >
            {deleting ? 'Siliniyor...' : '🗑️ Sınıfı Sil'}
          </button>
          <p className="text-sm text-red-600 mt-2 text-center">
            ⚠️ Bu işlem geri alınamaz! Tüm öğrenci atamaları ve ders programı silinecektir.
          </p>
        </div>
      </form>
    </div>
  )
}