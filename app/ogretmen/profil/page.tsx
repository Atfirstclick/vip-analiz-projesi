import { getCurrentUser, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilClient from './ProfilClient'

export default async function OgretmenProfilPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/giris')
  }

  const supabase = await createClient()

  // Öğretmen bilgilerini al
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, bio, profile_photo_url, created_at')
    .eq('user_id', user.id)
    .single()

  if (!teacher) {
    return <div>Öğretmen kaydı bulunamadı</div>
  }

  // Profil bilgilerini al
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', user.id)
    .single()

  // Verdiği dersleri al - İKİ ADIMDA
  const { data: teacherSubjects } = await supabase
    .from('teacher_subjects')
    .select('subject_id')
    .eq('teacher_id', teacher.id)

  const subjectIds = teacherSubjects?.map(ts => ts.subject_id) || []

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, icon')
    .in('id', subjectIds)

  // İstatistikleri hesapla
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacher.id)

  const { count: completedAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacher.id)
    .eq('status', 'completed')

  const { count: activeAvailabilities } = await supabase
    .from('availabilities')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacher.id)
    .eq('is_active', true)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">👤 Profil Ayarları</h1>
        <p className="mt-2 text-gray-600">
          Profil bilgilerinizi görüntüleyin ve güncelleyin
        </p>
      </div>

      <ProfilClient
        userId={user.id}
        teacherId={teacher.id}
        profile={{
          full_name: profile?.full_name || '',
          email: profile?.email || '',
          phone: profile?.phone || ''
        }}
        teacher={{
          bio: teacher.bio || '',
          profile_photo_url: teacher.profile_photo_url || null,
          created_at: teacher.created_at
        }}
        subjects={subjects || []}
        stats={{
          totalAppointments: totalAppointments || 0,
          completedAppointments: completedAppointments || 0,
          activeAvailabilities: activeAvailabilities || 0
        }}
      />
    </div>
  )
}