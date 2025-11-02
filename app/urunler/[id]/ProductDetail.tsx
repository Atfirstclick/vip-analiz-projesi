'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/cart'
import { createBrowserClient } from '@supabase/ssr'

interface Variant {
  id: string
  name: string
  grade: string | null
  subject: string | null
  price: number
  duration_minutes: number | null
  session_count: number | null
  stock_quantity: number | null
  is_active: boolean
}

interface Product {
  id: string
  name: string
  description: string | null
  category: string
  image_url: string | null
  product_variants: Variant[]
}

const CATEGORY_LABELS: Record<string, string> = {
  'etut': '📚 Etüt Paketi',
  'deneme_sinavi': '📝 Deneme Sınavı',
  'ders_paketi': '🎓 Ders Paketi',
  'video_ders': '🎥 Video Ders'
}

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.product_variants[0] || null
  )
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleAddToCart() {
    if (!selectedVariant) {
      setMessage({ type: 'error', text: 'Lütfen bir seçenek seçin' })
      return
    }

    setAdding(true)
    setMessage({ type: '', text: '' })

    try {
      // Kullanıcı giriş yapmış mı kontrol et
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const result = await addToCart(user.id, selectedVariant.id, 1)

      if (result.success) {
        setMessage({ type: 'success', text: '✓ Sepete eklendi!' })
        setTimeout(() => {
          router.push('/sepet')
        }, 1000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Bir hata oluştu' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' })
    } finally {
      setAdding(false)
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Geri Butonu */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8 font-medium"
      >
        ← Geri Dön
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sol: Ürün Görseli */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-12">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <span className="text-9xl">
                {product.category === 'etut' && '📚'}
                {product.category === 'deneme_sinavi' && '📝'}
                {product.category === 'ders_paketi' && '🎓'}
                {product.category === 'video_ders' && '🎥'}
              </span>
            )}
          </div>

          {/* Sağ: Ürün Bilgileri */}
          <div className="p-8">
            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 mb-4">
              {CATEGORY_LABELS[product.category]}
            </span>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Varyant Seçimi */}
            {product.product_variants.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Seçenekler
                </label>
                <div className="space-y-3">
                  {product.product_variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{variant.name}</p>
                          <div className="flex gap-4 mt-1 text-sm text-gray-600">
                            {variant.grade && <span>📚 {variant.grade}. Sınıf</span>}
                            {variant.subject && <span>📖 {variant.subject}</span>}
                            {variant.duration_minutes && (
                              <span>⏱️ {variant.duration_minutes} dk</span>
                            )}
                            {variant.session_count && (
                              <span>📅 {variant.session_count} seans</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(variant.price)}
                          </p>
                          {variant.stock_quantity !== null && (
                            <p className="text-xs text-gray-500 mt-1">
                              Stok: {variant.stock_quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mesaj */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Sepete Ekle Butonu */}
            <button
              onClick={handleAddToCart}
              disabled={adding || !selectedVariant}
              className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? 'Ekleniyor...' : '🛒 Sepete Ekle'}
            </button>

            {/* Ürün Özellikleri */}
            {selectedVariant && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">Paket İçeriği</h3>
                <ul className="space-y-2 text-gray-600">
                  {selectedVariant.session_count && (
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {selectedVariant.session_count} adet birebir etüt seansı
                    </li>
                  )}
                  {selectedVariant.duration_minutes && (
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Toplam {selectedVariant.duration_minutes} dakika ders
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Uzman öğretmen desteği
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Kişiye özel ders programı
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}