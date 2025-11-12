import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RandevularimClient from './RandevularimClient'

export default async function RandevularimPage() {
  const supabase = await createClient()

  // Auth kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  // Öğrenci kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'student') redirect('/')

  // Randevuları çek
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, appointment_date, start_time, end_time, status, notes, created_at, teacher_id, subject_id')
    .eq('student_id', user.id)
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })

  // Teacher ve subject bilgilerini ayrı çek
  const teacherIds = [...new Set(appointments?.map(a => a.teacher_id) || [])]
  const subjectIds = [...new Set(appointments?.map(a => a.subject_id) || [])]

  const { data: teachers } = await supabase
    .from('teachers')
    .select('id, user_id')
    .in('id', teacherIds)

  const userIds = teachers?.map(t => t.user_id) || []
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', subjectIds)

  // Birleştir
  const appointmentsWithRelations = appointments?.map(apt => {
    const teacher = teachers?.find(t => t.id === apt.teacher_id)
    const profile = profiles?.find(p => p.id === teacher?.user_id)
    const subject = subjects?.find(s => s.id === apt.subject_id)

    return {
      id: apt.id,
      appointment_date: apt.appointment_date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      status: apt.status,
      notes: apt.notes,
      created_at: apt.created_at,
      teacher: {
        id: teacher?.id || '',
        user_id: teacher?.user_id || '',
        profiles: {
          full_name: profile?.full_name || 'İsimsiz'
        }
      },
      subject: {
        id: subject?.id || '',
        name: subject?.name || 'Bilinmeyen Ders'
      }
    }
  }) || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📋 Randevularım</h1>
        <p className="mt-2 text-gray-600">
          Tüm randevularınızı görüntüleyin ve yönetin
        </p>
      </div>

      <RandevularimClient appointments={appointmentsWithRelations} />
    </div>
  )
}