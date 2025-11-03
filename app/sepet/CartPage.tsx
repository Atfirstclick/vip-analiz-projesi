'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateCartItemQuantity, removeFromCart } from '@/lib/cart'

interface CartItem {
  id: string
  quantity: number
  product_variants: {
    id: string
    name: string
    grade: string | null
    subject: string | null
    price: number
    duration_minutes: number | null
    session_count: number | null
    products: {
      id: string
      name: string
      category: string
      image_url: string | null
    }
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  'etut': '📚 Etüt Paketi',
  'deneme_sinavi': '📝 Deneme Sınavı',
  'ders_paketi': '🎓 Ders Paketi',
  'video_ders': '🎥 Video Ders'
}

export default function CartPage({ cartItems: initialItems }: { cartItems: CartItem[] }) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState(initialItems)
  const [updating, setUpdating] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [processingPayment, setProcessingPayment] = useState(false)

  async function handleQuantityChange(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return

    setUpdating(itemId)
    try {
      await updateCartItemQuantity(itemId, newQuantity)
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
    } catch (error) {
      setMessage({ type: 'error', text: 'Miktar güncellenemedi' })
    } finally {
      setUpdating(null)
    }
  }

  async function handleRemove(itemId: string) {
    if (!confirm('Bu ürünü sepetten çıkarmak istediğinize emin misiniz?')) return

    setUpdating(itemId)
    try {
      await removeFromCart(itemId)
      setCartItems(prev => prev.filter(item => item.id !== itemId))
      setMessage({ type: 'success', text: 'Ürün sepetten çıkarıldı' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Ürün çıkarılamadı' })
    } finally {
      setUpdating(null)
    }
  }

  async function handleCheckout() {
    setProcessingPayment(true)
    setMessage({ type: '', text: '' })
    
    try {
      console.log('Ödeme başlatılıyor...')
      
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Response:', response.status)

      const data = await response.json()
      console.log('Data:', data)

      if (data.success) {
        router.push(`/odeme?token=${data.token}&orderNumber=${data.orderNumber}`)
      } else {
        setMessage({ type: 'error', text: data.error || 'Ödeme başlatılamadı' })
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setMessage({ type: 'error', text: 'Bir hata oluştu' })
    } finally {
      setProcessingPayment(false)
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price)
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product_variants.price * item.quantity,
    0
  )

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-8xl">🛒</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-4">
            Sepetiniz Boş
          </h2>
          <p className="text-gray-600 mb-8">
            Hemen ürünlerimize göz atın ve sepetinize ekleyin!
          </p>
          <Link
            href="/urunler"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ürünleri İncele
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Sepetim</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol: Sepet Ürünleri */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm p-6 flex gap-6"
              >
                {/* Ürün Görseli */}
                <div className="w-32 h-32 shrink-0 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                  {item.product_variants.products.image_url ? (
                    <img
                      src={item.product_variants.products.image_url}
                      alt={item.product_variants.products.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-4xl">
                      {item.product_variants.products.category === 'etut' && '📚'}
                      {item.product_variants.products.category === 'deneme_sinavi' && '📝'}
                      {item.product_variants.products.category === 'ders_paketi' && '🎓'}
                      {item.product_variants.products.category === 'video_ders' && '🎥'}
                    </span>
                  )}
                </div>

                {/* Ürün Bilgileri */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 mb-2">
                        {CATEGORY_LABELS[item.product_variants.products.category]}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {item.product_variants.products.name}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {item.product_variants.name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={updating === item.id}
                      className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    {item.product_variants.grade && (
                      <span>📚 {item.product_variants.grade}. Sınıf</span>
                    )}
                    {item.product_variants.subject && (
                      <span>📖 {item.product_variants.subject}</span>
                    )}
                    {item.product_variants.duration_minutes && (
                      <span>⏱️ {item.product_variants.duration_minutes} dk</span>
                    )}
                    {item.product_variants.session_count && (
                      <span>📅 {item.product_variants.session_count} seans</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Miktar */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updating === item.id}
                        className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                        className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Fiyat */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(item.product_variants.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.product_variants.price)} x {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ: Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Sipariş Özeti
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Toplam</span>
                <span className="text-blue-600">{formatPrice(subtotal)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processingPayment}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {processingPayment ? 'Hazırlanıyor...' : 'Ödemeye Geç'}
              </button>

              <Link
                href="/urunler"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}