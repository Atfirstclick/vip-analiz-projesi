import { redirect } from 'next/navigation'
import { getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default async function OgretmenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/giris')
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
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-vip-navy mb-2">
              Öğretmen Kaydı Bulunamadı
            </h1>
          </div>
          <p className="text-gray-600 mb-6 text-center leading-relaxed">
            Hesabınız öğretmen olarak kayıtlı değil. Lütfen yönetici ile iletişime geçin.
          </p>
          <Link
            href="/"
            className="block w-full bg-vip-navy text-white text-center px-6 py-3 rounded-xl font-bold hover:bg-vip-gold hover:text-vip-navy transition-all shadow-lg"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  if (!teacher.is_active) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-2 border-orange-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-vip-navy mb-2">
              Hesap Pasif
            </h1>
          </div>
          <p className="text-gray-600 mb-6 text-center leading-relaxed">
            Öğretmen hesabınız şu anda pasif durumda. Lütfen yönetici ile iletişime geçin.
          </p>
          <Link
            href="/"
            className="block w-full bg-vip-navy text-white text-center px-6 py-3 rounded-xl font-bold hover:bg-vip-gold hover:text-vip-navy transition-all shadow-lg"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md border-b-2 border-vip-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Sol - Logo & Nav Links */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/ogretmen" className="flex items-center gap-3">
                <Logo size="sm" />
                <div>
                  <span className="block text-lg font-bold text-vip-navy">
                    Öğretmen Paneli
                  </span>
                  <span className="block text-xs text-gray-500">
                    VipAnaliz
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/ogretmen"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/ogretmen/takvim"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  📅 Takvim
                </Link>
                <Link
                  href="/ogretmen/randevularim"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  📋 Randevularım
                </Link>
                <Link
                  href="/ogretmen/profil"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  👤 Profil
                </Link>
              </div>
            </div>

            {/* Sağ - User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-vip-gold/10 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-vip-navy text-white flex items-center justify-center font-bold">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'Ö'}
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 text-xs">Hoş geldin,</p>
                  <p className="font-semibold text-vip-navy">
                    {profile?.full_name || 'Öğretmen'}
                  </p>
                </div>
              </div>

              {/* Ana Sayfa Link */}
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-vip-navy transition-colors"
              >
                ← Ana Sayfa
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 px-4 py-3 flex gap-2 overflow-x-auto">
          <Link
            href="/ogretmen"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/ogretmen/takvim"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            📅 Takvim
          </Link>
          <Link
            href="/ogretmen/randevularim"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            📋 Randevularım
          </Link>
          <Link
            href="/ogretmen/profil"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            👤 Profil
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}