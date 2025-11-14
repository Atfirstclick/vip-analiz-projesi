import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SinifDuzenleForm from './SinifDuzenleForm'

export default async function SinifDuzenlePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()

  // Params'i await et (Next.js 15)
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">✏️ Sınıf Düzenle</h1>
        <p className="mt-2 text-gray-600">
          {classData.name} sınıfının bilgilerini düzenleyin
        </p>
      </div>

      <SinifDuzenleForm classData={classData} />
    </div>
  )
}