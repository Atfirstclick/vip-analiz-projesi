'use client'

import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  category: string
  base_price: number
  image_url: string | null
  product_variants: Array<{
    id: string
    price: number
  }>
}

const CATEGORY_LABELS: Record<string, string> = {
  'etut': '📚 Etüt Paketi',
  'deneme_sinavi': '📝 Deneme Sınavı',
  'ders_paketi': '🎓 Ders Paketi',
  'video_ders': '🎥 Video Ders'
}

export default function ProductGrid({ products }: { products: Product[] }) {
  function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price)
  }

  function getPriceRange(product: Product) {
    if (!product.product_variants || product.product_variants.length === 0) {
      return formatPrice(product.base_price)
    }

    const prices = product.product_variants.map(v => v.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    if (minPrice === maxPrice) {
      return formatPrice(minPrice)
    }

    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl">🔍</span>
        <p className="mt-4 text-gray-500 text-lg">Henüz aktif ürün bulunmuyor</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map(product => (
        <Link
          key={product.id}
          href={`/urunler/${product.id}`}
          className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
        >
          {/* Ürün Görseli */}
          <div className="h-56 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="text-7xl">
                {product.category === 'etut' && '📚'}
                {product.category === 'deneme_sinavi' && '📝'}
                {product.category === 'ders_paketi' && '🎓'}
                {product.category === 'video_ders' && '🎥'}
              </span>
            )}
          </div>

          {/* Ürün Bilgileri */}
          <div className="p-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mb-3">
              {CATEGORY_LABELS[product.category]}
            </span>

            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500 mb-1">Fiyat</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getPriceRange(product)}
                </p>
              </div>
              <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium group-hover:bg-blue-700 transition-colors">
                İncele →
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}