import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import YeniSinifForm from './YeniSinifForm'

export default async function YeniSinifPage() {
  const supabase = await createClient()

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">➕ Yeni Sınıf Oluştur</h1>
        <p className="mt-2 text-gray-600">
          Yeni bir sınıf oluşturun ve ayarlarını yapın
        </p>
      </div>

      <YeniSinifForm />
    </div>
  )
}