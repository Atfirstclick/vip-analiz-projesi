import { createBrowserClient } from '@supabase/ssr'

export async function uploadProfilePhoto(file: File, userId: string): Promise<string | null> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Dosya boyutu kontrolü (2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Dosya boyutu 2MB\'dan büyük olamaz')
  }

  // Dosya tipi kontrolü
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Sadece JPG, PNG ve WebP formatları desteklenir')
  }

  // Dosya adı oluştur (unique)
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  // Eski fotoğrafı sil (varsa)
  const { data: existingFiles } = await supabase.storage
    .from('teacher-profiles')
    .list(userId)

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`)
    await supabase.storage
      .from('teacher-profiles')
      .remove(filesToDelete)
  }

  // Yeni fotoğrafı yükle
  const { data, error } = await supabase.storage
    .from('teacher-profiles')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    throw error
  }

  // ✅ PUBLIC URL AL (artık çalışacak!)
  const { data: { publicUrl } } = supabase.storage
    .from('teacher-profiles')
    .getPublicUrl(data.path)

  console.log('Public URL:', publicUrl)

  return publicUrl
}