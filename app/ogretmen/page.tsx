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

  // 🔧 RANDEVULAR - DÜZELTİLDİ
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 4, 0)
  
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  console.log('📆 Dashboard Date Range:', startDateStr, 'to', endDateStr)

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
        date: apt.appointment_date,  // ← 'date' olarak map et
        student: student || { id: apt.student_id, full_name: 'Bilinmeyen' },
        subject: subject || { id: apt.subject_id, name: 'Ders', icon: '📚' }
      }
    })
  )
  console.log('📅 Dashboard Appointments Processed:', appointments)

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Hoş geldiniz, {profile?.full_name || 'Öğretmen'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Randevu</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Yaklaşan Randevu</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{upcomingAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">⏰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sınıf Dersi</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{totalClasses}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">🏫</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Müsaitlik Sayısı</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{totalAvailabilities}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">✅</div>
          </div>
        </div>
      </div>

      <WeeklyCalendar
        availabilities={availabilities || []}
        appointments={appointments}
        classSchedule={classSchedule}
        readOnly={true}
      />
    </div>
  )
}