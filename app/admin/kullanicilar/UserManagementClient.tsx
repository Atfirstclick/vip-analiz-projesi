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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function updateUserRole(userId: string, newRole: string) {
    try {
      setUpdating(userId)
      setMessage({ type: '', text: '' })

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Listeyi güncelle
      setUserList(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      )

      setMessage({ 
        type: 'success', 
        text: 'Rol başarıyla güncellendi!' 
      })

      // Mesajı 3 saniye sonra temizle
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

      {/* İstatistik Özeti */}
      <div className="px-6 py-4 border-b border-gray-200">
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
    </div>
  )
}