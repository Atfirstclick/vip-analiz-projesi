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
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-vip-navy mb-2 flex items-center gap-3">
          <span>📅</span>
          Randevu Al
        </h1>
        <p className="text-lg text-gray-600">
          Öğretmenlerden özel ders randevusu alın ve ders programınızı oluşturun
        </p>
      </div>

      <RandevuAlClient subjects={subjects || []} />
    </div>
  )
}