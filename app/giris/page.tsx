import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  const signIn = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();
    
    // Auth ile giriş yap
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (authError) {
      return redirect("/giris?message=login-hatali");
    }

    // Kullanıcının rolünü al
    if (authData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      // Role'e göre yönlendir
      if (profile?.role === 'admin') {
        return redirect("/admin");
      } else if (profile?.role === 'teacher') {
        return redirect("/ogretmen");
      } else if (profile?.role === 'student') {
        return redirect("/ogrenci");
      }
    }
    
    // Default olarak ana sayfa
    return redirect("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sol Taraf - Form */}
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
            <h2 className="text-3xl font-bold text-vip-navy mb-2">Hoş Geldiniz!</h2>
            <p className="text-gray-600">Hesabınıza giriş yapın</p>
          </div>

          {/* Mesajlar */}
          {params?.message === "login-hatali" && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
              ❌ Giriş bilgileri hatalı. Lütfen tekrar deneyin.
            </div>
          )}
          {params?.message === "kayit-basarili" && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-800">
              ✓ Kayıt başarılı! Şimdi giriş yapabilirsiniz.
            </div>
          )}

          {/* Form */}
          <form className="space-y-6">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-vip-gold focus:ring-2 focus:ring-vip-gold/20 outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-vip-gold focus:ring-vip-gold" />
                <span className="text-gray-600">Beni hatırla</span>
              </label>
              <a href="#" className="text-vip-gold hover:text-vip-gold-dark font-medium">
                Şifremi unuttum?
              </a>
            </div>

            <button
              formAction={signIn}
              className="w-full bg-vip-navy text-white py-3 px-6 rounded-lg font-semibold hover:bg-vip-gold hover:text-vip-navy transition-all shadow-lg hover:shadow-xl"
            >
              Giriş Yap
            </button>
          </form>

          {/* Kayıt Ol Linki */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Hesabınız yok mu?{' '}
              <Link href="/kayit" className="text-vip-gold hover:text-vip-gold-dark font-semibold">
                Kayıt Ol
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

      {/* Sağ Taraf - İllustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-vip-gold via-vip-gold-light to-vip-gold items-center justify-center p-12 relative overflow-hidden">
        {/* Dekoratif elementler */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-vip-navy/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center text-vip-navy">
          {/* SVG İllustration */}
          <div className="mb-8">
            <img 
              src="/images/login-illustration.svg" 
              alt="Giriş" 
              className="w-full max-w-md mx-auto drop-shadow-lg"
            />
          </div>
          
          <h3 className="text-3xl font-bold mb-4">Eğitim Yolculuğunuz Başlasın!</h3>
          <p className="text-lg opacity-90 max-w-md mx-auto">
            VIP sınıflarımızda maksimum 3 kişilik gruplarla bireysel ilgi ve başarı garantisi
          </p>
        </div>
      </div>
    </div>
  );
}