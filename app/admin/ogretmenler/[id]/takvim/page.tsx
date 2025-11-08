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
  
  // params'ı await ile aç
  const { id: teacherId } = await params

  // Öğretmen bilgilerini al
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select(`
      id,
      bio,
      experience_years,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('id', teacherId)
    .single()

  if (teacherError || !teacher) {
    notFound()
  }

  // Öğretmenin müsaitliklerini al
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

  // Type casting for nested profile
  const teacherData = teacher as any
  const teacherName = teacherData?.profiles?.full_name || 'Öğretmen'

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