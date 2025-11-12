import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RandevularimClient from './RandevularimClient'

export default async function OgretmenRandevularimPage() {
  const supabase = await createClient()

  // Auth kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  // Öğretmen kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') redirect('/')

  // Öğretmen ID'sini bul
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!teacher) redirect('/')

  // Randevuları çek
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, appointment_date, start_time, end_time, status, notes, created_at, student_id, subject_id')
    .eq('teacher_id', teacher.id)
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })

  // Student ve subject bilgilerini ayrı çek
  const studentIds = [...new Set(appointments?.map(a => a.student_id) || [])]
  const subjectIds = [...new Set(appointments?.map(a => a.subject_id) || [])]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', studentIds)

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', subjectIds)

  // Birleştir
  const appointmentsWithRelations = appointments?.map(apt => {
    const student = profiles?.find(p => p.id === apt.student_id)
    const subject = subjects?.find(s => s.id === apt.subject_id)

    return {
      id: apt.id,
      appointment_date: apt.appointment_date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      status: apt.status,
      notes: apt.notes,
      created_at: apt.created_at,
      student: {
        id: student?.id || '',
        full_name: student?.full_name || 'İsimsiz',
        email: student?.email || ''
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
          Öğrencilerinizle olan randevularınızı görüntüleyin ve yönetin
        </p>
      </div>

      <RandevularimClient appointments={appointmentsWithRelations} teacherId={teacher.id} />
    </div>
  )
}