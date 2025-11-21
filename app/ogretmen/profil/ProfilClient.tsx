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
      setMessage({ type: 'success', text: '✓ Profil bilgileri güncellendi' })
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
      setMessage({ type: 'success', text: '✓ Biyografi güncellendi' })
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

      const { error } = await supabase
        .from('teachers')
        .update({ profile_photo_url: photoUrl })
        .eq('id', teacherId)

      if (error) throw error

      setTeacher({ ...teacher, profile_photo_url: photoUrl })
      setMessage({ type: 'success', text: '✓ Profil fotoğrafı güncellendi' })
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
      setMessage({ type: 'success', text: '✓ Şifre başarıyla değiştirildi' })
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
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border-2 border-vip-gold/20">
          {/* Profil Fotoğrafı */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              {teacher.profile_photo_url ? (
                <Image
                  src={teacher.profile_photo_url}
                  alt={profile.full_name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-vip-gold/30"
                />
              ) : (
                <div className="w-30 h-30 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-vip-gold/30 bg-vip-navy">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 bg-vip-navy text-white p-2.5 rounded-full cursor-pointer hover:bg-vip-gold hover:text-vip-navy transition-all shadow-lg">
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
            
            <h2 className="text-2xl font-bold text-vip-navy mt-4">
              {profile.full_name}
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-medium">👨‍🏫 Öğretmen</p>
          </div>

          {/* İletişim Bilgileri */}
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
              <span>📧</span>
              <span className="break-all">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                <span>📱</span>
                <span>{profile.phone}</span>
              </div>
            )}
          </div>

          {/* İstatistikler */}
          <div className="border-t-2 border-vip-gold/20 pt-6">
            <h3 className="font-bold text-vip-navy mb-4 flex items-center gap-2">
              <span>📊</span>
              İstatistikler
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Toplam Randevu:</span>
                <span className="font-bold text-blue-600">{stats.totalAppointments}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-gray-700">Tamamlanan:</span>
                <span className="font-bold text-green-600">{stats.completedAppointments}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Aktif Müsaitlik:</span>
                <span className="font-bold text-purple-600">{stats.activeAvailabilities}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Üyelik Tarihi:</span>
                <span className="font-bold text-gray-900 text-xs">{formatDate(teacher.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAĞ TARAF - Detaylı Bilgiler */}
      <div className="lg:col-span-2 space-y-6">
        {/* Mesaj */}
        {message.text && (
          <div className={`p-4 rounded-xl border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-300' 
              : 'bg-red-50 text-red-800 border-red-300'
          }`}>
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        {/* Kişisel Bilgiler */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-vip-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-vip-navy flex items-center gap-2">
              <span>👤</span>
              Kişisel Bilgiler
            </h3>
            {editingSection !== 'profile' && (
              <button
                onClick={() => {
                  setProfileForm(profile)
                  setEditingSection('profile')
                }}
                className="text-vip-navy hover:text-vip-gold text-sm font-bold transition-colors"
              >
                ✏️ Düzenle
              </button>
            )}
          </div>

          {editingSection === 'profile' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none transition-all"
                  placeholder="0555 123 45 67"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="flex-1 bg-vip-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-vip-gold hover:text-vip-navy transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? 'Kaydediliyor...' : '✓ Kaydet'}
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition-all"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-semibold">Ad Soyad:</span>
                <p className="font-bold text-gray-900 mt-1">{profile.full_name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-semibold">Email:</span>
                <p className="font-bold text-gray-900 mt-1">{profile.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-semibold">Telefon:</span>
                <p className="font-bold text-gray-900 mt-1">{profile.phone || 'Belirtilmemiş'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Biyografi */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-vip-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-vip-navy flex items-center gap-2">
              <span>📝</span>
              Biyografi
            </h3>
            {editingSection !== 'bio' && (
              <button
                onClick={() => {
                  setBioForm(teacher.bio)
                  setEditingSection('bio')
                }}
                className="text-vip-navy hover:text-vip-gold text-sm font-bold transition-colors"
              >
                ✏️ Düzenle
              </button>
            )}
          </div>

          {editingSection === 'bio' ? (
            <div className="space-y-4">
              <textarea
                value={bioForm}
                onChange={(e) => setBioForm(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none transition-all"
                placeholder="Kendinizi tanıtın... Bu bilgi öğrenciler tarafından görülebilir."
              />
              <div className="flex gap-3">
                <button
                  onClick={handleBioUpdate}
                  disabled={loading}
                  className="flex-1 bg-vip-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-vip-gold hover:text-vip-navy transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? 'Kaydediliyor...' : '✓ Kaydet'}
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition-all"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap p-4 bg-gray-50 rounded-xl">
              {teacher.bio || 'Henüz biyografi eklenmemiş.'}
            </p>
          )}
        </div>

        {/* Verdiği Dersler */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-vip-gold/20">
          <h3 className="text-xl font-bold text-vip-navy mb-4 flex items-center gap-2">
            <span>📚</span>
            Verdiğiniz Dersler
          </h3>
          {subjects.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {subjects.map((subject: any) => (
                <span
                  key={subject.id}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl font-bold text-sm border-2 border-purple-300"
                >
                  {subject.icon} {subject.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">Henüz ders atanmamış.</p>
          )}
          <p className="text-sm text-gray-500 mt-4 italic">
            * Dersler yönetici tarafından atanır
          </p>
        </div>

        {/* Şifre Değiştir */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-vip-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-vip-navy flex items-center gap-2">
              <span>🔒</span>
              Şifre Değiştir
            </h3>
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
                className="text-vip-navy hover:text-vip-gold text-sm font-bold transition-colors"
              >
                ✏️ Değiştir
              </button>
            )}
          </div>

          {editingSection === 'password' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Yeni Şifre</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none transition-all"
                  placeholder="En az 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Yeni Şifre Tekrar</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-vip-gold focus:border-vip-gold outline-none transition-all"
                  placeholder="Yeni şifreyi tekrar girin"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="flex-1 bg-vip-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-vip-gold hover:text-vip-navy transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? 'Değiştiriliyor...' : '✓ Şifreyi Değiştir'}
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition-all"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
              Şifrenizi güvenli tutun ve düzenli olarak değiştirin.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}