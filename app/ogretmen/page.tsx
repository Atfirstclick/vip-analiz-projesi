import { getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TeacherWeekCalendar from '@/components/TeacherWeekCalendar'

export default async function OgretmenDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Kullanıcı bulunamadı</div>
  }

  const supabase = await createClient()

  // Öğretmen bilgilerini al
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, user_id')
    .eq('user_id', user.id)
    .single()

  if (!teacher) {
    return <div>Öğretmen kaydı bulunamadı</div>
  }

  // Profile bilgisi
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Müsaitleri çek
  const { data: availabilities } = await supabase
    .from('availabilities')
    .select('id, day_of_week, start_time, end_time, is_recurring, specific_date, is_active')
    .eq('teacher_id', teacher.id)
    .eq('is_active', true)

  // Randevuları çek
  const { data: rawAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      subject_id,
      student_id
    `)
    .eq('teacher_id', teacher.id)
    .in('status', ['scheduled', 'confirmed'])

  // Subject ve Student bilgilerini ayrı çek
  const subjectIds = [...new Set(rawAppointments?.map(a => a.subject_id) || [])]
  const studentIds = [...new Set(rawAppointments?.map(a => a.student_id) || [])]

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', subjectIds)

  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', studentIds)

  // Randevuları birleştir
  const appointments = rawAppointments?.map(apt => {
    const subject = subjects?.find(s => s.id === apt.subject_id)
    const student = students?.find(s => s.id === apt.student_id)

    return {
      id: apt.id,
      appointment_date: apt.appointment_date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      status: apt.status,
      subject: {
        name: subject?.name || 'Bilinmeyen Ders'
      },
      student: {
        full_name: student?.full_name || 'Bilinmeyen Öğrenci'
      }
    }
  }) || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Hoş geldiniz, <span className="font-semibold">{profile?.full_name}</span>
        </p>
      </div>

      {/* Ana Takvim */}
      <div className="mb-8">
        <TeacherWeekCalendar 
          teacherId={teacher.id}
          availabilities={availabilities || []}
          appointments={appointments}
        />
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