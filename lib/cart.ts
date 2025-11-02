import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getOrCreateCart(userId: string) {
  // Mevcut sepeti kontrol et
  const { data: existingCart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existingCart) {
    return existingCart.id
  }

  // Yoksa yeni sepet oluştur
  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single()

  if (error) throw error
  return newCart.id
}

export async function addToCart(userId: string, variantId: string, quantity: number = 1) {
  try {
    const cartId = await getOrCreateCart(userId)

    // Ürün sepette var mı kontrol et
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_variant_id', variantId)
      .single()

    if (existingItem) {
      // Varsa miktarı artır
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)

      if (error) throw error
    } else {
      // Yoksa yeni ekle
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_variant_id: variantId,
          quantity
        })

      if (error) throw error
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCartItems(userId: string) {
  try {
    const cartId = await getOrCreateCart(userId)

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_variant_id,
        product_variants (
          id,
          name,
          grade,
          subject,
          price,
          duration_minutes,
          session_count,
          product_id,
          products (
            id,
            name,
            category,
            image_url
          )
        )
      `)
      .eq('cart_id', cartId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching cart:', error)
    return []
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(itemId)
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)

  if (error) throw error
  return { success: true }
}

export async function removeFromCart(itemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
  return { success: true }
}

export async function getCartCount(userId: string) {
  try {
    const cartId = await getOrCreateCart(userId)

    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('cart_id', cartId)

    return count || 0
  } catch (error) {
    return 0
  }
}