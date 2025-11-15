import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetail from './ProductDetail'

export default async function UrunDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (
        id,
        name,
        grade,
        subject,
        price,
        duration_minutes,
        session_count,
        stock_quantity,
        is_active
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    notFound()
  }

  const activeVariants = product.product_variants?.filter((v: any) => v.is_active) || []

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-vip-gold/10">
      <ProductDetail product={{ ...product, product_variants: activeVariants }} />
    </div>
  )
}