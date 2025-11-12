import { redirect } from 'next/navigation'
import { getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OgretmenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Kullanıcının profilini kontrol et
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // Öğretmen kontrolü
  if (profile?.role !== 'teacher') {
    redirect('/')
  }

  // Teacher kaydını kontrol et
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, is_active, is_verified')
    .eq('user_id', user.id)
    .single()

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Öğretmen Kaydı Bulunamadı
          </h1>
          <p className="text-gray-600 mb-4">
            Hesabınız öğretmen olarak kayıtlı değil. Lütfen yönetici ile iletişime geçin.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  if (!teacher.is_active) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Hesap Pasif
          </h1>
          <p className="text-gray-600 mb-4">
            Öğretmen hesabınız şu anda pasif durumda. Lütfen yönetici ile iletişime geçin.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Öğretmen Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <span className="text-2xl">👨‍🏫</span>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Öğretmen Paneli
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/ogretmen"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/ogretmen/takvim"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  📅 Takvim
                </Link>
                <Link
                  href="/ogretmen/randevularim"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  📋 Randevularım
                </Link>
                <Link
                  href="/ogretmen/profil"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  👤 Profil
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hoş geldin, <span className="font-semibold">{profile?.full_name}</span>
              </span>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}