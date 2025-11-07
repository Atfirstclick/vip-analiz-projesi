'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Subject {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface Teacher {
  id: string
  user_id: string
  full_name: string
  is_verified: boolean
}

interface TeacherSubject {
  teacher_id: string
  teacher_name: string
}

export default function DerslerClient({ subjects }: { subjects: Subject[] }) {
  const [subjectList, setSubjectList] = useState(subjects)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<Record<string, TeacherSubject[]>>({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTeacher, setSearchTeacher] = useState('')
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    is_active: true,
    display_order: 0
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    icon: '',
    is_active: true,
    display_order: 0
  })

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadTeachers()
    loadTeacherSubjects()
  }, [])

  async function loadTeachers() {
    console.log('🔍 loadTeachers çalışıyor...')
    
    const { data: teachersData, error: teachersError } = await supabase
      .from('teachers')
      .select('id, user_id, is_verified, is_active')
      .eq('is_active', true)
      .eq('is_verified', true)

    console.log('📊 Teachers data:', teachersData)

    if (teachersData && teachersData.length > 0) {
      const userIds = teachersData.map(t => t.user_id)
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      if (profilesData) {
        const formattedTeachers = teachersData.map((teacher) => {
          const profile = profilesData.find(p => p.id === teacher.user_id)
          return {
            id: teacher.id,
            user_id: teacher.user_id,
            full_name: profile?.full_name || 'İsimsiz',
            is_verified: teacher.is_verified
          }
        })
        
        console.log('✅ Formatted teachers:', formattedTeachers)
        setTeachers(formattedTeachers)
      }
    }
  }

  async function loadTeacherSubjects() {
    console.log('🔍 loadTeacherSubjects çalışıyor...')
    
    const { data: tsData, error } = await supabase
      .from('teacher_subjects')
      .select('teacher_id, subject_id')

    console.log('📚 Teacher-Subject data:', tsData)
    console.log('❌ Teacher-Subject error:', error)

    if (tsData && tsData.length > 0) {
      // Tüm teacher_id'leri topla
      const teacherIds = [...new Set(tsData.map(ts => ts.teacher_id))]
      
      // Teachers ve profiles'ı al
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('id, user_id')
        .in('id', teacherIds)

      if (teachersData) {
        const userIds = teachersData.map(t => t.user_id)
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds)

        // Subject'lere göre grupla
        const grouped: Record<string, TeacherSubject[]> = {}
        
        tsData.forEach((ts) => {
          const teacher = teachersData.find(t => t.id === ts.teacher_id)
          const profile = profilesData?.find(p => p.id === teacher?.user_id)
          
          if (!grouped[ts.subject_id]) {
            grouped[ts.subject_id] = []
          }
          
          grouped[ts.subject_id].push({
            teacher_id: ts.teacher_id,
            teacher_name: profile?.full_name || 'İsimsiz'
          })
        })
        
        console.log('✅ Grouped teacher subjects:', grouped)
        setTeacherSubjects(grouped)
      }
    }
  }

  async function refreshSubjects() {
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (data) {
      setSubjectList(data)
    }
    await loadTeacherSubjects()
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const slug = generateSlug(formData.name)

    try {
      const response = await fetch('/api/admin/subjects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Ders başarıyla eklendi!' })
        setFormData({
          name: '',
          description: '',
          icon: '',
          is_active: true,
          display_order: 0
        })
        setShowAddModal(false)
        await refreshSubjects()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ders eklenemedi' })
    } finally {
      setLoading(false)
    }
  }

  function openEditModal(subject: Subject) {
    setEditingSubject(subject)
    setEditFormData({
      name: subject.name,
      description: subject.description || '',
      icon: subject.icon || '',
      is_active: subject.is_active,
      display_order: subject.display_order
    })

    const assignedTeachers = teacherSubjects[subject.id]?.map(ts => ts.teacher_id) || []
    setSelectedTeachers(assignedTeachers)
    setSearchTeacher('')

    setShowEditModal(true)
    setMessage({ type: '', text: '' })
  }

  async function handleUpdateSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!editingSubject) return

    setLoading(true)
    setMessage({ type: '', text: '' })

    const slug = generateSlug(editFormData.name)

    try {
      const response = await fetch('/api/admin/subjects/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: editingSubject.id,
          ...editFormData,
          slug,
          teacherIds: selectedTeachers
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Ders başarıyla güncellendi!' })
        setShowEditModal(false)
        setEditingSubject(null)
        setSelectedTeachers([])
        await refreshSubjects()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Güncellenemedi' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ders güncellenemedi' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteSubject(subjectId: string, subjectName: string) {
    if (!confirm(`"${subjectName}" dersini silmek istediğinize emin misiniz?`)) {
      return
    }

    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`/api/admin/subjects/delete?subjectId=${subjectId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Ders silindi' })
        await refreshSubjects()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Silinemedi' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ders silinemedi' })
    }
  }

  async function toggleActive(subjectId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('subjects')
        .update({ is_active: !currentStatus })
        .eq('id', subjectId)

      if (error) throw error

      setSubjectList(prev =>
        prev.map(subject =>
          subject.id === subjectId ? { ...subject, is_active: !currentStatus } : subject
        )
      )

      setMessage({ 
        type: 'success', 
        text: `Ders ${!currentStatus ? 'aktifleştirildi' : 'pasifleştirildi'}!` 
      })

      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Durum güncellenirken hata oluştu' 
      })
    }
  }

  function toggleTeacherSelection(teacherId: string) {
    setSelectedTeachers(prev => {
      if (prev.includes(teacherId)) {
        return prev.filter(id => id !== teacherId)
      } else {
        return [...prev, teacherId]
      }
    })
  }

  function removeTeacher(teacherId: string) {
    setSelectedTeachers(prev => prev.filter(id => id !== teacherId))
  }

  const filteredTeachers = teachers.filter(t => 
    t.full_name.toLowerCase().includes(searchTeacher.toLowerCase()) &&
    !selectedTeachers.includes(t.id)
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

      {/* İstatistik + Yeni Ders Butonu */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-600">
            Toplam: <span className="font-semibold text-gray-900">{subjectList.length}</span>
          </span>
          <span className="text-gray-600">
            Aktif: <span className="font-semibold text-green-600">
              {subjectList.filter(s => s.is_active).length}
            </span>
          </span>
          <span className="text-gray-600">
            Pasif: <span className="font-semibold text-red-600">
              {subjectList.filter(s => !s.is_active).length}
            </span>
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          + Yeni Ders
        </button>
      </div>

      {/* Ders Tablosu */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sıra
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İkon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ders Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Açıklama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atanan Öğretmenler
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oluşturulma
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjectList.map((subject) => {
              const assignedTeachers = teacherSubjects[subject.id] || []
              
              return (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-2xl">
                    {subject.icon || '📚'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subject.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {subject.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {assignedTeachers.length > 0 ? (
                      <div className="text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          👨‍🏫 {assignedTeachers.length} öğretmen
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          {assignedTeachers.slice(0, 2).map(t => t.teacher_name).join(', ')}
                          {assignedTeachers.length > 2 && ` +${assignedTeachers.length - 2}`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(subject.id, subject.is_active)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subject.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors cursor-pointer`}
                    >
                      {subject.is_active ? '✓ Aktif' : '✕ Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subject.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => openEditModal(subject)}
                      className="text-blue-600 hover:text-blue-900 font-medium mr-4"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id, subject.name)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {subjectList.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">📚</span>
            <p className="mt-2 text-gray-500">Henüz ders yok</p>
          </div>
        )}
      </div>
      {/* Yeni Ders Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Yeni Ders Ekle</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
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

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ders Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Matematik"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL otomatik oluşturulacak: {generateSlug(formData.name) || 'ders-adi'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkon (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🔢"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ders hakkında kısa açıklama"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sıra Numarası
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Aktif olarak ekle
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ders Düzenleme Modal (Searchable Multi-Select ile) */}
      {showEditModal && editingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ders Düzenle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingSubject(null)
                  setSelectedTeachers([])
                  setSearchTeacher('')
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

            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ders Adı *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL: {generateSlug(editFormData.name) || 'ders-adi'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkon (Emoji)
                </label>
                <input
                  type="text"
                  value={editFormData.icon}
                  onChange={(e) => setEditFormData({ ...editFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sıra Numarası
                </label>
                <input
                  type="number"
                  value={editFormData.display_order}
                  onChange={(e) => setEditFormData({ ...editFormData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit_is_active" className="ml-2 block text-sm text-gray-700">
                  Aktif
                </label>
              </div>

              {/* Öğretmen Atama - Searchable Multi-Select */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ✨ Öğretmen Atama
                </label>
                
                {/* Seçili Öğretmenler */}
                {selectedTeachers.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedTeachers.map(teacherId => {
                      const teacher = teachers.find(t => t.id === teacherId)
                      return (
                        <span
                          key={teacherId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          👨‍🏫 {teacher?.full_name}
                          <button
                            type="button"
                            onClick={() => removeTeacher(teacherId)}
                            className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
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
                    value={searchTeacher}
                    onChange={(e) => {
                      setSearchTeacher(e.target.value)
                      setShowTeacherDropdown(true)
                    }}
                    onFocus={() => setShowTeacherDropdown(true)}
                    placeholder="Öğretmen ara ve ekle..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {/* Dropdown */}
                  {showTeacherDropdown && filteredTeachers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredTeachers.map((teacher) => (
                        <button
                          key={teacher.id}
                          type="button"
                          onClick={() => {
                            toggleTeacherSelection(teacher.id)
                            setSearchTeacher('')
                            setShowTeacherDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center text-sm"
                        >
                          <span className="mr-2">👨‍🏫</span>
                          <span>{teacher.full_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {teachers.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Henüz onaylanmış öğretmen yok
                  </p>
                )}

                {selectedTeachers.length > 0 && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ {selectedTeachers.length} öğretmen seçildi
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSubject(null)
                    setSelectedTeachers([])
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