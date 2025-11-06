import { createClient } from '@/lib/supabase/server'
import DerslerClient from './DerslerClient'

export default async function DerslerPage() {
  const supabase = await createClient()
  
  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        Dersler yüklenirken hata: {error.message}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ders Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Dersleri görüntüle, ekle, düzenle ve sil
        </p>
      </div>
      <DerslerClient subjects={subjects || []} />
    </div>
  )
}