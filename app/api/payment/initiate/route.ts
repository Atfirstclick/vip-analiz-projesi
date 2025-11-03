import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/server'
import { generatePayTRToken } from '@/lib/paytr'

// Cache'i devre dışı bırak
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_variants (
          id,
          name,
          price,
          products (
            name,
            category
          )
        )
      `)
      .eq('cart_id', cart.id)

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const totalAmount = cartItems.reduce(
      (sum: number, item: any) => sum + (item.product_variants.price * item.quantity),
      0
    )

    // Sipariş numarası oluştur - Timestamp bazlı (BENZERSIZ)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.getTime().toString().slice(-6)
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    const orderNumber = `VIP-${dateStr}-${timeStr}${randomStr}`
    
    console.log('Generated unique order number:', orderNumber)

    const basketItems = cartItems.map((item: any) => ({
      name: `${item.product_variants.products.name} - ${item.product_variants.name}`,
      price: item.product_variants.price,
      quantity: item.quantity
    }))

    const paymentData = {
      orderId: orderNumber,
      amount: totalAmount,
      userEmail: profile.email || user.email || '',
      userName: profile.full_name || 'Kullanıcı',
      userPhone: profile.phone || '5555555555',
      userAddress: 'Türkiye',
      basketItems
    }

    const token = generatePayTRToken(paymentData)

    return NextResponse.json({
      success: true,
      token,
      orderNumber,
      amount: totalAmount
    })

  } catch (error: any) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Payment initiation failed', details: error.message },
      { status: 500 }
    )
  }
}