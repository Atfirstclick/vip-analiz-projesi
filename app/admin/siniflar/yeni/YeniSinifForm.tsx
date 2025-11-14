'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const GRADE_OPTIONS = ['4', '5', '6', '7', '8', '9', '10', '11', '12', 'Mezun']

export default function YeniSinifForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    name: '',
    grade: '9',
    season: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1), // 2025-2026
    max_students: 10,
    is_active: true
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
      // Aynı isim ve sezonda sınıf var mı kontrol et
      const { data: existing } = await supabase
        .from('classes')
        .select('id')
        .eq('name', formData.name)
        .eq('season', formData.season)
        .single()

      if (existing) {
        throw new Error('Bu isimde ve sezonda zaten bir sınıf var!')
      }

      // Yeni sınıf oluştur
      const { error } = await supabase
        .from('classes')
        .insert({
          name: formData.name,
          grade: formData.grade,
          season: formData.season,
          max_students: formData.max_students,
          is_active: formData.is_active
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Sınıf başarıyla oluşturuldu!' })
      
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
          <p className="text-sm text-gray-500 mt-1">
            Sınıfın görünen adı (örn: 9A, 10B, 11 Fen)
          </p>
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
          <p className="text-sm text-gray-500 mt-1">
            Akademik yıl/sezon (örn: 2024-2025, 2025-2026)
          </p>
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
          <p className="text-sm text-gray-500 mt-1">
            Bu sınıfa eklenebilecek maksimum öğrenci sayısı (varsayılan: 10)
          </p>
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
          <p className="text-sm text-gray-500">
            (Pasif sınıflar sistem genelinde gizlenir)
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Oluşturuluyor...' : 'Sınıfı Oluştur'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  )
}