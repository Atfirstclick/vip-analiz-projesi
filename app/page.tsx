// app/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  // Mevcut kullanıcı oturum bilgisini çekiyoruz.
  const { data: { user } } = await supabase.auth.getUser();

  // Dersler verisini çekiyoruz.
  const { data: dersler } = await supabase.from('dersler').select('*');

  // Çıkış yapma fonksiyonu (Server Action)
  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login"); // Çıkış yaptıktan sonra login sayfasına yönlendir
  };

  return (
    <main style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>VipAnaliz Dersleri</h1>
        
        {/* KULLANICI DURUMUNA GÖRE DİNAMİK ALAN */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Merhaba, {user.email}</span>
            <form>
              <button formAction={signOut}>Çıkış Yap</button>
            </form>
          </div>
        ) : (
          <a href="/login">
            <button>Giriş Yap</button>
          </a>
        )}
      </div>

      {/* DERS LİSTESİ */}
      <div>
        {dersler && dersler.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dersler.map((ders) => (
              <li key={ders.id} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{ders.isim}</h2>
                <p style={{ color: '#555', margin: '0.5rem 0 0 0' }}>{ders.aciklama}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Gösterilecek ders bulunamadı.</p>
        )}
      </div>
    </main>
  );
}
