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
  max_students: number
  is_active: boolean
}

interface Student {
  id: string
  full_name: string
  email: string
  phone?: string
}

interface ClassStudent {
  id: string
  student_id: string
  enrolled_at: string
  is_active: boolean
  profiles: Student
}

interface Props {
  classData: ClassData
  classStudents: ClassStudent[]
  availableStudents: Student[]
}

export default function OgrenciYonetimiClient({
  classData,
  classStudents: initialClassStudents,
  availableStudents: initialAvailableStudents
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const currentStudentCount = initialClassStudents.length
  const isClassFull = currentStudentCount >= classData.max_students

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedStudentId) {
      setMessage({ type: 'error', text: 'Lütfen bir öğrenci seçin' })
      return
    }

    if (isClassFull) {
      setMessage({ type: 'error', text: 'Sınıf kontenjanı dolu!' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('class_students')
        .insert({
          class_id: classData.id,
          student_id: selectedStudentId,
          is_active: true
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Bu öğrenci zaten bu sınıfa ekli!')
        }
        throw error
      }

      setMessage({ type: 'success', text: 'Öğrenci başarıyla eklendi!' })
      setSelectedStudentId('')
      
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

  async function handleRemoveStudent(classStudentId: string, studentName: string) {
    if (!confirm(`${studentName} öğrencisini sınıftan çıkarmak istediğinizden emin misiniz?`)) {
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // is_active'i false yap (soft delete)
      const { error } = await supabase
        .from('class_students')
        .update({ is_active: false })
        .eq('id', classStudentId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Öğrenci sınıftan çıkarıldı' })
      
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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
        <h1 className="text-3xl font-bold text-gray-900">
          👥 {classData.name} - Öğrenci Yönetimi
        </h1>
        <p className="mt-2 text-gray-600">
          Sınıfa öğrenci ekleyin veya çıkarın
        </p>
      </div>

      {/* Mesaj */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf - Öğrenci Ekle */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ➕ Öğrenci Ekle
            </h2>

            {/* Kontenjan Bilgisi */}
            <div className={`mb-4 p-4 rounded-lg ${isClassFull ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Kontenjan:</span>
                <span className={`text-2xl font-bold ${isClassFull ? 'text-red-600' : 'text-blue-600'}`}>
                  {currentStudentCount}/{classData.max_students}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${isClassFull ? 'bg-red-600' : 'bg-blue-600'}`}
                  style={{ width: `${(currentStudentCount / classData.max_students) * 100}%` }}
                ></div>
              </div>
              {isClassFull && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Sınıf kontenjanı dolu!
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öğrenci Seç
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading || isClassFull || initialAvailableStudents.length === 0}
                  required
                >
                  <option value="">Öğrenci seçin...</option>
                  {initialAvailableStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </option>
                  ))}
                </select>
                {initialAvailableStudents.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Eklenebilecek öğrenci kalmadı
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isClassFull || initialAvailableStudents.length === 0 || !selectedStudentId}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Ekleniyor...' : '+ Öğrenciyi Ekle'}
              </button>
            </form>
          </div>
        </div>

        {/* Sağ Taraf - Öğrenci Listesi */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Sınıftaki Öğrenciler ({currentStudentCount})
            </h2>

            {initialClassStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Henüz öğrenci eklenmemiş
                </h3>
                <p className="text-gray-600">
                  Sol taraftaki formu kullanarak öğrenci ekleyin
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {initialClassStudents.map((cs) => (
                  <div
                    key={cs.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {cs.profiles.full_name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>📧 {cs.profiles.email}</span>
                        {cs.profiles.phone && (
                          <span>📱 {cs.profiles.phone}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Kayıt: {formatDate(cs.enrolled_at)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveStudent(cs.id, cs.profiles.full_name)}
                      disabled={loading}
                      className="ml-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      🗑️ Çıkar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}