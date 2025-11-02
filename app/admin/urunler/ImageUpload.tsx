'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (url: string) => void
  productName?: string
}

export default function ImageUpload({ 
  currentImageUrl, 
  onImageUploaded,
  productName 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImageUrl || '')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya kontrolü
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setError('Dosya boyutu 2MB\'dan küçük olmalıdır')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setError('Sadece JPG, PNG veya WebP formatında resim yükleyebilirsiniz')
      return
    }

    try {
      setUploading(true)
      setError('')

      // Unique dosya adı oluştur
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Önizleme için local URL
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

      // Supabase Storage'a yükle
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      onImageUploaded(publicUrl)
      setPreview(publicUrl)
    } catch (err: any) {
      setError(err.message)
      setPreview(currentImageUrl || '')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview('')
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Ürün Görseli
      </label>
      
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Önizleme */}
        <div className="flex-shrink-0">
          <div className="w-48 h-27 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
            {preview ? (
              <img 
                src={preview} 
                alt="Önizleme" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-4xl">📷</span>
                <p className="text-xs text-gray-500 mt-2">Görsel yok</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Butonları */}
        <div className="flex-1">
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400 text-sm font-medium"
            >
              {uploading ? 'Yükleniyor...' : '📁 Bilgisayardan Seç'}
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                🗑️ Görseli Kaldır
              </button>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <p>• Önerilen boyut: 800x450px (16:9)</p>
            <p>• Format: JPG, PNG veya WebP</p>
            <p>• Maksimum: 2MB</p>
          </div>
        </div>
      </div>
    </div>
  )
}