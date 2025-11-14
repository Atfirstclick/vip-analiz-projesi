import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ProgramClient from './ProgramClient'

export default async function SinifProgramPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()
  const { id } = await params

  // Auth kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  // Admin kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Sınıf bilgisini çek
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single()

  if (classError || !classData) {
    notFound()
  }

  // Sınıf programını çek
  const { data: scheduleRaw } = await supabase
    .from('class_schedule')
    .select('*')
    .eq('class_id', id)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  // Her schedule için ders ve öğretmen bilgisini çek
  const schedule = await Promise.all(
    (scheduleRaw || []).map(async (sch) => {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id, name, icon')
        .eq('id', sch.subject_id)
        .single()

      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, user_id')
        .eq('id', sch.teacher_id)
        .single()

      let teacherProfile = null
      if (teacher) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', teacher.user_id)
          .single()
        teacherProfile = profile
      }

      return {
        ...sch,
        subject: subject || { id: sch.subject_id, name: 'Bilinmeyen', icon: '📚' },
        teacher: teacherProfile || { id: '', full_name: 'Bilinmeyen' }
      }
    })
  )

  // Tüm dersleri çek (dropdown için)
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, icon')
    .order('name', { ascending: true })

  // Tüm öğretmenleri çek (dropdown için)
  const { data: teachersRaw } = await supabase
    .from('teachers')
    .select('id, user_id')

  const teachers = await Promise.all(
    (teachersRaw || []).map(async (t) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', t.user_id)
        .single()

      return {
        id: t.id,
        full_name: profile?.full_name || 'Bilinmeyen'
      }
    })
  )

  return (
    <ProgramClient
      classData={classData}
      schedule={schedule}
      subjects={subjects || []}
      teachers={teachers}
    />
  )
}