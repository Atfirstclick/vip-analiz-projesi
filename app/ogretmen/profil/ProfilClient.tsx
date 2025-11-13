'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { uploadProfilePhoto } from '@/lib/uploadProfilePhoto'

interface Profile {
  full_name: string
  email: string
  phone: string
}

interface Teacher {
  bio: string
  profile_photo_url: string | null
  created_at: string
}

interface Subject {
  id: string
  name: string
  icon: string
}

interface Stats {
  totalAppointments: number
  completedAppointments: number
  activeAvailabilities: number
}

interface ProfilClientProps {
  userId: string
  teacherId: string
  profile: Profile
  teacher: Teacher
  subjects: Subject[]
  stats: Stats
}

export default function ProfilClient({
  userId,
  teacherId,
  profile: initialProfile,
  teacher: initialTeacher,
  subjects,
  stats
}: ProfilClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [teacher, setTeacher] = useState(initialTeacher)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Form states
  const [profileForm, setProfileForm] = useState(initialProfile)
  const [bioForm, setBioForm] = useState(initialTeacher.bio)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleProfileUpdate() {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          email: profileForm.email,
          phone: profileForm.phone
        })
        .eq('id', userId)

      if (error) throw error

      setProfile(profileForm)
      setEditingSection(null)
      setMessage({ type: 'success', text: 'Profil bilgileri güncellendi' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleBioUpdate() {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('teachers')
        .update({ bio: bioForm })
        .eq('id', teacherId)

      if (error) throw error

      setTeacher({ ...teacher, bio: bioForm })
      setEditingSection(null)
      setMessage({ type: 'success', text: 'Biyografi güncellendi' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    setMessage({ type: '', text: '' })

    try {
      const photoUrl = await uploadProfilePhoto(file, userId)

      if (!photoUrl) throw new Error('Fotoğraf yüklenemedi')

      // Database'i güncelle
      const { error } = await supabase
        .from('teachers')
        .update({ profile_photo_url: photoUrl })
        .eq('id', teacherId)

      if (error) throw error

      setTeacher({ ...teacher, profile_photo_url: photoUrl })
      setMessage({ type: 'success', text: 'Profil fotoğrafı güncellendi' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handlePasswordChange() {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Yeni şifreler eşleşmiyor')
      }

      if (passwordForm.newPassword.length < 6) {
        throw new Error('Yeni şifre en az 6 karakter olmalı')
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setEditingSection(null)
      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* SOL TARAF - Profil Özeti */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
          {/* Profil Fotoğrafı */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              {teacher.profile_photo_url ? (
                <Image
                  src={teacher.profile_photo_url}
                  alt={profile.full_name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-100">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
                {uploadingPhoto ? '⏳' : '📷'}
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mt-4">
              {profile.full_name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">👨‍🏫 Öğretmen</p>
          </div>

          {/* İletişim Bilgileri */}
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span>📧</span>
              <span className="break-all">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <span>📱</span>
                <span>{profile.phone}</span>
              </div>
            )}
          </div>

          {/* İstatistikler */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">📊 İstatistikler</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Randevu:</span>
                <span className="font-semibold text-gray-900">{stats.totalAppointments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tamamlanan:</span>
                <span className="font-semibold text-green-600">{stats.completedAppointments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aktif Müsaitlik:</span>
                <span className="font-semibold text-blue-600">{stats.activeAvailabilities}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Üyelik Tarihi:</span>
                <span className="font-semibold text-gray-900 text-xs">{formatDate(teacher.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAĞ TARAF - Detaylı Bilgiler */}
      <div className="lg:col-span-2 space-y-6">
        {/* Mesaj */}
        {message.text && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Kişisel Bilgiler */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">👤 Kişisel Bilgiler</h3>
            {editingSection !== 'profile' && (
              <button
                onClick={() => {
                  setProfileForm(profile)
                  setEditingSection('profile')
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Düzenle
              </button>
            )}
          </div>

          {editingSection === 'profile' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0555 123 45 67"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Ad Soyad:</span>
                <p className="font-medium text-gray-900">{profile.full_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Telefon:</span>
                <p className="font-medium text-gray-900">{profile.phone || 'Belirtilmemiş'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Biyografi */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📝 Biyografi</h3>
            {editingSection !== 'bio' && (
              <button
                onClick={() => {
                  setBioForm(teacher.bio)
                  setEditingSection('bio')
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Düzenle
              </button>
            )}
          </div>

          {editingSection === 'bio' ? (
            <div className="space-y-4">
              <textarea
                value={bioForm}
                onChange={(e) => setBioForm(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kendinizi tanıtın... Bu bilgi öğrenciler tarafından görülebilir."
              />
              <div className="flex gap-3">
                <button
                  onClick={handleBioUpdate}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {teacher.bio || 'Henüz biyografi eklenmemiş.'}
            </p>
          )}
        </div>

        {/* Verdiği Dersler */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Verdiğiniz Dersler</h3>
          {subjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject: any) => (
                <span
                  key={subject.id}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium text-sm"
                >
                  {subject.icon} {subject.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Henüz ders atanmamış.</p>
          )}
          <p className="text-sm text-gray-500 mt-3">
            * Dersler yönetici tarafından atanır
          </p>
        </div>

        {/* Şifre Değiştir */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🔒 Şifre Değiştir</h3>
            {editingSection !== 'password' && (
              <button
                onClick={() => {
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  })
                  setEditingSection('password')
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Değiştir
              </button>
            )}
          </div>

          {editingSection === 'password' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="En az 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre Tekrar</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yeni şifreyi tekrar girin"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Şifrenizi güvenli tutun ve düzenli olarak değiştirin.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}