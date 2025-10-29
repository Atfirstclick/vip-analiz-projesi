// app/profil/page.tsx

import { createClient } from "@/lib/supabase/server";

export default async function ProfilPage() {
  const supabase = await createClient();

  // Mevcut kullanıcı oturum bilgisini çekiyoruz.
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Profil Sayfası</h1>
      <p>Bu sayfa, sadece giriş yapmış kullanıcılar tarafından görülebilmelidir.</p>
      
      {user ? (
        <div>
          <h2>Kullanıcı Bilgileri:</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      ) : (
        <p>Kullanıcı bilgileri yüklenemedi veya giriş yapılmamış.</p>
      )}
    </div>
  );
}
