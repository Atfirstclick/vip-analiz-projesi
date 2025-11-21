import { getUserProfile, getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Kullanıcı bulunamadı</div>
  }

  const profile = await getUserProfile(user.id)
  const supabase = await createClient()

  // Kullanıcı istatistikleri
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  const { count: totalTeachers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'teacher')

  const { count: totalAdmins } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  // Ders istatistikleri
  const { count: totalSubjects } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })

  const { count: activeSubjects } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div>
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-vip-navy mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Hoş geldiniz, <span className="font-semibold text-vip-navy">{profile?.full_name}</span>
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {/* Toplam Kullanıcı */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-blue-600">{totalUsers || 0}</p>
            </div>
            <div className="text-3xl opacity-20">👥</div>
          </div>
        </div>

        {/* Öğrenciler */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Öğrenciler</p>
              <p className="text-3xl font-bold text-green-600">{totalStudents || 0}</p>
            </div>
            <div className="text-3xl opacity-20">👨‍🎓</div>
          </div>
        </div>

        {/* Öğretmenler */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Öğretmenler</p>
              <p className="text-3xl font-bold text-purple-600">{totalTeachers || 0}</p>
            </div>
            <div className="text-3xl opacity-20">👨‍🏫</div>
          </div>
        </div>

        {/* Yöneticiler */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-vip-gold">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Yöneticiler</p>
              <p className="text-3xl font-bold text-vip-navy">{totalAdmins || 0}</p>
            </div>
            <div className="text-3xl opacity-20">👑</div>
          </div>
        </div>

        {/* Dersler */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Dersler</p>
              <p className="text-3xl font-bold text-pink-600">
                {activeSubjects || 0}
                <span className="text-sm text-gray-500">/{totalSubjects || 0}</span>
              </p>
            </div>
            <div className="text-3xl opacity-20">📚</div>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div>
        <h2 className="text-2xl font-bold text-vip-navy mb-4 flex items-center gap-2">
          <span>⚡</span>
          Hızlı Erişim
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Kullanıcı Yönetimi */}
          <Link
            href="/admin/kullanicilar"
            className="group bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-vip-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-vip-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-lg font-bold text-vip-navy mb-2">
                Kullanıcı Yönetimi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kullanıcıları görüntüle, ekle, sil ve rollerini yönet
              </p>
            </div>
          </Link>

          {/* Ürün Yönetimi */}
          <Link
            href="/admin/urunler"
            className="group bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-vip-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-vip-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                📦
              </div>
              <h3 className="text-lg font-bold text-vip-navy mb-2">
                Ürün Yönetimi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ürünleri ve varyantlarını yönet
              </p>
            </div>
          </Link>

          {/* Ders Yönetimi */}
          <Link
            href="/admin/dersler"
            className="group bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-vip-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-vip-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-lg font-bold text-vip-navy mb-2">
                Ders Yönetimi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dersleri görüntüle, ekle, düzenle ve öğretmen ata
              </p>
            </div>
          </Link>

          {/* Öğretmen Yönetimi */}
          <Link
            href="/admin/ogretmenler"
            className="group bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-vip-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-vip-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                👨‍🏫
              </div>
              <h3 className="text-lg font-bold text-vip-navy mb-2">
                Öğretmen Yönetimi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Öğretmenleri yönet, onayla ve ders atamalarını düzenle
              </p>
            </div>
          </Link>

          {/* Sınıf Yönetimi */}
          <Link
            href="/admin/siniflar"
            className="group bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-vip-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-vip-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                🏫
              </div>
              <h3 className="text-lg font-bold text-vip-navy mb-2">
                Sınıf Yönetimi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sınıfları oluştur, düzenle ve öğrenci atamalarını yönet
              </p>
            </div>
          </Link>

          {/* Randevu Yönetimi - Coming Soon */}
          <div className="bg-linear-to-br from-gray-100 to-gray-200 p-5 rounded-xl shadow-md border-2 border-gray-300 relative overflow-hidden cursor-not-allowed">
            <div className="absolute top-3 right-3 bg-vip-navy text-white text-xs font-bold px-2 py-1 rounded-full">
              YAKINDA
            </div>
            <div className="opacity-60">
              <div className="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center text-2xl mb-3">
                📅
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                Randevu Yönetimi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Yakında... (FAZ 3.2-3.3)
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}