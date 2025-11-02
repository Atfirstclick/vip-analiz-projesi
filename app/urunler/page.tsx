import { createClient } from '@/lib/supabase/server'
import ProductGrid from './ProductGrid'

export default async function UrunlerPage() {
  const supabase = await createClient()

  // Aktif ürünleri ve varyantlarını çek
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_variants!inner (*)
    `)
    .eq('is_active', true)
    .eq('product_variants.is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ürünlerimiz</h1>
          <p className="text-gray-600">
            Size özel hazırlanmış etüt paketleri ve ders programları
          </p>
        </div>

        {/* Ürün Grid */}
        <ProductGrid products={products || []} />
      </div>
    </div>
  )
}