// app/page.tsx

import { createClient } from "@/lib/supabase/server"; // @ sembolü src veya kök dizini temsil eder, Next.js bunu otomatik ayarlar.

export default async function HomePage() {
  // Sunucu tarafında çalışacak Supabase istemcisini oluşturuyoruz.
  const supabase = await createClient();

  // 'dersler' tablosundan tüm verileri çekiyoruz.
  // select('*') -> tüm sütunları seç demek.
  const { data: dersler, error } = await supabase.from('dersler').select('*');

  // Eğer veri çekerken bir hata olursa, hatayı konsolda göster.
  if (error) {
    console.error('Dersler çekilirken hata oluştu:', error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">VipAnaliz Dersleri</h1>

      <div className="w-full max-w-2xl">
        {dersler && dersler.length > 0 ? (
          <ul className="space-y-4">
            {dersler.map((ders) => (
              <li key={ders.id} className="p-4 bg-gray-100 rounded-lg shadow">
                <h2 className="text-2xl font-semibold text-gray-800">{ders.isim}</h2>
                <p className="text-gray-600">{ders.aciklama}</p>
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
