import { redirect } from 'next/navigation'
import { getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default async function OgrenciLayout({
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

  // Öğrenci kontrolü
  if (profile?.role !== 'student') {
    redirect('/')
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
              <Link href="/ogrenci" className="flex items-center gap-3">
                <Logo size="sm" />
                <div>
                  <span className="block text-lg font-bold text-vip-navy">
                    Öğrenci Paneli
                  </span>
                  <span className="block text-xs text-gray-500">
                    VipAnaliz
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/ogrenci"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/ogrenci/randevu-al"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  📅 Randevu Al
                </Link>
                <Link
                  href="/ogrenci/randevularim"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  📋 Randevularım
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
                    {profile?.full_name || 'Öğrenci'}
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
            href="/ogrenci"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/ogrenci/randevu-al"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            📅 Randevu Al
          </Link>
          <Link
            href="/ogrenci/randevularim"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            📋 Randevularım
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