import { createClient } from '@/lib/supabase/server'
import OgretmenlerClient from './OgretmenlerClient'

export default async function OgretmenlerPage() {
  const supabase = await createClient()
  
  // Teachers tablosundan öğretmenleri al (profiles ile JOIN)
  const { data: teachersData, error: teachersError } = await supabase
    .from('teachers')
    .select('id, user_id, bio, experience_years, is_active, is_verified, created_at')
    .order('created_at', { ascending: false })

  if (teachersError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        Öğretmenler yüklenirken hata: {teachersError.message}
      </div>
    )
  }

  // Her öğretmen için profile bilgisini al
  const teachersWithProfiles = await Promise.all(
    (teachersData || []).map(async (teacher) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', teacher.user_id)
        .single()

      return {
        ...teacher,
        full_name: profile?.full_name || 'İsimsiz',
        email: profile?.email || '',
        phone: profile?.phone || null
      }
    })
  )

  // Her öğretmenin atanmış derslerini al
  const { data: teacherSubjectsData } = await supabase
    .from('teacher_subjects')
    .select(`
      teacher_id,
      subjects:subject_id (
        id,
        name,
        icon
      )
    `)

  // Dersleri öğretmenlere göre grupla
  const subjectsByTeacher: Record<string, any[]> = {}
  teacherSubjectsData?.forEach((ts: any) => {
    if (!subjectsByTeacher[ts.teacher_id]) {
      subjectsByTeacher[ts.teacher_id] = []
    }
    if (ts.subjects) {
      subjectsByTeacher[ts.teacher_id].push(ts.subjects)
    }
  })

  // Her öğretmene derslerini ekle
  const teachers = teachersWithProfiles.map(teacher => ({
    ...teacher,
    subjects: subjectsByTeacher[teacher.id] || []
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Öğretmen Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Öğretmenleri görüntüle, onayla ve ders atamalarını yönet
        </p>
      </div>
      <OgretmenlerClient teachers={teachers} />
    </div>
  )
}