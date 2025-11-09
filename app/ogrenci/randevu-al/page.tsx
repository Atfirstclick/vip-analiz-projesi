import { createClient } from '@/lib/supabase/server'
import RandevuAlClient from './RandevuAlClient'

export default async function RandevuAlPage() {
  const supabase = await createClient()

  // Tüm dersleri al
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📅 Randevu Al</h1>
        <p className="mt-2 text-gray-600">
          Öğretmenlerden özel ders randevusu alın
        </p>
      </div>

      <RandevuAlClient subjects={subjects || []} />
    </div>
  )
}