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
    <div className="min-h-screen bg-linear-to-b from-white to-vip-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        {/* Başlık */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-vip-navy mb-4">
            Ürünlerimiz
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Size özel hazırlanmış etüt paketleri ve ders programları
          </p>
          {/* Dekoratif çizgi */}
          <div className="mt-6 w-24 h-1 bg-vip-gold mx-auto rounded-full"></div>
        </div>

        {/* Ürün Grid */}
        <ProductGrid products={products || []} />
      </div>
    </div>
  )
}