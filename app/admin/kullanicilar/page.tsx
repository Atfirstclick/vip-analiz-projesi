import { createClient } from '@/lib/supabase/server'
import UserManagementClient from './UserManagementClient'

export default async function KullanicilarPage() {
  const supabase = await createClient()

  // Tüm kullanıcıları çek (artık email de profiles'ta)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Sistemdeki tüm kullanıcıları görüntüle ve rollerini yönet
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <UserManagementClient users={users || []} />
      </div>
    </div>
  )
}