import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TakvimClient from './TakvimClient'

export default async function TakvimPage() {
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

  const { data: availabilities } = await supabase
    .from('availabilities')
    .select('*')
    .eq('teacher_id', teacher.id)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  // Randevuları çek
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 4, 0)
  
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  console.log('📆 Takvim Date Range:', startDateStr, 'to', endDateStr)

  const { data: appointmentsRaw } = await supabase
    .from('appointments')
    .select('id, appointment_date, start_time, end_time, status, student_id, subject_id')  // ← appointment_date
    .eq('teacher_id', teacher.id)
    .gte('appointment_date', startDateStr)  // ← appointment_date
    .lte('appointment_date', endDateStr)    // ← appointment_date

  console.log('📅 Appointments Raw:', appointmentsRaw)

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
        date: apt.appointment_date,  // ← Takvim için 'date' olarak döndür
        student: student || { id: apt.student_id, full_name: 'Bilinmeyen' },
        subject: subject || { id: apt.subject_id, name: 'Ders', icon: '📚' }
      }
    })
  )

  // 🆕 Sınıf derslerini çek
  const { data: classScheduleRaw } = await supabase
    .from('class_schedule')
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      classroom,
      class_id,
      subject_id
    `)
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

console.log('🔍 TAKVIM PAGE - Appointments:', appointments)
  console.log('🔍 TAKVIM PAGE - Class Schedule:', classSchedule)


  return (
    <TakvimClient
      teacherId={teacher.id}
      initialAvailabilities={availabilities || []}
      appointments={appointments}
      classSchedule={classSchedule}
    />
  )
}