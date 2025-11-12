import { getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Type tanımlamaları
interface Profile {
  full_name: string
  email: string
  phone: string | null
}

interface Teacher {
  id: string
  bio: string | null
  experience_years: number | null
  created_at: string
  profiles: Profile
}

export default async function OgretmenDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Kullanıcı bulunamadı</div>
  }

  const supabase = await createClient()

  // Öğretmen bilgilerini al
  const { data: teacher } = await supabase
    .from('teachers')
    .select(`
      id,
      bio,
      experience_years,
      created_at,
      profiles:user_id (
        full_name,
        email,
        phone
      )
    `)
    .eq('user_id', user.id)
    .single()

  // Type casting
  const teacherData = teacher as unknown as Teacher

  // Atanan dersler
  const { data: teacherSubjects } = await supabase
    .from('teacher_subjects')
    .select('subject_id')
    .eq('teacher_id', teacher?.id)

  const subjectCount = teacherSubjects?.length || 0

  // Müsaitlik sayısı
  const { count: availabilityCount } = await supabase
    .from('availabilities')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacher?.id)
    .eq('is_active', true)

  // Yaklaşan randevular
  const today = new Date().toISOString().split('T')[0]
  
  const { count: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacher?.id || '')
    .gte('appointment_date', today)
    .eq('status', 'scheduled')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Hoş geldiniz, <span className="font-semibold">{teacherData?.profiles?.full_name}</span>
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-4xl">📚</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Verdiğiniz Dersler
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {subjectCount}
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
                <span className="text-4xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Müsait Zaman Dilimleri
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {availabilityCount || 0}
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
                <span className="text-4xl">⏱️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Deneyim
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {teacher?.experience_years || 0} yıl
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
            href="/ogretmen/takvim"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📅 Takvim Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              Uygun zamanlarınızı belirleyin ve düzenleyin
            </p>
          </Link>

          <Link
            href="/ogretmen/profil"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              👤 Profil Ayarları
            </h3>
            <p className="text-sm text-gray-600">
              Biyografinizi ve deneyim bilgilerinizi güncelleyin
            </p>
          </Link>

          <Link
            href="/ogretmen/randevularim"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📋 Randevularım
            </h3>
            <p className="text-sm text-gray-600">
              Öğrencilerinizle olan randevularınızı görüntüleyin
            </p>
          </Link>

        </div>
      </div>
    </div>
  )
}