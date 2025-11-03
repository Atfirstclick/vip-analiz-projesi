import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPayTRCallback } from '@/lib/paytr'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      merchant_oid,
      status,
      payment_type,
      total_amount,
      hash,
      failed_reason_msg
    } = body

    console.log('Payment callback received:', { merchant_oid, status })

    const isValid = verifyPayTRCallback(hash, merchant_oid, status, total_amount)
    
    if (!isValid) {
      console.error('Invalid hash')
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: allCarts, error: cartsError } = await supabase
      .from('carts')
      .select('id, user_id')
      .limit(100)

    console.log('All carts:', allCarts?.length)

    if (cartsError || !allCarts || allCarts.length === 0) {
      console.error('No carts found:', cartsError)
      return NextResponse.json({ error: 'No carts found' }, { status: 404 })
    }

    let cartId = null
    let userId = null

    for (const cart of allCarts) {
      const { data: items, count } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('cart_id', cart.id)

      if (count && count > 0) {
        cartId = cart.id
        userId = cart.user_id
        console.log('Found cart with items:', cartId)
        break
      }
    }

    if (!cartId || !userId) {
      console.error('No cart with items found')
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const { data: cartItems, error: itemsError } = await supabase
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
            category
          )
        )
      `)
      .eq('cart_id', cartId)

    console.log('Cart items found:', cartItems?.length)

    if (itemsError || !cartItems || cartItems.length === 0) {
      console.error('Error fetching cart items:', itemsError)
      return NextResponse.json({ error: 'Cart items not found' }, { status: 400 })
    }

    const totalPrice = cartItems.reduce(
      (sum: number, item: any) => sum + (item.product_variants.price * item.quantity),
      0
    )

    console.log('Total price:', totalPrice)

    if (status === 'success') {
      // Sipariş oluştur - STATUS: 'paid' kullan
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: merchant_oid,
          total_amount: totalPrice,
          status: 'paid',  // ← BURADA 'paid' olmalı
          payment_method: payment_type || 'credit_card'
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order creation error:', orderError)
        return NextResponse.json({ error: 'Order creation failed', details: orderError.message }, { status: 500 })
      }

console.log('Order created:', order.id)

const orderItems = cartItems.map((item: any) => ({
  order_id: order.id,
  product_variant_id: item.product_variants.id,
  quantity: item.quantity,
  unit_price: item.product_variants.price,
  product_name: item.product_variants.products.name,
  variant_name: item.product_variants.name,
  category: item.product_variants.products.category,
  grade: item.product_variants.grade,
  subject: item.product_variants.subject,
  subtotal: item.product_variants.price * item.quantity
}))

const { error: itemsInsertError } = await supabase
  .from('order_items')
  .insert(orderItems)

      if (itemsInsertError) {
        console.error('Order items creation error:', itemsInsertError)
        return NextResponse.json({ error: 'Order items creation failed', details: itemsInsertError.message }, { status: 500 })
      }

      console.log('Order items created:', orderItems.length)
// Email gönder
        try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', userId)
            .single()

        if (profile?.email) {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/order-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerEmail: profile.email,
                customerName: profile.full_name || 'Değerli Öğrencimiz',
                orderNumber: merchant_oid,
                orderDate: new Date().toISOString(),
                items: cartItems.map((item: any) => ({
                productName: item.product_variants.products.name,
                variantName: item.product_variants.name,
                quantity: item.quantity,
                price: item.product_variants.price
                })),
                totalAmount: totalPrice
            })
            })
            console.log('Order confirmation email sent')
        }
        } catch (emailError) {
        console.error('Email sending failed:', emailError)
// Email hatası siparişi etkilemesin
        }

// Sepeti temizle
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)

      if (deleteError) {
        console.error('Cart clear error:', deleteError)
      }

      console.log('Cart cleared successfully')

      return NextResponse.json({ 
        success: true, 
        orderNumber: merchant_oid,
        orderId: order.id 
      })

    } else {
      // Başarısız ödeme
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: merchant_oid,
          total_amount: totalPrice,
          status: 'failed',  // ← BURADA 'failed' olmalı
          payment_method: payment_type || 'credit_card'
        })
        .select()
        .single()

      if (orderError) {
        console.error('Failed order creation error:', orderError)
      }

      return NextResponse.json({ 
        success: false, 
        orderNumber: merchant_oid,
        reason: failed_reason_msg 
      })
    }

  } catch (error: any) {
    console.error('Payment callback error:', error)
    return NextResponse.json(
      { error: 'Callback processing failed', details: error.message },
      { status: 500 }
    )
  }
}