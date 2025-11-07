'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Teacher {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  bio: string | null
  experience_years: number | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  subjects: Subject[]
}

interface Subject {
  id: string
  name: string
  icon: string | null
}

export default function OgretmenlerClient({ teachers }: { teachers: Teacher[] }) {
  const [teacherList, setTeacherList] = useState(teachers)
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchSubject, setSearchSubject] = useState('')
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)

  const [editFormData, setEditFormData] = useState({
    bio: '',
    experience_years: 0
  })

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadAllSubjects()
  }, [])

  async function loadAllSubjects() {
    const { data } = await supabase
      .from('subjects')
      .select('id, name, icon')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (data) {
      setAllSubjects(data)
    }
  }

  async function refreshTeachers() {
    // Sayfa yenileme fonksiyonu - basitleştirilmiş
    window.location.reload()
  }

  async function toggleActive(teacherId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: !currentStatus })
        .eq('id', teacherId)

      if (error) throw error

      setTeacherList(prev =>
        prev.map(teacher =>
          teacher.id === teacherId ? { ...teacher, is_active: !currentStatus } : teacher
        )
      )

      setMessage({ 
        type: 'success', 
        text: `Öğretmen ${!currentStatus ? 'aktifleştirildi' : 'pasifleştirildi'}!` 
      })

      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Durum güncellenirken hata oluştu' 
      })
    }
  }

  function openEditModal(teacher: Teacher) {
    setEditingTeacher(teacher)
    setEditFormData({
      bio: teacher.bio || '',
      experience_years: teacher.experience_years || 0
    })

    // Atanmış dersleri seç
    const assignedSubjectIds = teacher.subjects.map(s => s.id)
    setSelectedSubjects(assignedSubjectIds)
    setSearchSubject('')

    setShowEditModal(true)
    setMessage({ type: '', text: '' })
  }

  async function handleUpdateTeacher(e: React.FormEvent) {
    e.preventDefault()
    if (!editingTeacher) return

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // 1. Teacher bilgilerini güncelle
      const { error: updateError } = await supabase
        .from('teachers')
        .update({
          bio: editFormData.bio || null,
          experience_years: editFormData.experience_years || null
        })
        .eq('id', editingTeacher.id)

      if (updateError) throw updateError

      // 2. Ders atamalarını güncelle
      // Önce mevcut atamaları sil
      const { error: deleteError } = await supabase
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', editingTeacher.id)

      if (deleteError) throw deleteError

      // Yeni atamaları ekle
      if (selectedSubjects.length > 0) {
        const assignments = selectedSubjects.map(subjectId => ({
          teacher_id: editingTeacher.id,
          subject_id: subjectId
        }))

        const { error: insertError } = await supabase
          .from('teacher_subjects')
          .insert(assignments)

        if (insertError) throw insertError
      }

      setMessage({ type: 'success', text: '✓ Öğretmen başarıyla güncellendi!' })
      setShowEditModal(false)
      setEditingTeacher(null)
      setSelectedSubjects([])
      
      setTimeout(() => {
        refreshTeachers()
      }, 1000)

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Güncellenemedi' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteTeacher(teacherId: string, teacherName: string) {
    if (!confirm(`"${teacherName}" öğretmenini silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve tüm ders atamaları da silinecektir.`)) {
      return
    }

    setMessage({ type: '', text: '' })

    try {
      // Teachers tablosundan sil (CASCADE ile teacher_subjects de silinir)
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId)

      if (error) throw error

      setMessage({ type: 'success', text: '✓ Öğretmen silindi' })
      
      setTimeout(() => {
        refreshTeachers()
      }, 1000)

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Silinemedi' })
    }
  }

  function toggleSubjectSelection(subjectId: string) {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId)
      } else {
        return [...prev, subjectId]
      }
    })
  }

  function removeSubject(subjectId: string) {
    setSelectedSubjects(prev => prev.filter(id => id !== subjectId))
  }

  const filteredSubjects = allSubjects.filter(s => 
    s.name.toLowerCase().includes(searchSubject.toLowerCase()) &&
    !selectedSubjects.includes(s.id)
  )

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div>
      {/* Mesaj */}
      {message.text && (
        <div className={`mx-6 mt-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* İstatistik */}
        <div className="flex items-center gap-6 text-sm">
        <span className="text-gray-600">
            Toplam: <span className="font-semibold text-gray-900">{teacherList.length}</span>
        </span>
        <span className="text-gray-600">
            Aktif: <span className="font-semibold text-green-600">
            {teacherList.filter(t => t.is_active).length}
            </span>
        </span>
        <span className="text-gray-600">
            Pasif: <span className="font-semibold text-gray-600">
            {teacherList.filter(t => !t.is_active).length}
            </span>
        </span>
        </div>

{/* Öğretmen Tablosu */}
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Öğretmen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deneyim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atanan Dersler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
                </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {teacherList.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                        <span className="text-xl">👨‍🏫</span>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                        {teacher.full_name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                        {teacher.id.slice(0, 8)}...
                        </div>
                    </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.email}</div>
                    <div className="text-sm text-gray-500">
                    {teacher.phone || '-'}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                    {teacher.experience_years ? `${teacher.experience_years} yıl` : '-'}
                    </div>
                    {teacher.bio && (
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                        {teacher.bio}
                    </div>
                    )}
                </td>
                <td className="px-6 py-4">
                    {teacher.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {teacher.subjects.slice(0, 3).map(subject => (
                        <span
                            key={subject.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                        >
                            {subject.icon} {subject.name}
                        </span>
                        ))}
                        {teacher.subjects.length > 3 && (
                        <span className="text-xs text-gray-500">
                            +{teacher.subjects.length - 3}
                        </span>
                        )}
                    </div>
                    ) : (
                    <span className="text-sm text-gray-400">Ders atanmamış</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <button
                    onClick={() => toggleActive(teacher.id, teacher.is_active)}
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        teacher.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-colors cursor-pointer`}
                    >
                    {teacher.is_active ? '✓ Aktif' : '✕ Pasif'}
                    </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(teacher.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                    onClick={() => openEditModal(teacher)}
                    className="text-blue-600 hover:text-blue-900 font-medium mr-4"
                    >
                    Düzenle
                    </button>
                    <button
                    onClick={() => handleDeleteTeacher(teacher.id, teacher.full_name)}
                    className="text-red-600 hover:text-red-900 font-medium"
                    >
                    Sil
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>

        {teacherList.length === 0 && (
            <div className="text-center py-12">
            <span className="text-4xl">👨‍🏫</span>
            <p className="mt-2 text-gray-500">Henüz öğretmen yok</p>
            <p className="text-sm text-gray-400 mt-1">
                Kullanıcı Yönetimi'nden bir kullanıcının rolünü "teacher" yaparak öğretmen ekleyebilirsiniz.
            </p>
            </div>
        )}
        </div>

      {/* Öğretmen Düzenleme Modal */}
      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Öğretmen Düzenle</h2>
                <p className="text-sm text-gray-500 mt-1">{editingTeacher.full_name}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTeacher(null)
                  setSelectedSubjects([])
                  setSearchSubject('')
                  setMessage({ type: '', text: '' })
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {message.text && message.type === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleUpdateTeacher} className="space-y-4">
              {/* Bilgi Kartı */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{editingTeacher.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Telefon:</span>
                    <p className="font-medium">{editingTeacher.phone || '-'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biyografi / Tanıtım
                </label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Öğretmen hakkında kısa bilgi..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deneyim (Yıl)
                </label>
                <input
                  type="number"
                  value={editFormData.experience_years}
                  onChange={(e) => setEditFormData({ ...editFormData, experience_years: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max="50"
                />
              </div>

              {/* Ders Atama - Searchable Multi-Select */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📚 Ders Atama
                </label>
                
                {/* Seçili Dersler */}
                {selectedSubjects.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedSubjects.map(subjectId => {
                      const subject = allSubjects.find(s => s.id === subjectId)
                      return (
                        <span
                          key={subjectId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {subject?.icon} {subject?.name}
                          <button
                            type="button"
                            onClick={() => removeSubject(subjectId)}
                            className="ml-2 text-purple-600 hover:text-purple-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchSubject}
                    onChange={(e) => {
                      setSearchSubject(e.target.value)
                      setShowSubjectDropdown(true)
                    }}
                    onFocus={() => setShowSubjectDropdown(true)}
                    placeholder="Ders ara ve ekle..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {/* Dropdown */}
                  {showSubjectDropdown && filteredSubjects.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSubjects.map((subject) => (
                        <button
                          key={subject.id}
                          type="button"
                          onClick={() => {
                            toggleSubjectSelection(subject.id)
                            setSearchSubject('')
                            setShowSubjectDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center text-sm"
                        >
                          <span className="mr-2">{subject.icon}</span>
                          <span>{subject.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {allSubjects.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Henüz aktif ders yok. Önce Ders Yönetimi'nden ders ekleyin.
                  </p>
                )}

                {selectedSubjects.length > 0 && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ {selectedSubjects.length} ders seçildi
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingTeacher(null)
                    setSelectedSubjects([])
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}