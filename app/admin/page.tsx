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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Hoş geldiniz, <span className="font-semibold">{profile?.full_name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/kullanicilar"
            className="relative block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              👥 Kullanıcı Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Kullanıcıları görüntüle ve rollerini yönet
            </p>
          </Link>

          <div className="relative block p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm opacity-60">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📦 Ürün Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Yakında... (FAZ 2)
            </p>
          </div>

          <div className="relative block p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm opacity-60">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📅 Randevu Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Yakında... (FAZ 3)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}