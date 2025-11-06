'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface User {
  id: string
  full_name: string | null
  email: string
  role: string
  phone: string | null
  created_at: string
}

const ROLES = [
  { value: 'student', label: '👨‍🎓 Öğrenci', color: 'bg-gray-100 text-gray-800' },
  { value: 'teacher', label: '👨‍🏫 Öğretmen', color: 'bg-blue-100 text-blue-800' },
  { value: 'parent', label: '👪 Veli', color: 'bg-green-100 text-green-800' },
  { value: 'admin', label: '👑 Yönetici', color: 'bg-purple-100 text-purple-800' },
]

export default function UserManagementClient({ users }: { users: User[] }) {
  const [userList, setUserList] = useState(users)
  const [updating, setUpdating] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'student'
  })
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
const [editingUser, setEditingUser] = useState<User | null>(null)
const [editFormData, setEditFormData] = useState({
  email: '',
  password: '', // Boş bırakılırsa şifre değişmez
  full_name: '',
  phone: '',
  role: 'student'
})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function refreshUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, phone, created_at')
      .order('created_at', { ascending: false })
    
    if (data) {
      setUserList(data)
    }
  }

async function handleAddUser(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setMessage({ type: '', text: '' })

  try {
    const response = await fetch('/api/admin/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (response.ok) {
      setMessage({ type: 'success', text: '✓ Kullanıcı başarıyla eklendi!' })
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'student'
      })
      setShowAddModal(false)
      await refreshUsers()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } else {
      // Hata mesajını göster ama modal'ı kapatma
      setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
      // Modal açık kalsın, loading false olsun
    }
  } catch (error) {
    setMessage({ type: 'error', text: 'Kullanıcı eklenemedi' })
  } finally {
    setLoading(false) // Her durumda loading'i kapat
  }
}

function openEditModal(user: User) {
  setEditingUser(user)
  setEditFormData({
    email: user.email || '',
    password: '', // Şifre boş
    full_name: user.full_name || '',
    phone: user.phone || '',
    role: user.role
  })
  setShowEditModal(true)
  setMessage({ type: '', text: '' })
}

async function handleUpdateUser(e: React.FormEvent) {
  e.preventDefault()
  if (!editingUser) return

  setLoading(true)
  setMessage({ type: '', text: '' })

  try {
    const response = await fetch('/api/admin/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: editingUser.id,
        ...editFormData
      })
    })

    const data = await response.json()

    if (response.ok) {
      setMessage({ type: 'success', text: '✓ Kullanıcı başarıyla güncellendi!' })
      setShowEditModal(false)
      setEditingUser(null)
      await refreshUsers()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } else {
      setMessage({ type: 'error', text: data.error || 'Güncellenemedi' })
    }
  } catch (error) {
    setMessage({ type: 'error', text: 'Kullanıcı güncellenemedi' })
  } finally {
    setLoading(false)
  }
}

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`"${userName}" kullanıcısını silmek istediğinize emin misiniz?`)) {
      return
    }

    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`/api/admin/users/delete?userId=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Kullanıcı silindi' })
        await refreshUsers()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Silinemedi' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Kullanıcı silinemedi' })
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    try {
      setUpdating(userId)
      setMessage({ type: '', text: '' })

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUserList(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      )

      setMessage({ 
        type: 'success', 
        text: 'Rol başarıyla güncellendi!' 
      })

      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Rol güncellenirken hata oluştu' 
      })
    } finally {
      setUpdating(null)
    }
  }

  function getRoleInfo(role: string) {
    return ROLES.find(r => r.value === role) || ROLES[0]
  }

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

      {/* İstatistik Özeti + Yeni Kullanıcı Butonu */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-600">
            Toplam: <span className="font-semibold text-gray-900">{userList.length}</span>
          </span>
          {ROLES.map(role => {
            const count = userList.filter(u => u.role === role.value).length
            return (
              <span key={role.value} className="text-gray-600">
                {role.label}: <span className="font-semibold text-gray-900">{count}</span>
              </span>
            )
          })}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          + Yeni Kullanıcı
        </button>
      </div>

      {/* Kullanıcı Tablosu */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-posta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kayıt Tarihi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı Rolü
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userList.map(user => {
              const roleInfo = getRoleInfo(user.role)
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name || 'İsimsiz Kullanıcı'}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {user.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.phone || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      disabled={updating === user.id}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {ROLES.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {updating === user.id && (
                      <div className="text-xs text-gray-500 mt-1">
                        Güncelleniyor...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-blue-600 hover:text-blue-900 font-medium mr-4"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.full_name || 'Bu kullanıcı')}
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

        {userList.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">👥</span>
            <p className="mt-2 text-gray-500">Henüz kullanıcı yok</p>
          </div>
        )}
      </div>

      {/* Yeni Kullanıcı Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Yeni Kullanıcı Ekle</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setMessage({ type: '', text: '' }) // Mesajı temizle
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal İçi Hata Mesajı */}
            {message.text && message.type === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Şifre Uyarısı */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Önemli:</strong> Kullanıcı şifresini not edin! Şifre bir daha görüntülenemez.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="En az 6 karakter"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
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


{/* Kullanıcı Düzenleme Modal */}
{showEditModal && editingUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Düzenle</h2>
        <button
          onClick={() => {
            setShowEditModal(false)
            setEditingUser(null)
            setMessage({ type: '', text: '' })
          }}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      {/* Modal İçi Hata Mesajı */}
      {message.text && message.type === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleUpdateUser} className="space-y-4">
        {/* Kullanıcı ID Göster */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Kullanıcı ID</p>
          <p className="text-sm font-mono text-gray-700">{editingUser.id.slice(0, 16)}...</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={editFormData.email}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ornek@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Yeni Şifre <span className="text-gray-400 font-normal">(opsiyonel)</span>
          </label>
          <input
            type="password"
            value={editFormData.password}
            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Boş bırakılırsa değişmez"
            minLength={6}
          />
          <p className="mt-1 text-xs text-gray-500">
            Şifre değiştirmek istemiyorsanız boş bırakın
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad Soyad *
          </label>
          <input
            type="text"
            value={editFormData.full_name}
            onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ahmet Yılmaz"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <input
            type="tel"
            value={editFormData.phone}
            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="05XX XXX XX XX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol *
          </label>
          <select
            value={editFormData.role}
            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowEditModal(false)
              setEditingUser(null)
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