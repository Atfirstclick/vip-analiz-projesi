'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import ProductForm from './ProductForm'
import VariantModal from './VariantModal'

interface ProductVariant {
  id: string
  product_id: string
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
  base_price: number
  is_active: boolean
  image_url: string | null
  created_at: string
  product_variants: ProductVariant[]
}

const CATEGORY_LABELS: Record<string, string> = {
  'etut': '📚 Etüt Paketi',
  'deneme_sinavi': '📝 Deneme Sınavı',
  'ders_paketi': '🎓 Ders Paketi',
  'video_ders': '🎥 Video Ders'
}

export default function ProductManagement({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function refreshProducts() {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .order('created_at', { ascending: false })
    
    if (data) {
      setProducts(data)
    }
  }

  async function toggleProductStatus(productId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) throw error

      await refreshProducts()
      setMessage({ 
        type: 'success', 
        text: currentStatus ? 'Ürün pasif hale getirildi' : 'Ürün aktif hale getirildi'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingProduct(null)
    refreshProducts()
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  return (
    <div>
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

      {/* Başlık ve Yeni Ürün Butonu */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Toplam {products.length} ürün • {products.filter(p => p.is_active).length} aktif
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Yeni Ürün Ekle
        </button>
      </div>

      {/* Ürün Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div 
            key={product.id} 
            className={`bg-white border rounded-lg shadow-sm overflow-hidden ${
              !product.is_active ? 'opacity-60' : ''
            }`}
          >
            {/* Ürün Görseli */}
            <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">
                  {product.category === 'etut' && '📚'}
                  {product.category === 'deneme_sinavi' && '📝'}
                  {product.category === 'ders_paketi' && '🎓'}
                  {product.category === 'video_ders' && '🎥'}
                </span>
              )}
            </div>

            {/* Ürün Bilgileri */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 mb-2">
                    {CATEGORY_LABELS[product.category]}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.name}
                  </h3>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  product.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Başlangıç Fiyatı: <span className="font-semibold text-gray-900">{formatPrice(product.base_price)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Varyant Sayısı: <span className="font-semibold text-gray-900">{product.product_variants?.length || 0}</span>
                </p>
              </div>

              {/* İşlem Butonları */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowVariantModal(true)
                  }}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                >
                  Varyantlar ({product.product_variants?.length || 0})
                </button>
                <button
                  onClick={() => toggleProductStatus(product.id, product.is_active)}
                  className={`col-span-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    product.is_active
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {product.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
          <span className="text-6xl">📦</span>
          <p className="mt-4 text-gray-500">Henüz ürün eklenmemiş</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            İlk ürünü ekle →
          </button>
        </div>
      )}

      {/* Ürün Formu Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={() => {
            setMessage({ 
              type: 'success', 
              text: editingProduct ? 'Ürün güncellendi!' : 'Ürün eklendi!' 
            })
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
          }}
        />
      )}

      {/* Varyant Modal */}
      {showVariantModal && selectedProduct && (
        <VariantModal
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          initialVariants={selectedProduct.product_variants || []}
          onClose={() => {
            setShowVariantModal(false)
            setSelectedProduct(null)
            refreshProducts()
          }}
        />
      )}
    </div>
  )
}