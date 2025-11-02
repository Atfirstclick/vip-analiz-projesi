import { createClient } from '@/lib/supabase/server'
import ProductManagement from './ProductManagement'

export default async function UrunlerPage() {
  const supabase = await createClient()

  // Tüm ürünleri ve varyantlarını çek
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        Ürünler yüklenirken hata: {error.message}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Etüt paketleri, deneme sınavları ve ders paketlerini yönetin
        </p>
      </div>

      <ProductManagement initialProducts={products || []} />
    </div>
  )
}