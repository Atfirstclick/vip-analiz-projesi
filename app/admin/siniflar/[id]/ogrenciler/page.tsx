import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import OgrenciYonetimiClient from './OgrenciYonetimiClient'

export default async function SinifOgrencileriPage({ 
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
  const { data: classData, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !classData) {
    notFound()
  }

  // Sınıftaki öğrencileri çek - BASİT YÖNTEM
  const { data: classStudentsRaw } = await supabase
    .from('class_students')
    .select('id, student_id, enrolled_at, is_active')
    .eq('class_id', id)
    .eq('is_active', true)
    .order('enrolled_at', { ascending: false })

  // Her öğrenci için profil bilgisini ayrı çek
  const classStudents = await Promise.all(
    (classStudentsRaw || []).map(async (cs) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('id', cs.student_id)
        .single()

      return {
        id: cs.id,
        student_id: cs.student_id,
        enrolled_at: cs.enrolled_at,
        is_active: cs.is_active,
        profiles: profile || { id: cs.student_id, full_name: 'Bilinmeyen', email: '', phone: '' }
      }
    })
  )

  // Tüm öğrencileri çek
  const { data: allStudents } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'student')
    .order('full_name', { ascending: true })

  // Henüz bu sınıfa eklenmemiş öğrenciler
  const enrolledStudentIds = classStudents.map(cs => cs.student_id)
  const availableStudents = (allStudents || []).filter(
    s => !enrolledStudentIds.includes(s.id)
  )

  return (
    <OgrenciYonetimiClient
      classData={classData}
      classStudents={classStudents}
      availableStudents={availableStudents}
    />
  )
}