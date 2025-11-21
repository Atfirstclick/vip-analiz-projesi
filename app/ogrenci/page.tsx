import { getCurrentUser, createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OgrenciDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Kullanıcı bulunamadı</div>
  }

  const supabase = await createClient()

  // Profile bilgisi
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Randevu sayıları
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)

  const { count: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .gte('appointment_date', new Date().toISOString().split('T')[0])
    .in('status', ['scheduled', 'confirmed'])

  const { count: completedAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('status', 'completed')

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {/* Toplam Randevu */}
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group">
          <div className="p-6 relative">
            {/* Dekoratif background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">
                  Toplam Randevu
                </p>
                <p className="text-5xl font-bold text-white">
                  {totalAppointments || 0}
                </p>
              </div>
              <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
                📅
              </div>
            </div>
          </div>
          <div className="bg-white/10 px-6 py-3">
            <p className="text-xs text-blue-100">Tüm randevularınız</p>
          </div>
        </div>

        {/* Yaklaşan Randevular */}
        <div className="bg-linear-to-br from-vip-gold to-yellow-500 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group">
          <div className="p-6 relative">
            {/* Dekoratif background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-yellow-900 text-sm font-medium mb-2">
                  Yaklaşan Randevular
                </p>
                <p className="text-5xl font-bold text-vip-navy">
                  {upcomingAppointments || 0}
                </p>
              </div>
              <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
                ⏰
              </div>
            </div>
          </div>
          <div className="bg-vip-navy/20 px-6 py-3">
            <p className="text-xs text-vip-navy font-medium">Planlanmış dersleriniz</p>
          </div>
        </div>

        {/* Tamamlanan */}
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group">
          <div className="p-6 relative">
            {/* Dekoratif background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-green-100 text-sm font-medium mb-2">
                  Tamamlanan
                </p>
                <p className="text-5xl font-bold text-white">
                  {completedAppointments || 0}
                </p>
              </div>
              <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
                ✅
              </div>
            </div>
          </div>
          <div className="bg-white/10 px-6 py-3">
            <p className="text-xs text-green-100">Başarıyla tamamlandı</p>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div>
        <h2 className="text-2xl font-bold text-vip-navy mb-6 flex items-center gap-2">
          <span>⚡</span> Hızlı Erişim
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Randevu Al */}
          <Link
            href="/ogrenci/randevu-al"
            className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-vip-gold relative overflow-hidden"
          >
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-vip-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                📅
              </div>
              <h3 className="text-xl font-bold text-vip-navy mb-2 group-hover:text-blue-600 transition-colors">
                Randevu Al
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Öğretmenlerden yeni randevu alın ve ders programınızı oluşturun
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-vip-gold transition-colors">
                Randevu almaya başla
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </div>
          </Link>

          {/* Randevularım */}
          <Link
            href="/ogrenci/randevularim"
            className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-vip-gold relative overflow-hidden"
          >
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-vip-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="text-xl font-bold text-vip-navy mb-2 group-hover:text-green-600 transition-colors">
                Randevularım
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Randevularınızı görüntüleyin, yönetin ve detaylarını inceleyin
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-green-600 group-hover:text-vip-gold transition-colors">
                Randevulara git
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </div>
          </Link>

          {/* Derslerim - Coming Soon */}
          <div className="bg-linear-to-br from-gray-100 to-gray-200 p-6 rounded-2xl shadow-md border-2 border-gray-300 relative overflow-hidden cursor-not-allowed">
            <div className="absolute top-4 right-4 bg-vip-navy text-white text-xs font-bold px-3 py-1 rounded-full">
              YAKINDA
            </div>
            
            <div className="opacity-60">
              <div className="w-14 h-14 rounded-xl bg-gray-300 flex items-center justify-center text-3xl mb-4">
                📚
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Derslerim
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sınıf sistemi ile grup derslerinizi görüntüleyin
              </p>
              <div className="mt-4 text-xs text-gray-500 font-medium">
                FAZ 3.4 - Sınıf Sistemi ile gelecek
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}