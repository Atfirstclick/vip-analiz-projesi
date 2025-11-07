// app/admin/page.tsx

import { getUserProfile, getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Kullanıcı bulunamadı</div>
  }

  const profile = await getUserProfile(user.id)
  const supabase = await createClient()

  // Kullanıcı istatistikleri
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  const { count: totalTeachers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'teacher')

  const { count: totalAdmins } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  // Ders istatistikleri
  const { count: totalSubjects } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })

  const { count: activeSubjects } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Hoş geldiniz, <span className="font-semibold">{profile?.full_name}</span>
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-4xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Toplam Kullanıcı
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalUsers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-4xl">👨‍🎓</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Öğrenciler
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalStudents || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-4xl">👨‍🏫</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Öğretmenler
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalTeachers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-4xl">👑</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Yöneticiler
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalAdmins || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-4xl">📚</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Dersler
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {activeSubjects || 0}
                    <span className="text-sm text-gray-500">/{totalSubjects || 0}</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Kullanıcı Yönetimi */}
          <Link
            href="/admin/kullanicilar"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              👥 Kullanıcı Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Kullanıcıları görüntüle, ekle, sil ve rollerini yönet
            </p>
          </Link>

          {/* Ürün Yönetimi */}
          <Link
            href="/admin/urunler"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-orange-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📦 Ürün Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Ürünleri ve varyantlarını yönet
            </p>
          </Link>

          {/* Ders Yönetimi - YENİ */}
          <Link
            href="/admin/dersler"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📚 Ders Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Dersleri görüntüle, ekle, düzenle ve öğretmen ata
            </p>
          </Link>

          {/* Öğretmen Yönetimi - YENİ */}
          <Link
            href="/admin/ogretmenler"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              👨‍🏫 Öğretmen Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Öğretmenleri yönet, onayla ve ders atamalarını düzenle
            </p>
          </Link>

          {/* Randevu Yönetimi - Pasif (İleride) */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-l-4 border-gray-300 opacity-60 cursor-not-allowed">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📅 Randevu Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Yakında... (FAZ 3.2-3.3)
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}