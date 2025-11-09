import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminTakvimClient from './AdminTakvimClient'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminOgretmenTakvimPage({ params }: PageProps) {
  const supabase = await createClient()
  const { id: teacherId } = await params

  // 1. Teacher bilgisini al
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select('id, user_id, bio, experience_years')
    .eq('id', teacherId)
    .single()

  if (teacherError || !teacher) {
    notFound()
  }

  // 2. Profile bilgisini ayrı query ile al
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', teacher.user_id)
    .single()

  const teacherName = profile?.full_name || 'Öğretmen'

  // 3. Müsaitleri al
  const { data: availabilities, error: availError } = await supabase
    .from('availabilities')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (availError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        Veriler yüklenirken hata: {availError.message}
      </div>
    )
  }

  return (
    <div>
      {/* Geri Dön Butonu */}
      <div className="mb-6">
        <Link
          href="/admin/ogretmenler"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Öğretmen Yönetimine Dön
        </Link>
      </div>

      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          📅 {teacherName} - Takvim Yönetimi
        </h1>
        <p className="mt-2 text-gray-600">
          Öğretmenin müsaitliklerini görüntüleyin ve düzenleyin
        </p>
      </div>

      <AdminTakvimClient
        teacherId={teacherId}
        teacherName={teacherName}
        initialAvailabilities={availabilities || []}
      />
    </div>
  )
}