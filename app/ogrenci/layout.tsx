import { redirect } from 'next/navigation'
import { getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OgrenciLayout({
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

  // Öğrenci kontrolü
  if (profile?.role !== 'student') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Öğrenci Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <span className="text-2xl">👨‍🎓</span>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Öğrenci Paneli
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/ogrenci"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/ogrenci/randevu-al"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  📅 Randevu Al
                </Link>
                <Link
                  href="/ogrenci/randevularim"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  📋 Randevularım
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