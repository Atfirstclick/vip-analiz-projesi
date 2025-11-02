'use client'

import { useState, useEffect } from 'react'
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

interface VariantModalProps {
  productId: string
  productName: string
  onClose: () => void
  initialVariants: Variant[]
}

export default function VariantModal({ 
  productId, 
  productName, 
  onClose,
  initialVariants 
}: VariantModalProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants)
  const [showForm, setShowForm] = useState(false)
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    subject: '',
    price: '',
    duration_minutes: '',
    session_count: '',
    stock_quantity: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (editingVariant) {
      setFormData({
        name: editingVariant.name,
        grade: editingVariant.grade || '',
        subject: editingVariant.subject || '',
        price: editingVariant.price.toString(),
        duration_minutes: editingVariant.duration_minutes?.toString() || '',
        session_count: editingVariant.session_count?.toString() || '',
        stock_quantity: editingVariant.stock_quantity?.toString() || '',
        is_active: editingVariant.is_active
      })
      setShowForm(true)
    }
  }, [editingVariant])

  async function refreshVariants() {
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    
    if (data) {
      setVariants(data)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const variantData = {
        product_id: productId,
        name: formData.name,
        grade: formData.grade || null,
        subject: formData.subject || null,
        price: parseFloat(formData.price),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        session_count: formData.session_count ? parseInt(formData.session_count) : null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        is_active: formData.is_active
      }

      if (editingVariant) {
        const { error } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', editingVariant.id)
        
        if (error) throw error
        setMessage({ type: 'success', text: 'Varyant güncellendi!' })
      } else {
        const { error } = await supabase
          .from('product_variants')
          .insert(variantData)
        
        if (error) throw error
        setMessage({ type: 'success', text: 'Varyant eklendi!' })
      }

      await refreshVariants()
      resetForm()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function deleteVariant(variantId: string) {
    if (!confirm('Bu varyantı silmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)
      
      if (error) throw error
      
      await refreshVariants()
      setMessage({ type: 'success', text: 'Varyant silindi!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      grade: '',
      subject: '',
      price: '',
      duration_minutes: '',
      session_count: '',
      stock_quantity: '',
      is_active: true
    })
    setEditingVariant(null)
    setShowForm(false)
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Varyant Yönetimi</h2>
              <p className="text-sm text-gray-600 mt-1">{productName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Mesaj */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Varyant Listesi */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Mevcut Varyantlar ({variants.length})
              </h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {showForm ? 'Listeyi Göster' : '+ Yeni Varyant'}
              </button>
            </div>

            {!showForm && (
              <div className="space-y-3">
                {variants.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <span className="text-4xl">📦</span>
                    <p className="mt-2 text-gray-500">Henüz varyant eklenmemiş</p>
                  </div>
                ) : (
                  variants.map(variant => (
                    <div 
                      key={variant.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{variant.name}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            variant.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {variant.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          {variant.grade && <div>📚 Sınıf: {variant.grade}</div>}
                          {variant.subject && <div>📖 Ders: {variant.subject}</div>}
                          <div>💰 Fiyat: {formatPrice(variant.price)}</div>
                          {variant.duration_minutes && <div>⏱️ Süre: {variant.duration_minutes} dk</div>}
                          {variant.session_count && <div>📅 Seans: {variant.session_count}</div>}
                          {variant.stock_quantity !== null && <div>📦 Stok: {variant.stock_quantity}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingVariant(variant)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => deleteVariant(variant.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Varyant Formu */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900">
                {editingVariant ? 'Varyantı Düzenle' : 'Yeni Varyant Ekle'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Varyant Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="örn: 9. Sınıf Matematik"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sınıf
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="örn: 9, 10, 11, 12, YKS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ders
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="örn: Matematik, Fizik"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Süre (dakika)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="örn: 600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seans Sayısı
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.session_count}
                    onChange={(e) => setFormData({ ...formData, session_count: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="örn: 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok (boş = sınırsız)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Boş bırakılırsa sınırsız"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="variant_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="variant_active" className="ml-2 text-sm text-gray-700">
                    Varyant aktif
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Kaydediliyor...' : editingVariant ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}