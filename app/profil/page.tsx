'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  phone: string | null;
}

export default function ProfilPage() {
  const router = useRouter();
  
  // Supabase client oluştur
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      setMessage({ type: 'error', text: 'Profil yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
      await getProfile();
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      setMessage({ type: 'error', text: 'Profil güncellenemedi.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profilim</h1>
            <p className="text-gray-600 mb-8">Profil bilgilerinizi görüntüleyin ve güncelleyin</p>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm text-gray-600">Rol:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : profile?.role === 'teacher'
                  ? 'bg-blue-100 text-blue-800'
                  : profile?.role === 'parent'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {profile?.role === 'admin' && '👑 Yönetici'}
                {profile?.role === 'teacher' && '👨‍🏫 Öğretmen'}
                {profile?.role === 'parent' && '👪 Veli'}
                {profile?.role === 'student' && '👨‍🎓 Öğrenci'}
              </span>
            </div>

            <form onSubmit={updateProfile} className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0555 123 45 67"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Kaydediliyor...' : 'Profili Güncelle'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Geri Dön
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 bg-white shadow rounded-lg px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Kullanıcı ID:</span>
              <span className="text-gray-900 font-mono text-xs">{profile?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hesap Durumu:</span>
              <span className="text-green-600 font-medium">✓ Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}