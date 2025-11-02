import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CartPage from './CartPage'

export default async function SepetPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Sepet ID'sini al
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) {
    return <CartPage cartItems={[]} />
  }

  // Sepet ürünlerini çek
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_variants (
        id,
        name,
        grade,
        subject,
        price,
        duration_minutes,
        session_count,
        products (
          id,
          name,
          category,
          image_url
        )
      )
    `)
    .eq('cart_id', cart.id)

  // Tip dönüşümü yap
  const formattedItems = (cartItems || []).map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    product_variants: {
      id: item.product_variants.id,
      name: item.product_variants.name,
      grade: item.product_variants.grade,
      subject: item.product_variants.subject,
      price: item.product_variants.price,
      duration_minutes: item.product_variants.duration_minutes,
      session_count: item.product_variants.session_count,
      products: item.product_variants.products
    }
  }))

  return <CartPage cartItems={formattedItems} />
}