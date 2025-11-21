import { redirect } from 'next/navigation'
import { isAdmin, getCurrentUser } from '@/lib/supabase/server'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/giris')
  }

  const adminCheck = await isAdmin()
  
  if (!adminCheck) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-lg border-b-2 border-vip-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Sol - Logo & Nav Links */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/admin" className="flex items-center gap-3">
                <Logo size="sm" />
                <div>
                  <span className="block text-lg font-bold text-vip-navy">
                    Admin Panel
                  </span>
                  <span className="block text-xs text-vip-navy font-semibold">
                    VipAnaliz Yönetim
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/admin/kullanicilar"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  👥 Kullanıcılar
                </Link>
                <Link
                  href="/admin/urunler"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  🛍️ Ürünler
                </Link>
                <Link
                  href="/admin/dersler"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  📚 Dersler
                </Link>
                <Link
                  href="/admin/ogretmenler"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  👨‍🏫 Öğretmenler
                </Link>
                <Link
                  href="/admin/siniflar"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy transition-all"
                >
                  🏫 Sınıflar
                </Link>
              </div>
            </div>

            {/* Sağ - Ana Sayfa Link */}
            <div className="flex items-center">
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
            href="/admin"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/kullanicilar"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            👥 Kullanıcılar
          </Link>
          <Link
            href="/admin/urunler"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            🛍️ Ürünler
          </Link>
          <Link
            href="/admin/dersler"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            📚 Dersler
          </Link>
          <Link
            href="/admin/ogretmenler"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            👨‍🏫 Öğretmenler
          </Link>
          <Link
            href="/admin/siniflar"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-vip-gold/10 hover:text-vip-navy whitespace-nowrap"
          >
            🏫 Sınıflar
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