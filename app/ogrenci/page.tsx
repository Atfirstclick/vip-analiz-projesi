import { getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OgrenciDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Kullanıcı bulunamadı</div>
  }

  const supabase = await createClient()

  // Profile bilgisi
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Randevu sayıları
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)

  const { count: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .gte('appointment_date', new Date().toISOString().split('T')[0])
    .in('status', ['scheduled', 'confirmed'])

  const { count: completedAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('status', 'completed')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Hoş geldiniz, <span className="font-semibold">{profile?.full_name}</span>
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-4xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Toplam Randevu
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalAppointments || 0}
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
                <span className="text-4xl">⏰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Yaklaşan Randevular
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {upcomingAppointments || 0}
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
                <span className="text-4xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tamamlanan
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {completedAppointments || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          
          <Link
            href="/ogrenci/randevu-al"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📅 Randevu Al
            </h3>
            <p className="text-sm text-gray-600">
              Öğretmenlerden yeni randevu alın
            </p>
          </Link>

          <Link
            href="/ogrenci/randevularim"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📋 Randevularım
            </h3>
            <p className="text-sm text-gray-600">
              Randevularınızı görüntüleyin ve yönetin
            </p>
          </Link>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-l-4 border-gray-300 opacity-60 cursor-not-allowed">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📚 Derslerim
            </h3>
            <p className="text-sm text-gray-600">
              Yakında... (FAZ 3.4 - Sınıf Sistemi)
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}