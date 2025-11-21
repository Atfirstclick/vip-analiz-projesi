import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WeeklyCalendar from '@/components/takvim/WeeklyCalendar'

export default async function OgretmenDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!teacher) {
    return <div>Öğretmen kaydı bulunamadı</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: availabilities } = await supabase
    .from('availabilities')
    .select('*')
    .eq('teacher_id', teacher.id)
    .eq('is_active', true)

  // Randevular
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 4, 0)
  
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  const { data: appointmentsRaw } = await supabase
    .from('appointments')
    .select('id, appointment_date, start_time, end_time, status, student_id, subject_id')
    .eq('teacher_id', teacher.id)
    .gte('appointment_date', startDateStr)
    .lte('appointment_date', endDateStr)

  const appointments = await Promise.all(
    (appointmentsRaw || []).map(async (apt) => {
      const { data: student } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', apt.student_id)
        .single()

      const { data: subject } = await supabase
        .from('subjects')
        .select('id, name, icon')
        .eq('id', apt.subject_id)
        .single()

      return {
        ...apt,
        date: apt.appointment_date,
        student: student || { id: apt.student_id, full_name: 'Bilinmeyen' },
        subject: subject || { id: apt.subject_id, name: 'Ders', icon: '📚' }
      }
    })
  )

  const { data: classScheduleRaw } = await supabase
    .from('class_schedule')
    .select('id, day_of_week, start_time, end_time, classroom, class_id, subject_id')
    .eq('teacher_id', teacher.id)

  const classSchedule = await Promise.all(
    (classScheduleRaw || []).map(async (cs) => {
      const { data: classData } = await supabase
        .from('classes')
        .select('id, name, grade')
        .eq('id', cs.class_id)
        .single()

      const { data: subject } = await supabase
        .from('subjects')
        .select('id, name, icon')
        .eq('id', cs.subject_id)
        .single()

      return {
        ...cs,
        class: classData || { id: cs.class_id, name: 'Bilinmeyen', grade: '' },
        subject: subject || { id: cs.subject_id, name: 'Ders', icon: '📚' }
      }
    })
  )

  const totalAppointments = appointments.length
  const upcomingAppointments = appointments.filter(
    a => a.status === 'scheduled' && new Date(a.date) >= now
  ).length
  const totalClasses = classSchedule.length
  const totalAvailabilities = (availabilities || []).length

  return (
    <div>
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-vip-navy mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Hoş geldiniz, <span className="font-semibold text-vip-navy">{profile?.full_name || 'Öğretmen'}</span>
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Toplam Randevu */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl"></div>
          <div className="relative bg-white bg-opacity-95 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Toplam Randevu</p>
                <p className="text-4xl font-bold text-blue-600">{totalAppointments}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📅
              </div>
            </div>
          </div>
        </div>

        {/* Yaklaşan Randevu */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-vip-gold to-yellow-500 rounded-2xl"></div>
          <div className="relative bg-white bg-opacity-95 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-vip-gold opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Yaklaşan Randevu</p>
                <p className="text-4xl font-bold text-vip-navy">{upcomingAppointments}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ⏰
              </div>
            </div>
          </div>
        </div>

        {/* Sınıf Dersi */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl"></div>
          <div className="relative bg-white bg-opacity-95 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Sınıf Dersi</p>
                <p className="text-4xl font-bold text-purple-600">{totalClasses}</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🏫
              </div>
            </div>
          </div>
        </div>

        {/* Müsaitlik */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-green-500 to-green-600 rounded-2xl"></div>
          <div className="relative bg-white bg-opacity-95 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Müsaitlik Sayısı</p>
                <p className="text-4xl font-bold text-green-600">{totalAvailabilities}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ✅
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Takvim */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border-2 border-vip-gold/20">
        <h2 className="text-2xl font-bold text-vip-navy mb-6 flex items-center gap-2">
          <span>📅</span>
          Haftalık Takvim
        </h2>
        <WeeklyCalendar
          availabilities={availabilities || []}
          appointments={appointments}
          classSchedule={classSchedule}
          readOnly={true}
        />
      </div>
    </div>
  )
}