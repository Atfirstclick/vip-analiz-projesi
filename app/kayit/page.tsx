import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function KayitPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  const signUp = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    
    const supabase = await createClient();
    
    // Kullanıcıyı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (authError) {
      console.error(">>> SUPABASE SIGNUP ERROR:", authError.message);
      return redirect("/kayit?message=kayit-hatali");
    }

    // Profile oluştur (eğer auth başarılıysa)
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: 'student' // Default role
        });

      if (profileError) {
        console.error(">>> PROFILE CREATE ERROR:", profileError.message);
      }
    }
    
    return redirect("/giris?message=kayit-basarili");
  };

  return (
    <div className="min-h-screen flex">
{/* Sol Taraf - İllustration */}
<div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-vip-navy via-vip-navy-light to-vip-navy items-center justify-center p-12 relative overflow-hidden">
  {/* Dekoratif elementler */}
  <div className="absolute top-20 left-20 w-32 h-32 bg-vip-gold/20 rounded-full blur-3xl"></div>
  <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
  
  <div className="relative z-10 text-center text-white">
    {/* SVG İllustration */}
    <div className="mb-8">
      <img 
        src="/images/register-illustration.svg" 
        alt="Kayıt" 
        className="w-full max-w-md mx-auto drop-shadow-2xl"
      />
    </div>
    
    <h3 className="text-3xl font-bold mb-4">Başarıya Giden Yolda Bize Katıl!</h3>
    <p className="text-lg opacity-90 max-w-md mx-auto">
      Uzman öğretmenlerimiz ve bireysel ilgi ile hedeflerine ulaş
    </p>
  </div>
</div>

      {/* Sağ Taraf - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-3xl font-bold text-vip-navy mb-2">VipAnaliz</h1>
              <p className="text-gray-600">Özel Öğretim Kursu</p>
            </Link>
          </div>

          {/* Başlık */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-vip-navy mb-2">Hesap Oluştur</h2>
            <p className="text-gray-600">Ücretsiz hesabınızı oluşturun</p>
          </div>

          {/* Mesajlar */}
          {params?.message === "kayit-hatali" && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
              ❌ Kayıt başarısız oldu. Lütfen tekrar deneyin.
            </div>
          )}

          {/* Form */}
          <form className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-vip-navy mb-2">
                Ad Soyad
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Ahmet Yılmaz"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-vip-gold focus:ring-2 focus:ring-vip-gold/20 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-vip-navy mb-2">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-vip-gold focus:ring-2 focus:ring-vip-gold/20 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-vip-navy mb-2">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-vip-gold focus:ring-2 focus:ring-vip-gold/20 outline-none transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 karakter</p>
            </div>

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                required
                className="w-4 h-4 mt-1 rounded border-gray-300 text-vip-gold focus:ring-vip-gold" 
              />
              <label className="text-sm text-gray-600">
                <a href="#" className="text-vip-gold hover:text-vip-gold-dark">Kullanım Koşulları</a>nı ve{' '}
                <a href="#" className="text-vip-gold hover:text-vip-gold-dark">Gizlilik Politikası</a>nı kabul ediyorum
              </label>
            </div>

            <button
              formAction={signUp}
              className="w-full bg-vip-navy text-white py-3 px-6 rounded-lg font-semibold hover:bg-vip-gold hover:text-vip-navy transition-all shadow-lg hover:shadow-xl"
            >
              Kayıt Ol
            </button>
          </form>

          {/* Giriş Yap Linki */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/giris" className="text-vip-gold hover:text-vip-gold-dark font-semibold">
                Giriş Yap
              </Link>
            </p>
          </div>

          {/* Ana Sayfa Linki */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-vip-navy">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}