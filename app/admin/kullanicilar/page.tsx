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
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        Kullanıcılar yüklenirken hata: {error.message}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Kullanıcıları görüntüle, ekle, sil ve rollerini yönet
        </p>
      </div>

      <UserManagementClient users={users || []} />
    </div>
  )
}