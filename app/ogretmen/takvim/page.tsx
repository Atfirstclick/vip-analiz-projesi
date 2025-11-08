import { getCurrentUser, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TakvimClient from './TakvimClient'

export default async function TakvimPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Öğretmen ID'sini al
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!teacher) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        Öğretmen kaydı bulunamadı
      </div>
    )
  }

  // Müsaitleri çek
  const { data: availabilities, error } = await supabase
    .from('availabilities')
    .select('*')
    .eq('teacher_id', teacher.id)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        Veriler yüklenirken hata: {error.message}
      </div>
    )
  }

  return <TakvimClient teacherId={teacher.id} initialAvailabilities={availabilities || []} />
}