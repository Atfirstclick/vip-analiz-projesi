import { createClient } from '@/lib/supabase/server'
import UserManagementClient from './UserManagementClient'

export default async function KullanicilarPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, phone, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl">
        <p className="font-semibold">Kullanıcılar yüklenirken hata: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-vip-navy mb-2 flex items-center gap-3">
          <span>👥</span>
          Kullanıcı Yönetimi
        </h1>
        <p className="text-lg text-gray-600">
          Kullanıcıları görüntüle, ekle, sil ve rollerini yönet
        </p>
      </div>

      <UserManagementClient users={users || []} />
    </div>
  )
}